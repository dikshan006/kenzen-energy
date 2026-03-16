import path from "node:path"
import { pathToFileURL } from "node:url"

import { PDFParse } from "pdf-parse"

import { logParserFailure } from "@/lib/monitoring"

const OCR_TEXT_LENGTH_THRESHOLD = 50
const OCR_ALPHANUMERIC_THRESHOLD = 30
const OCR_PDF_PAGE_LIMIT = 3
const OCR_LANGUAGE = "eng"
const OCR_LANG_PATH = process.env.TESSERACT_LANG_PATH
const PDF_WORKER_PATH = pathToFileURL(
  path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
).href

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
])

export type BillExtractionSource = "pdf-text" | "pdf-ocr" | "image-ocr"

export interface BillTextExtractionResult {
  text: string
  source: BillExtractionSource
  ocrUsed: boolean
  rawTextLength: number
}

export function isSupportedBillMimeType(mimeType: string) {
  return mimeType === "application/pdf" || SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)
}

function normalizeExtractedText(rawText: string) {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, " ")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim()
}

export function shouldUseOcrFallback(rawText: string) {
  const normalizedText = normalizeExtractedText(rawText)
  const alphanumericCount = (normalizedText.match(/[a-z0-9]/gi) ?? []).length

  return (
    normalizedText.length === 0 ||
    normalizedText.length < OCR_TEXT_LENGTH_THRESHOLD ||
    alphanumericCount < OCR_ALPHANUMERIC_THRESHOLD
  )
}

async function recognizeImageBuffer(buffer: Buffer) {
  const tesseractModule = await import("tesseract.js")
  const recognize =
    "recognize" in tesseractModule
      ? tesseractModule.recognize
      : tesseractModule.default.recognize
  const result = await recognize(
    buffer,
    OCR_LANGUAGE,
    OCR_LANG_PATH ? { langPath: OCR_LANG_PATH } : undefined,
  )
  return normalizeExtractedText(result.data.text)
}

async function extractTextFromPdfBuffer(pdfBuffer: Buffer, filename: string) {
  PDFParse.setWorker(PDF_WORKER_PATH)
  const parser = new PDFParse({ data: pdfBuffer })

  try {
    const textResult = await parser.getText({
      lineEnforce: true,
      pageJoiner: "\n",
    })
    const extractedText = normalizeExtractedText(textResult.text)

    if (!shouldUseOcrFallback(extractedText)) {
      return {
        text: extractedText,
        source: "pdf-text" as const,
        ocrUsed: false,
        rawTextLength: extractedText.length,
      }
    }

    logParserFailure("PDF text extraction returned too little text. Attempting OCR fallback.", {
      filename,
      extractedLength: extractedText.length,
    })

    try {
      // We render only the first few pages to keep OCR latency bounded while still
      // covering the typical 1-3 page utility bill layout.
      const screenshotResult = await parser.getScreenshot({
        first: OCR_PDF_PAGE_LIMIT,
        scale: 2,
        imageBuffer: true,
        imageDataUrl: false,
      })

      const ocrPages = await Promise.all(
        screenshotResult.pages.map(async (page) => {
          try {
            return await recognizeImageBuffer(Buffer.from(page.data))
          } catch (error) {
            logParserFailure("OCR failed while reading a rendered PDF page.", {
              filename,
              pageNumber: page.pageNumber,
              message: error instanceof Error ? error.message : "Unknown OCR error",
              langPathConfigured: Boolean(OCR_LANG_PATH),
            })
            throw error
          }
        }),
      )
      const ocrText = normalizeExtractedText(ocrPages.join("\n\n"))

      if (shouldUseOcrFallback(ocrText)) {
        logParserFailure("OCR fallback could not recover enough text from the PDF.", {
          filename,
          extractedLength: extractedText.length,
          ocrLength: ocrText.length,
        })
        return {
          text: ocrText || extractedText,
          source: "pdf-ocr" as const,
          ocrUsed: true,
          rawTextLength: (ocrText || extractedText).length,
        }
      }

      return {
        text: ocrText,
        source: "pdf-ocr" as const,
        ocrUsed: true,
        rawTextLength: ocrText.length,
      }
    } catch (error) {
      // If OCR infrastructure fails but we still have some text from pdf-parse,
      // prefer continuing with that partial text rather than failing the upload.
      logParserFailure("OCR fallback failed. Continuing with direct PDF text extraction.", {
        filename,
        extractedLength: extractedText.length,
        message: error instanceof Error ? error.message : "Unknown OCR fallback error",
        langPathConfigured: Boolean(OCR_LANG_PATH),
      })
      return {
        text: extractedText,
        source: "pdf-text" as const,
        ocrUsed: false,
        rawTextLength: extractedText.length,
      }
    }
  } finally {
    await parser.destroy().catch(() => undefined)
  }
}

async function extractTextFromImageBuffer(imageBuffer: Buffer) {
  const text = await recognizeImageBuffer(imageBuffer)

  return {
    text,
    source: "image-ocr" as const,
    ocrUsed: true,
    rawTextLength: text.length,
  }
}

export async function extractBillText(file: File): Promise<BillTextExtractionResult> {
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)

  if (file.type === "application/pdf") {
    return extractTextFromPdfBuffer(fileBuffer, file.name)
  }

  if (SUPPORTED_IMAGE_MIME_TYPES.has(file.type)) {
    return extractTextFromImageBuffer(fileBuffer)
  }

  throw new Error(`Unsupported bill file type: ${file.type || "unknown"}`)
}
