"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PeakDemandAnalysisProps {
  data: Array<{
    time: string
    demand: number
  }>
  peakDemand: number | null
  peakTime: string | null
}

export function PeakDemandAnalysis({ data, peakDemand, peakTime }: PeakDemandAnalysisProps) {
  const hasChartData = data.length > 0

  return (
    <Card>
      <CardHeader>
        <p className="section-kicker">Peak demand</p>
        <CardTitle className="mt-3">When the store pulled hardest from the grid</CardTitle>
        <CardDescription className="text-sm leading-7">
          {peakDemand !== null
            ? `Your highest demand was ${peakDemand} kW${peakTime ? ` during ${peakTime}` : ""}.`
            : "Peak demand details were not clearly labeled in this bill."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasChartData ? (
          <div className="h-[260px] w-full rounded-[1.75rem] bg-muted/18 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 8" stroke="rgba(62,79,60,0.11)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "rgba(38,48,36,0.62)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(38,48,36,0.62)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} kW`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f7f7f5",
                    border: "1px solid rgba(62,79,60,0.1)",
                    borderRadius: "20px",
                    fontSize: "12px",
                    boxShadow: "0 16px 40px rgba(62,79,60,0.10)",
                  }}
                  formatter={(value: number) => [`${value} kW`, "Demand"]}
                />
                {peakDemand !== null && (
                  <ReferenceLine
                    y={peakDemand}
                    stroke="rgba(62,79,60,0.5)"
                    strokeDasharray="6 6"
                  />
                )}
                <Bar dataKey="demand" fill="#3E4F3C" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-border/70 p-8 text-center text-sm leading-7 text-muted-foreground">
            The parser did not find interval demand data in this bill, so there is no detailed chart yet.
          </div>
        )}

        <div className="mt-5 rounded-[1.5rem] bg-muted/28 p-5 text-sm leading-7 text-muted-foreground">
          Peak demand charges are shaped by the single highest moment of power draw in the billing
          period, so even short spikes deserve attention in a laundromat setting.
        </div>
      </CardContent>
    </Card>
  )
}
