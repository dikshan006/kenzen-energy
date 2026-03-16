import Link from "next/link"
import { ArrowRight, TrendingDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Recommendation {
  title: string
  description: string
  savingsMin: number
  savingsMax: number
  priority: "high" | "medium" | "low"
}

interface QuickRecommendationsProps {
  recommendations: Recommendation[]
}

export function QuickRecommendations({ recommendations }: QuickRecommendationsProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Top Recommendations</CardTitle>
          <CardDescription className="text-sm leading-7">
            A concise set of next actions for owners reviewing the latest bill
          </CardDescription>
        </div>
        <Link href="/analysis">
          <Button variant="outline" size="sm" className="gap-2">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendations.map((rec, index) => (
            <article key={index} className="rounded-[1.75rem] border border-border/70 p-5">
              <span className="rounded-full bg-primary/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">
                {rec.priority}
              </span>
              <h4 className="mt-4 font-serif text-2xl tracking-[-0.03em] text-foreground">
                {rec.title}
              </h4>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{rec.description}</p>
              <div className="mt-5 flex items-center gap-2 text-primary">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">${rec.savingsMin}-${rec.savingsMax}/mo</span>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
