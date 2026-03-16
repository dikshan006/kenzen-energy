import { ArrowRight, TrendingDown } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Recommendation {
  title: string
  description: string
  steps: string[]
  savingsMin: number
  savingsMax: number
  priority: "high" | "medium" | "low"
  difficulty: "easy" | "moderate" | "hard"
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[]
  totalSavingsMin: number
  totalSavingsMax: number
}

export function RecommendationsPanel({
  recommendations,
  totalSavingsMin,
  totalSavingsMax,
}: RecommendationsPanelProps) {
  return (
    <Card className="col-span-full overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <CardHeader>
            <p className="section-kicker">Recommendations</p>
            <CardTitle className="mt-3">Practical actions to reduce the next bill</CardTitle>
            <CardDescription className="text-sm leading-7">
              A savings-oriented reading of the bill, with actions ordered for calm execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {recommendations.map((rec, index) => (
                <article key={index} className="rounded-[1.75rem] border border-border/70 p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">
                          {rec.priority} impact
                        </span>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {rec.difficulty}
                        </span>
                      </div>
                      <h4 className="mt-4 font-serif text-3xl tracking-[-0.03em] text-foreground">
                        {rec.title}
                      </h4>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {rec.description}
                      </p>
                      {rec.steps.length > 0 && (
                        <ul className="mt-5 space-y-2">
                          {rec.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-3 text-sm leading-7 text-muted-foreground">
                              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="shrink-0 rounded-[1.5rem] bg-muted/25 px-5 py-4 text-left lg:min-w-[170px]">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Estimated savings
                      </p>
                      <p className="mt-3 font-serif text-3xl tracking-[-0.04em] text-primary">
                        ${rec.savingsMin}-${rec.savingsMax}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </div>

        <div className="stripe-panel-soft flex items-center p-8 md:p-10">
          <div className="w-full rounded-[1.75rem] bg-background/85 p-6 shadow-[0_16px_36px_rgba(62,79,60,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
                <TrendingDown className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="section-kicker">Potential monthly savings</p>
                <p className="mt-2 font-serif text-4xl tracking-[-0.04em] text-foreground">
                  ${totalSavingsMin}-${totalSavingsMax}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
