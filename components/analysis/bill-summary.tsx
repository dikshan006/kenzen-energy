import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BillSummaryProps {
  data: {
    totalAmount: number | null
    totalKwh: number | null
    peakDemand: number | null
    billingPeriod: string | null
    supplyCharges: number | null
    deliveryCharges: number | null
    demandCharges: number | null
    taxesAndFees: number | null
  }
}

export function BillSummary({ data }: BillSummaryProps) {
  const formatCurrency = (value: number | null) =>
    value === null ? "Not found" : `$${value.toLocaleString()}`

  const formatUsage = (value: number | null, unit: string) =>
    value === null ? "Not found" : `${value.toLocaleString()} ${unit}`

  const charges = [
    { label: "Supply Charges", value: data.supplyCharges },
    { label: "Delivery Charges", value: data.deliveryCharges },
    { label: "Demand Charges", value: data.demandCharges },
    { label: "Taxes & Fees", value: data.taxesAndFees },
  ]

  return (
    <Card>
      <CardHeader>
        <p className="section-kicker">Bill summary</p>
        <CardTitle className="mt-3">A simpler view of the bill structure</CardTitle>
        <p className="text-sm leading-7 text-muted-foreground">
          Billing period: {data.billingPeriod ?? "Not found in bill text"}
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.6rem] bg-muted/35 p-5">
            <p className="text-sm text-muted-foreground">Total Bill</p>
            <p className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground">
              {formatCurrency(data.totalAmount)}
            </p>
          </div>
          <div className="rounded-[1.6rem] bg-muted/35 p-5">
            <p className="text-sm text-muted-foreground">Total Usage</p>
            <p className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground">
              {formatUsage(data.totalKwh, "kWh")}
            </p>
          </div>
          <div className="rounded-[1.6rem] bg-muted/35 p-5">
            <p className="text-sm text-muted-foreground">Peak Demand</p>
            <p className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground">
              {formatUsage(data.peakDemand, "kW")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {charges.map((charge) => (
            <div
              key={charge.label}
              className="flex items-center justify-between rounded-[1.4rem] border border-border/70 px-5 py-4"
            >
              <p className="text-sm font-medium text-foreground">{charge.label}</p>
              <p className="font-serif text-2xl tracking-[-0.03em] text-foreground">
                {formatCurrency(charge.value)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
