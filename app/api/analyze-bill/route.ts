import { generateText, Output } from "ai"
import { z } from "zod"

import { insertBillAnalysis } from "@/lib/bill-analyses-store"
import {
  DEFAULT_LAUNDROMAT_PROFILE,
  type LaundromatProfile,
} from "@/lib/laundromat-benchmarks"
import {
  logAiFailure,
  logAnalysisSuccess,
  logParserFailure,
  logValidationFailure,
} from "@/lib/monitoring"
import { parseBillText, type ParsedBillData } from "@/lib/bill-parser"
import { extractBillText, isSupportedBillMimeType } from "@/lib/bill-text-extractor"
import { calculateSavingsOpportunity } from "@/lib/savings-engine"
import { validateBillData } from "@/lib/bill-validation"

export const runtime = "nodejs"

class AnalysisError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

const RecommendationSchema = z.object({
  title: z.string().describe("Short action title for the laundromat owner"),
  description: z.string().describe("Why this issue matters based on the parsed bill data"),
  steps: z.array(z.string()).describe("Practical steps the owner can take"),
  savingsMin: z.number().nonnegative().describe("Low-end monthly savings estimate in dollars"),
  savingsMax: z.number().nonnegative().describe("High-end monthly savings estimate in dollars"),
  priority: z.enum(["high", "medium", "low"]),
  difficulty: z.enum(["easy", "moderate", "hard"]),
})

const AnomalySchema = z.object({
  type: z.enum(["spike", "pattern", "unusual"]),
  title: z.string(),
  description: z.string(),
  impact: z.string().describe("Explain the cost impact as a savings or spend range when possible"),
})

const InterpretationSchema = z.object({
  recommendations: z.array(RecommendationSchema).min(2).max(5),
  anomalies: z.array(AnomalySchema).max(3).default([]),
  ai_explanation: z
    .string()
    .describe("Simple explanation for a small business owner using short plain-English paragraphs"),
})

function buildFallbackRecommendations(
  actions: Array<{
    title: string
    description: string
    savingsMin: number
    savingsMax: number
  }>,
) {
  if (actions.length > 0) {
    return actions.slice(0, 3).map((action, index) => ({
      title: action.title,
      description: action.description,
      steps: [
        "Review the billing line items tied to this issue.",
        "Make one operational change this month and compare the next bill.",
      ],
      savingsMin: action.savingsMin,
      savingsMax: action.savingsMax,
      priority: index === 0 ? "high" : "medium",
      difficulty: "moderate" as const,
    }))
  }

  return [
    {
      title: "Review the highest electric charges",
      description: "Focus on the largest billing components first to find avoidable spend.",
      steps: [
        "Compare the largest charges on this bill against the prior month.",
        "Look for changes in usage timing, runtime, or billing demand.",
      ],
      savingsMin: 0,
      savingsMax: 0,
      priority: "medium" as const,
      difficulty: "easy" as const,
    },
  ]
}

function buildFallbackExplanation(parsedBill: ParsedBillData, savingsRange: string, mainCostDriver: string) {
  const summaryParts = [
    parsedBill.total_bill !== null ? `Your total electric bill was $${parsedBill.total_bill.toFixed(2)}.` : null,
    parsedBill.kwh_usage !== null ? `The bill shows ${parsedBill.kwh_usage.toLocaleString()} kWh of usage.` : null,
    parsedBill.demand_charge !== null
      ? `Demand charges alone were $${parsedBill.demand_charge.toFixed(2)}.`
      : null,
    parsedBill.delivery_charges !== null
      ? `Delivery-related charges were $${parsedBill.delivery_charges.toFixed(2)}.`
      : null,
    parsedBill.supply_charges !== null
      ? `Electric supply or generation charges were $${parsedBill.supply_charges.toFixed(2)}.`
      : null,
  ].filter(Boolean)

  return [
    summaryParts.join(" "),
    `The main cost driver appears to be ${mainCostDriver.toLowerCase()}.`,
    `Based on the parsed bill data, the current estimated avoidable cost range is ${savingsRange}.`,
  ]
    .filter(Boolean)
    .join("\n\n")
}

function buildRelevantExcerpt(rawText: string) {
  const interestingTerms = [
    "amount due",
    "billing period",
    "service period",
    "kwh",
    "demand",
    "on-peak",
    "off-peak",
    "delivery",
    "supply",
    "tax",
  ]

  return rawText
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line) => {
      const lowerLine = line.toLowerCase()
      return interestingTerms.some((term) => lowerLine.includes(term))
    })
    .slice(0, 25)
    .join("\n")
}

