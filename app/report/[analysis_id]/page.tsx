import { notFound } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ReportActions } from "@/components/report/report-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBillAnalysisById } from "@/lib/bill-analyses-store"

interface ReportPageProps {
  params: Promise<{
    analysis_id: string
  }>
}

function formatCurrency(value: number | null) {
  return value === null ? "Not available" : `$${value.toLocaleString()}`
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { analysis_id } = await params
  const analysis = await getBillAnalysisById(analysis_id)

  if (!analysis) {
    notFound()
  }

  const parsedFields = Object.entries(analysis.parsed_fields ?? {}) as Array<
    [string, { confidence?: number; evidence_line?: string | null }]
  >
  const savingsActions = analysis.savings_actions ?? []

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="editorial-section">
        <div className="page-frame space-y-8">
          <div className="report-surface overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="bg-primary p-10 text-primary-foreground md:p-14">
                <p className="section-kicker text-primary-foreground/68">Shareable savings report</p>
                <h1 className="mt-6 font-serif text-5xl tracking-[-0.05em] text-primary-foreground md:text-6xl">
                  A polished electricity brief for owners and operators.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-primary-foreground/78 md:text-lg">
                  This report keeps the savings story at the center while still showing the charges,
                  evidence, and recommendations behind it.
                </p>
              </div>
              <div className="stripe-panel flex items-center p-8 md:p-10">
                <div className="w-full rounded-[1.75rem] bg-background/94 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                  <p className="section-kicker">Potential monthly savings</p>
                  <p className="mt-4 font-serif text-4xl tracking-[-0.04em] text-foreground">
                    {analysis.estimated_waste_range}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    Main cost driver: {analysis.main_cost_driver}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <ReportActions analysisId={analysis.id} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.6rem] bg-muted/35 p-5">
                <p className="text-sm text-muted-foreground">Total Bill</p>
                <p className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground">
                  {formatCurrency(analysis.total_bill)}
                </p>
              </div>
              <div className="rounded-[1.6rem] bg-muted/35 p-5">
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground">
                  {analysis.kwh_usage.toLocaleString()} kWh
                </p>
              </div>
              <div className="rounded-[1.6rem] bg-muted/35 p-5">
                <p className="text-sm text-muted-foreground">Demand Charge</p>
                <p className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground">
                  {formatCurrency(analysis.demand_charge)}
                </p>
              </div>
              <div className="rounded-[1.6rem] bg-muted/35 p-5">
                <p className="text-sm text-muted-foreground">Peak Demand</p>
                <p className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground">
                  {analysis.peak_demand_kw !== null ? `${analysis.peak_demand_kw.toLocaleString()} kW` : "Not available"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Cost Drivers and Savings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[1.75rem] bg-muted/28 p-6">
                  <p className="section-kicker">Main cost driver</p>
                  <p className="mt-4 font-serif text-3xl tracking-[-0.03em] text-foreground">
                    {analysis.main_cost_driver}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/70 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Peak hours</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {analysis.peak_hours ?? "No peak hour window captured"}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/70 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Benchmark fit</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {analysis.benchmark_summary?.efficiency_score
                        ? `Efficiency score ${analysis.benchmark_summary.efficiency_score}/100`
                        : "Benchmark score not available"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {analysis.benchmark_summary?.difference_percentage !== undefined
                        ? `${analysis.benchmark_summary.difference_percentage}% versus expected usage`
                        : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parser Reliability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {parsedFields.slice(0, 6).map(([key, field]) => (
                  <div key={key} className="rounded-[1.4rem] border border-border/70 p-4">
                    <p className="font-medium capitalize text-foreground">{key.replace(/_/g, " ")}</p>
                    <p className="mt-2">Confidence: {Math.round((field.confidence ?? 0) * 100)}%</p>
                    {field.evidence_line && <p className="mt-2 break-words text-xs leading-6">{field.evidence_line}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="rounded-[1.75rem] border border-border/70 p-5">
                    <p className="font-serif text-2xl tracking-[-0.03em] text-foreground">
                      {recommendation.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {recommendation.description}
                    </p>
                    <p className="mt-4 text-sm font-medium text-primary">
                      ${recommendation.savingsMin}-${recommendation.savingsMax}/month
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deterministic Savings Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savingsActions.length > 0 ? (
                  savingsActions.map((action, index) => (
                    <div key={index} className="rounded-[1.75rem] border border-border/70 p-5">
                      <p className="font-serif text-2xl tracking-[-0.03em] text-foreground">
                        {action.title}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{action.description}</p>
                      <p className="mt-4 text-sm font-medium text-primary">
                        ${action.savingsMin}-${action.savingsMax}/month
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No deterministic savings actions were stored for this analysis.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
