"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EnergyUsageChartProps {
  data: Array<{
    label: string
    usage: number
    peak: number
  }>
}

export function EnergyUsageChart({ data }: EnergyUsageChartProps) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Energy Usage Trends</CardTitle>
        <CardDescription className="text-sm leading-7">
          Historical bill-to-bill usage and peak demand in a quieter visual format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full rounded-[1.75rem] bg-muted/18 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3E4F3C" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#3E4F3C" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="peakFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#97A290" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#97A290" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 8" stroke="rgba(62,79,60,0.1)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "rgba(38,48,36,0.62)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "rgba(38,48,36,0.62)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} kWh`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f7f7f5",
                  border: "1px solid rgba(62,79,60,0.1)",
                  borderRadius: "20px",
                  fontSize: "12px",
                  boxShadow: "0 16px 40px rgba(62,79,60,0.10)",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="usage"
                name="Usage"
                stroke="#3E4F3C"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#usageFill)"
              />
              <Area
                type="monotone"
                dataKey="peak"
                name="Peak Demand"
                stroke="#97A290"
                strokeWidth={1.8}
                fillOpacity={1}
                fill="url(#peakFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
