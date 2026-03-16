import { AlertTriangle, DollarSign, TrendingDown, Zap } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  totalCost: number
  totalKwh: number
  estimatedWaste: number
  potentialSavingsMin: number
  potentialSavingsMax: number
}

export function StatsCards({
  totalCost,
  totalKwh,
  estimatedWaste,
  potentialSavingsMin,
  potentialSavingsMax,
}: StatsCardsProps) {
  const cards = [
    {
      title: "Total Monthly Cost",
      value: `$${totalCost.toLocaleString()}`,
      note: "Based on the latest bill on file",
      icon: DollarSign,
    },
    {
      title: "Total Energy Usage",
      value: `${totalKwh.toLocaleString()} kWh`,
      note: "Monthly electricity consumption",
      icon: Zap,
    },
    {
      title: "Estimated Waste",
      value: `$${estimatedWaste.toLocaleString()}`,
      note: "Likely avoidable operating cost",
      icon: AlertTriangle,
    },
    {
      title: "Potential Savings",
      value: `$${potentialSavingsMin}-$${potentialSavingsMax}`,
      note: "Monthly range from the savings engine",
      icon: TrendingDown,
    },
  ]

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-4xl tracking-[-0.04em] text-foreground">
                {card.value}
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.note}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
