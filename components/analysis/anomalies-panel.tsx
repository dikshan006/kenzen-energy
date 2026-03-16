import { AlertTriangle, Clock, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Anomaly {
  type: "spike" | "pattern" | "unusual"
  title: string
  description: string
  impact: string
}

interface AnomaliesPanelProps {
  anomalies: Anomaly[]
}

export function AnomaliesPanel({ anomalies }: AnomaliesPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "spike":
        return <TrendingUp className="h-5 w-5" />
      case "pattern":
        return <Clock className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="section-kicker">Observed patterns</p>
        <CardTitle className="mt-3">Potential anomalies and unusual cost signals</CardTitle>
        <CardDescription className="text-sm leading-7">
          {anomalies.length > 0
            ? `We found ${anomalies.length} pattern${anomalies.length > 1 ? "s" : ""} worth reviewing.`
            : "No unusual patterns were surfaced in this billing period."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="rounded-[1.75rem] bg-muted/25 p-8 text-center">
            <p className="font-serif text-3xl tracking-[-0.03em] text-foreground">No anomalies detected</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              The usage pattern appears relatively stable for this billing period.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {anomalies.map((anomaly, index) => (
              <div
                key={index}
                className="rounded-[1.75rem] border border-border/70 bg-muted/18 p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {getIcon(anomaly.type)}
                </div>
                <h4 className="mt-5 font-serif text-2xl tracking-[-0.03em] text-foreground">
                  {anomaly.title}
                </h4>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {anomaly.description}
                </p>
                <p className="mt-4 text-sm font-medium text-foreground">{anomaly.impact}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