function assertMinimumParsedData(data: ParsedBillData) {
  if (data.total_bill === null || data.kwh_usage === null) {
    logParserFailure("Parser could not find required billing totals.", {
      total_bill: data.total_bill,
      kwh_usage: data.kwh_usage,
    })
    throw new AnalysisError(
      422,
      "We could read the PDF, but the parser could not reliably identify both the total bill amount and total kWh usage.",
      {
        requiredFields: ["total_bill", "kwh_usage"],
      },
    )
  }
}

function parseProfileNumber(value: FormDataEntryValue | null, fallback: number) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getLaundromatProfile(formData: FormData): LaundromatProfile {
  return {
    number_of_washers: parseProfileNumber(
      formData.get("number_of_washers"),
      DEFAULT_LAUNDROMAT_PROFILE.number_of_washers,
    ),
    number_of_dryers: parseProfileNumber(
      formData.get("number_of_dryers"),
      DEFAULT_LAUNDROMAT_PROFILE.number_of_dryers,
    ),
    store_hours: parseProfileNumber(
      formData.get("store_hours"),
      DEFAULT_LAUNDROMAT_PROFILE.store_hours,
    ),
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const laundromatProfile = getLaundromatProfile(formData)

    if (!file) {
      throw new AnalysisError(400, "No file provided.")
    }

    if (!isSupportedBillMimeType(file.type)) {
      throw new AnalysisError(400, "File must be a PDF, PNG, JPG, or WebP bill image.")
    }

    let extraction

    try {
      extraction = await extractBillText(file)
    } catch (error) {
      logParserFailure("Bill text extraction failed before parsing.", {
        filename: file.name,
        fileType: file.type,
        message: error instanceof Error ? error.message : "Unknown extraction error",
      })
      throw new AnalysisError(
        400,
        "We could not read enough text from this bill. Try a clearer PDF or image, or upload a higher-quality scan.",
      )
    }

    const extractedText = extraction.text

    if (extractedText.trim().length === 0) {
      logParserFailure("Bill extraction still returned too little text after fallback handling.", {
        filename: file.name,
        fileType: file.type,
        source: extraction.source,
        extractedLength: extraction.rawTextLength,
      })
      throw new AnalysisError(
        400,
        "We could not extract enough readable text from this bill, even after OCR. Please upload a clearer PDF or screenshot.",
      )
    }

    const parsedBill = parseBillText(extractedText)

    if (parsedBill.matchedFields.length === 0) {
      logParserFailure("Parser found no supported bill fields.", {
        filename: file.name,
        source: extraction.source,
      })
      throw new AnalysisError(
        422,
        "We read the bill, but could not identify any supported utility fields. Please upload a clearer bill or extend the parser labels for this utility format.",
      )
    }

    assertMinimumParsedData(parsedBill.data)

    const validation = validateBillData(parsedBill.data)
    if (!validation.isValid) {
      logValidationFailure("Parsed bill data failed validation.", {
        filename: file.name,
        validationErrors: validation.errors,
      })
      throw new AnalysisError(
        422,
        "The parsed bill data failed validation, so AI analysis was skipped.",
        {
          validationErrors: validation.errors,
          parsedFields: parsedBill.fields,
        },
      )
    }

    const relevantExcerpt = buildRelevantExcerpt(extractedText)
    const savingsAnalysis = calculateSavingsOpportunity(parsedBill.data, laundromatProfile)

    let interpretation: z.infer<typeof InterpretationSchema>

    try {
      const result = await generateText({
        model: "openai/gpt-4o",
        output: Output.object({ schema: InterpretationSchema }),
        prompt: `You are an expert energy cost consultant for laundromats.

You must reason strictly from the parsed bill data provided below. Never invent numbers. Never infer a value for a field that is null. If data is missing, say that it is missing.

Your tasks:
- explain why the bill is high
- identify the most expensive charges that are actually present
- detect inefficiencies only when the parsed data supports them
- recommend practical cost-reduction actions for a laundromat owner that align with the deterministic savings engine output

Constraints:
- base all reasoning on the parsed values and evidence lines
- do not use knowledge of a typical bill to fabricate missing charges
- if demand charge is null, do not discuss a demand charge amount
- keep the explanation simple for a small business owner
- preserve the deterministic savings range and cost driver exactly as given
- recommendations should reinforce or expand the deterministic recommended actions, not contradict them

PARSED BILL VALUES:
${JSON.stringify(parsedBill.data, null, 2)}

PARSED FIELDS WITH CONFIDENCE:
${JSON.stringify(parsedBill.fields, null, 2)}

LAUNDROMAT PROFILE:
${JSON.stringify(laundromatProfile, null, 2)}

BENCHMARK SUMMARY:
${JSON.stringify(savingsAnalysis.benchmark, null, 2)}

DETERMINISTIC SAVINGS ENGINE OUTPUT:
${JSON.stringify(
  {
    estimated_waste_range: savingsAnalysis.estimated_waste_range,
    main_cost_driver: savingsAnalysis.main_cost_driver,
    recommended_actions: savingsAnalysis.recommended_actions,
  },
  null,
  2,
)}

RELEVANT SOURCE EXCERPT:
${relevantExcerpt || "No additional labeled lines were available."}

Return only structured output.`,
      })
      if (!result.output) {
        logAiFailure("AI analysis returned no output.", {
          filename: file.name,
        })
        throw new Error("AI analysis failed to return a valid result.")
      }

      interpretation = result.output
    } catch (error) {
      logAiFailure("AI analysis call failed.", {
        filename: file.name,
        message: error instanceof Error ? error.message : "Unknown AI failure",
      })
      interpretation = {
        recommendations: buildFallbackRecommendations(savingsAnalysis.recommended_actions),
        anomalies: [],
        ai_explanation: buildFallbackExplanation(
          parsedBill.data,
          savingsAnalysis.estimated_waste_range,
          savingsAnalysis.main_cost_driver,
        ),
      }
    }

    let savedAnalysis: Awaited<ReturnType<typeof insertBillAnalysis>> = null

    try {
      savedAnalysis = await insertBillAnalysis({
        total_bill: parsedBill.data.total_bill!,
        kwh_usage: parsedBill.data.kwh_usage!,
        demand_charge: parsedBill.data.demand_charge,
        peak_demand_kw: parsedBill.data.peak_demand_kw,
        peak_hours: parsedBill.data.peak_hours,
        estimated_waste_range: savingsAnalysis.estimated_waste_range,
        main_cost_driver: savingsAnalysis.main_cost_driver,
        recommendations: interpretation.recommendations,
        savings_actions: savingsAnalysis.recommended_actions,
        parsed_fields: parsedBill.fields,
        laundromat_profile: laundromatProfile,
        benchmark_summary: savingsAnalysis.benchmark,
        raw_bill_text: extractedText,
      })
    } catch (error) {
      console.warn("Analysis completed but could not be persisted.", error)
    }

    logAnalysisSuccess("Bill analysis completed successfully.", {
      analysisId: savedAnalysis?.id ?? null,
      filename: file.name,
      matchedFields: parsedBill.matchedFields,
      averageConfidence: parsedBill.averageConfidence,
    })

    return Response.json({
      analysisId: savedAnalysis?.id,
      totalBill: parsedBill.data.total_bill,
      billingPeriod: parsedBill.data.billing_period,
      kwhUsage: parsedBill.data.kwh_usage,
      demandCharge: parsedBill.data.demand_charge,
      peakDemand: parsedBill.data.peak_demand_kw,
      peakTime: parsedBill.data.peak_hours,
      demandData: [],
      supplyCharges: parsedBill.data.supply_charges,
      deliveryCharges: parsedBill.data.delivery_charges,
      taxesAndFees: parsedBill.data.taxes,
      onPeakUsage: parsedBill.data.on_peak_kwh,
      offPeakUsage: parsedBill.data.off_peak_kwh,
      estimatedWasteMin: savingsAnalysis.estimated_waste_min,
      estimatedWasteMax: savingsAnalysis.estimated_waste_max,
      estimatedWasteRange: savingsAnalysis.estimated_waste_range,
      mainCostDriver: savingsAnalysis.main_cost_driver,
      anomalies: interpretation.anomalies ?? [],
      recommendations: interpretation.recommendations,
      aiExplanation: interpretation.ai_explanation,
      parsedBill: parsedBill.fields,
      benchmarkSummary: savingsAnalysis.benchmark,
      savingsActions: savingsAnalysis.recommended_actions,
      extractionSummary: {
        source: extraction.source,
        ocrUsed: extraction.ocrUsed,
        rawTextLength: extraction.rawTextLength,
        matchedFields: parsedBill.matchedFields,
        averageConfidence: parsedBill.averageConfidence,
      },
      savedAt: savedAnalysis?.created_at,
    })
  } catch (error) {
    console.error("Error analyzing bill:", error)

    if (error instanceof AnalysisError) {
      if (error.status >= 500) {
        logAiFailure("Bill analysis request failed.", {
          message: error.message,
          details: error.details,
        })
      }

      return Response.json(
        {
          error: error.message,
          details: error.details ?? null,
        },
        { status: error.status },
      )
    }

    if (error instanceof Error) {
      return Response.json(
        {
          error:
            "Something went wrong while processing this bill. Please verify the PDF is readable and try again.",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return Response.json(
      {
        error: "Unknown error while processing bill.",
      },
      { status: 500 },
    )
  }
}
