"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react"

import { useAnalysis } from "@/lib/analysis-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type UploadState = "idle" | "uploading" | "processing" | "complete" | "error"

const ACCEPTED_BILL_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
])

function getErrorMessage(errorData: unknown) {
  if (!errorData || typeof errorData !== "object") {
    return "Failed to analyze bill"
  }

  const message =
    "error" in errorData && typeof errorData.error === "string"
      ? errorData.error
      : "Failed to analyze bill"

  if (!("details" in errorData) || errorData.details == null) {
    return message
  }

  if (typeof errorData.details === "string") {
    return `${message} ${errorData.details}`
  }

  if (
    typeof errorData.details === "object" &&
    Array.isArray((errorData.details as { validationErrors?: unknown }).validationErrors)
  ) {
    const validationErrors = (errorData.details as { validationErrors: string[] }).validationErrors
    return `${message} ${validationErrors.join(" ")}`
  }

  return message
}

export function BillUpload() {
  const router = useRouter()
  const { setAnalysis } = useAnalysis()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [laundromatProfile, setLaundromatProfile] = useState({
    number_of_washers: "18",
    number_of_dryers: "18",
    store_hours: "14",
  })

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const validateFile = (selectedFile: File): string | null => {
    if (!ACCEPTED_BILL_TYPES.has(selectedFile.type)) {
      return "Please upload a PDF, PNG, JPG, or WebP bill file"
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB"
    }
    return null
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) {
      return
    }

    const validationError = validateFile(droppedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(droppedFile)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      return
    }

    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selectedFile)
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    setUploadState("idle")
  }

  const handleAnalyze = async () => {
    if (!file) {
      return
    }

    setUploadState("uploading")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("number_of_washers", laundromatProfile.number_of_washers)
      formData.append("number_of_dryers", laundromatProfile.number_of_dryers)
      formData.append("store_hours", laundromatProfile.store_hours)

      setUploadState("processing")

      const response = await fetch("/api/analyze-bill", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(errorData))
      }

      const analysisResult = await response.json()
      setAnalysis(analysisResult)
      setUploadState("complete")

      setTimeout(() => {
        router.push("/analysis")
      }, 850)
    } catch (err) {
      setUploadState("error")
      setError(err instanceof Error ? err.message : "An error occurred while analyzing your bill")
    }
  }

  return (
    <Card className="mx-auto max-w-5xl overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="stripe-panel-soft p-8 md:p-10">
          <CardHeader className="px-0">
            <p className="section-kicker">Store profile</p>
            <CardTitle className="mt-4 text-3xl">Set the benchmark context</CardTitle>
            <CardDescription className="max-w-sm text-base leading-7">
              A few store details help Kenzen compare your usage against a laundromat of similar size.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Washers</label>
                <Input
                  inputMode="numeric"
                  value={laundromatProfile.number_of_washers}
                  onChange={(e) =>
                    setLaundromatProfile((current) => ({
                      ...current,
                      number_of_washers: e.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl border-border/60 bg-white/80"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Dryers</label>
                <Input
                  inputMode="numeric"
                  value={laundromatProfile.number_of_dryers}
                  onChange={(e) =>
                    setLaundromatProfile((current) => ({
                      ...current,
                      number_of_dryers: e.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl border-border/60 bg-white/80"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Store Hours</label>
                <Input
                  inputMode="numeric"
                  value={laundromatProfile.store_hours}
                  onChange={(e) =>
                    setLaundromatProfile((current) => ({
                      ...current,
                      store_hours: e.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl border-border/60 bg-white/80"
                />
              </div>
            </div>
          </CardContent>
        </div>

        <div className="p-8 md:p-10">
          <CardHeader className="px-0 text-left">
            <p className="section-kicker">Bill upload</p>
            <CardTitle className="mt-4 text-3xl">Upload the utility bill</CardTitle>
            <CardDescription className="text-base leading-7">
              We extract the important billing fields first, then turn them into a savings report. PDFs and bill screenshots are both supported.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            {!file ? (
              <div
                className={`relative rounded-[2rem] border border-dashed p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-primary/40 bg-primary/6"
                    : "border-border/70 bg-muted/25 hover:border-primary/25 hover:bg-muted/35"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div className="flex flex-col items-center gap-5">
                  <div className="stripe-panel flex h-20 w-20 items-center justify-center rounded-[1.75rem] p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] bg-background">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="font-serif text-3xl tracking-[-0.03em] text-foreground">
                      Drag the bill here
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      Or click to browse for a PDF, PNG, JPG, or WebP bill file, up to 10MB.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-[1.75rem] border border-border/70 bg-muted/25 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {uploadState === "idle" && (
                    <Button variant="ghost" size="icon" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {uploadState === "complete" && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>

                {uploadState === "idle" && (
                  <Button onClick={handleAnalyze} className="w-full" size="lg">
                    Analyze This Bill
                  </Button>
                )}

                {(uploadState === "uploading" || uploadState === "processing") && (
                  <div className="rounded-[1.75rem] bg-muted/25 px-6 py-8 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 font-medium text-foreground">
                      {uploadState === "uploading" ? "Uploading your bill..." : "Writing your savings report..."}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      We are extracting utility fields, comparing them to laundromat benchmarks, and
                      composing the report.
                    </p>
                  </div>
                )}

                {uploadState === "complete" && (
                  <div className="rounded-[1.75rem] bg-primary/6 px-6 py-8 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
                    <p className="mt-4 font-medium text-foreground">Analysis complete</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Redirecting to your editorial savings brief.
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-[1.5rem] border border-destructive/20 bg-destructive/8 p-4 text-sm leading-7 text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
