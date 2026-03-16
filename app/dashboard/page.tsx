import Link from "next/link"

import { CostBreakdown } from "@/components/dashboard/cost-breakdown"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EnergyUsageChart } from "@/components/dashboard/energy-usage-chart"
import { HistoricalBills } from "@/components/dashboard/historical-bills"
import { QuickRecommendations } from "@/components/dashboard/quick-recommendations"
import { SavingsMeter } from "@/components/dashboard/savings-meter"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ValueTrendChart } from "@/components/dashboard/value-trend-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { listBillAnalyses } from "@/lib/bill-analyses-store"

function formatMonthLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(new Date(value))
}

function parseSavingsRange(value: string) {
  const numbers = value.match(/\d[\d,]*/g) ?? []
  const min = Number.parseInt(numbers[0]?.replace(/,/g, "") ?? "0", 10)
  const max = Number.parseInt(numbers[1]?.replace(/,/g, "") ?? String(min), 10)

  return {
    min,
    max,
    midpoint: Math.round((min + max) / 2),
  }
}

export default async function DashboardPage() {
  try {
    const analyses = await listBillAnalyses(12)
    const latest = analyses[0]

    if (!latest) {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          <DashboardHeader />
          <main className="flex-1">
            <section className="editorial-section">
              <div className="page-frame">
                <Card className="mx-auto max-w-3xl">
                  <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
                    <p className="section-kicker">No history yet</p>
                    <h2 className="font-serif text-5xl tracking-[-0.04em] text-foreground">
                      The dashboard wakes up after the first bill.
                    </h2>
                    <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                      Upload a utility statement and Kenzen will start building the calm, historical
                      view of your energy spend and savings potential.
                    </p>
                    <Link href="/upload">
                      <Button size="lg">Upload a Bill</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>
          </main>
        </div>
      )
    }

    const usageTrendData = analyses
      .slice()
      .reverse()
      .map((analysis) => ({
        label: formatMonthLabel(analysis.created_at),
        usage: analysis.kwh_usage,
        peak: analysis.peak_demand_kw ?? 0,
      }))

    const financialTrendData = analyses
      .slice()
      .reverse()
      .map((analysis) => {
        const savings = parseSavingsRange(analysis.estimated_waste_range)

        return {
          label: formatMonthLabel(analysis.created_at),
          totalBill: analysis.total_bill,
          potentialSavings: savings.midpoint,
        }
      })

    const costBreakdownData = [
      { name: "Demand", cost: latest.demand_charge ?? 0 },
      {
        name: "Other Charges",
        cost: Math.max(latest.total_bill - (latest.demand_charge ?? 0), 0),
      },
    ]

    const historicalBills = analyses.map((analysis) => ({
      id: analysis.id,
      createdAt: analysis.created_at,
      totalBill: analysis.total_bill,
      kwhUsage: analysis.kwh_usage,
      demandCharge: analysis.demand_charge,
      peakDemandKw: analysis.peak_demand_kw,
      estimatedWasteRange: analysis.estimated_waste_range,
      mainCostDriver: analysis.main_cost_driver,
    }))

    const recommendations = latest.recommendations.slice(0, 3)
    const savings = parseSavingsRange(latest.estimated_waste_range)

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <main className="flex-1">
          <section className="editorial-section">
            <div className="page-frame space-y-8">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="fade-in-section">
                  <p className="section-kicker">Financial insight dashboard</p>
                  <h1 className="editorial-subtitle mt-6">
                    A quieter operating view for owners tracking energy spend over time.
                  </h1>
                  <p className="editorial-copy mt-6">
                    Focus first on potential savings, then move through cost drivers, historical bills,
                    and trend lines with less dashboard noise.
                  </p>
                </div>
                <div className="stripe-panel-soft hidden rounded-[2rem] lg:block" />
              </div>

              <SavingsMeter
                analysisId={latest.id}
                estimatedWasteRange={latest.estimated_waste_range}
                mainCostDriver={latest.main_cost_driver}
                efficiencyScore={latest.benchmark_summary?.efficiency_score}
              />

              <StatsCards
                totalCost={latest.total_bill}
                totalKwh={latest.kwh_usage}
                estimatedWaste={savings.midpoint}
                potentialSavingsMin={savings.min}
                potentialSavingsMax={savings.max}
              />

              <div className="grid gap-6 xl:grid-cols-2">
                <EnergyUsageChart data={usageTrendData} />
                <ValueTrendChart
                  title="Bill and Savings Trends"
                  description="Compare the latest bill path against the savings opportunity path"
                  data={financialTrendData}
                  valueFormatter={(value) => `$${Math.round(value).toLocaleString()}`}
                  series={[
                    {
                      key: "totalBill",
                      label: "Total Bill",
                      color: "#3E4F3C",
                    },
                    {
                      key: "potentialSavings",
                      label: "Potential Savings",
                      color: "#97A290",
                    },
                  ]}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <CostBreakdown data={costBreakdownData} />
                <ValueTrendChart
                  title="Savings Trend"
                  description="How the savings estimate is moving from one bill to the next"
                  data={financialTrendData}
                  valueFormatter={(value) => `$${Math.round(value).toLocaleString()}`}
                  series={[
                    {
                      key: "potentialSavings",
                      label: "Savings Estimate",
                      color: "#3E4F3C",
                    },
                  ]}
                />
              </div>

              <QuickRecommendations recommendations={recommendations} />
              <HistoricalBills bills={historicalBills} />
            </div>
          </section>
        </main>
      </div>
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown dashboard loading error."

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <main className="flex-1">
          <section className="editorial-section">
            <div className="page-frame">
              <Card className="mx-auto max-w-2xl">
                <CardContent className="py-12 text-center text-muted-foreground">{message}</CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    )
  }
}
