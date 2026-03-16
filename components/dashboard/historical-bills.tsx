import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface HistoricalBill {
  id: string
  createdAt: string
  totalBill: number
  kwhUsage: number
  demandCharge: number | null
  peakDemandKw: number | null
  estimatedWasteRange: string
  mainCostDriver: string
}

interface HistoricalBillsProps {
  bills: HistoricalBill[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export function HistoricalBills({ bills }: HistoricalBillsProps) {
  return (
    <Card className="col-span-full overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[160px_minmax(0,1fr)]">
        <div className="stripe-panel-soft hidden lg:block" />
        <div>
          <CardHeader>
            <CardTitle>Historical Bills</CardTitle>
            <CardDescription className="text-sm leading-7">
              A bill-by-bill archive of spend, usage, and the savings narrative attached to each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="grid gap-4 rounded-[1.75rem] border border-border/70 p-5 md:grid-cols-[140px_130px_130px_170px_minmax(0,1fr)_90px] md:items-start"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Date</p>
                    <p className="mt-2 text-sm text-foreground">{formatDate(bill.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Bill</p>
                    <p className="mt-2 font-serif text-2xl tracking-[-0.03em] text-foreground">
                      ${bill.totalBill.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Usage</p>
                    <p className="mt-2 text-sm text-foreground">{bill.kwhUsage.toLocaleString()} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Savings</p>
                    <p className="mt-2 text-sm text-primary">{bill.estimatedWasteRange}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Main cost driver</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{bill.mainCostDriver}</p>
                  </div>
                  <div className="md:text-right">
                    <Link href={`/report/${bill.id}`} className="quiet-link text-sm font-medium text-primary">
                      Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
