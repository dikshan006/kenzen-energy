import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface SavingsMeterProps {
  analysisId: string
  estimatedWasteRange: string
  mainCostDriver: string
  efficiencyScore?: number
}

export function SavingsMeter({
  analysisId,
  estimatedWasteRange,
  mainCostDriver,
  efficiencyScore,
}: SavingsMeterProps) {
  return (
    <Card className="overflow-hidden bg-primary text-primary-foreground">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <CardContent className="p-8 md:p-12">
          <p className="section-kicker text-primary-foreground/68">Potential monthly savings</p>
          <p className="mt-5 font-serif text-6xl tracking-[-0.05em] text-primary-foreground md:text-7xl">
            {estimatedWasteRange}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-primary-foreground/78 md:text-lg">
            The dashboard is centered on the savings meter first, so every later chart and note can
            be read in context.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">
                Main cost driver
              </p>
              <p className="mt-3 text-sm leading-7 text-primary-foreground/82">{mainCostDriver}</p>
            </div>
            <div className="rounded-[1.75rem] bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">
                Efficiency score
              </p>
              <p className="mt-3 font-serif text-4xl tracking-[-0.04em] text-primary-foreground">
                {typeof efficiencyScore === "number" ? `${efficiencyScore}/100` : "Pending"}
              </p>
            </div>
          </div>
        </CardContent>

        <div className="stripe-panel flex items-center justify-center p-8">
          <div className="w-full rounded-[1.9rem] bg-background/94 p-6 text-foreground shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
            <p className="section-kicker">Shareable report</p>
            <p className="mt-4 font-serif text-3xl tracking-[-0.04em] text-foreground">
              A polished report, ready to send.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Open the report view for a cleaner, printable summary of the bill and its savings story.
            </p>
            <Link href={`/report/${analysisId}`} className="mt-6 block">
              <Button className="w-full justify-between">
                View Savings Report
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
