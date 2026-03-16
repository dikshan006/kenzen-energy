"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, FileUp } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AIExplanation } from "@/components/analysis/ai-explanation"
import { AnomaliesPanel } from "@/components/analysis/anomalies-panel"
import { BillSummary } from "@/components/analysis/bill-summary"
import { PeakDemandAnalysis } from "@/components/analysis/peak-demand-analysis"
import { RecommendationsPanel } from "@/components/analysis/recommendations-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAnalysis } from "@/lib/analysis-context"

export default function AnalysisPage() {
  const router = useRouter()
  const { analysis } = useAnalysis()

  if (!analysis) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <main className="flex-1">
          <section className="editorial-section">
            <div className="page-frame">
              <Card className="mx-auto max-w-2xl">
                <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
                  <div className="stripe-panel flex h-20 w-20 items-center justify-center rounded-[1.75rem] p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] bg-background">
                      <FileUp className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-serif text-4xl tracking-[-0.04em] text-foreground">
                      No analysis available
                    </h2>
                    <p className="mt-4 max-w-lg text-base leading-8 text-muted-foreground">
                      Upload an electricity bill to generate a savings brief and see the editorial report layout.
                    </p>
                  </div>
                  <Button onClick={() => router.push("/upload")} size="lg">
                    Upload a Bill
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    )
  }

  const totalSavingsMin = analysis.recommendations.reduce((sum, rec) => sum + rec.savingsMin, 0)
  const totalSavingsMax = analysis.recommendations.reduce((sum, rec) => sum + rec.savingsMax, 0)

  const billData = {
    totalAmount: analysis.totalBill,
    totalKwh: analysis.kwhUsage,
    peakDemand: analysis.peakDemand,
    billingPeriod: analysis.billingPeriod,
    supplyCharges: analysis.supplyCharges,
    deliveryCharges: analysis.deliveryCharges,
    demandCharges: analysis.demandCharge,
    taxesAndFees: analysis.taxesAndFees,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1">
        <section className="editorial-section">
          <div className="page-frame space-y-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="fade-in-section">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="mb-6 gap-1 pl-0">
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <p className="section-kicker">Bill analysis</p>
                <h1 className="editorial-subtitle mt-6">A composed reading of this month’s electricity spend.</h1>
                <p className="editorial-copy mt-6">
                  Review the main cost driver, the charges shaping the bill, and the practical changes
                  most likely to produce savings next month.
                </p>
              </div>
              <div className="fade-in-section fade-delay-1 flex items-start justify-end">
                {analysis.analysisId ? (
                  <Link href={`/report/${analysis.analysisId}`}>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Report
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="gap-2" disabled>
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <AIExplanation explanation={analysis.aiExplanation} />

              <div className="grid gap-6 lg:grid-cols-2">
                <BillSummary data={billData} />
                <PeakDemandAnalysis
                  data={analysis.demandData}
                  peakDemand={analysis.peakDemand}
                  peakTime={analysis.peakTime}
                />
              </div>

              <AnomaliesPanel anomalies={analysis.anomalies} />

              <RecommendationsPanel
                recommendations={analysis.recommendations}
                totalSavingsMin={totalSavingsMin}
                totalSavingsMax={totalSavingsMax}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
