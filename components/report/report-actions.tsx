"use client"

import { useState } from "react"
import { Download, Share2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ReportActionsProps {
  analysisId: string
}

export function ReportActions({ analysisId }: ReportActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const reportUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/report/${analysisId}`
        : `/report/${analysisId}`

    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: "Kenzen Savings Report",
        text: "View this Kenzen Energy bill savings report.",
        url: reportUrl,
      })
      return
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(reportUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <Button variant="outline" className="gap-2" onClick={() => window.print()}>
        <Download className="h-4 w-4" />
        Export PDF
      </Button>
      <Button className="gap-2" onClick={handleShare}>
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? "Link Copied" : "Share Report"}
      </Button>
    </div>
  )
}
