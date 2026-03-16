"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SeriesConfig {
  key: string
  label: string
  color: string
}

interface ValueTrendChartProps {
  title: string
  description: string
  data: Array<Record<string, number | string>>
  valueFormatter: (value: number) => string
  series: SeriesConfig[]
}

export function ValueTrendChart({
  title,
  description,
  data,
  valueFormatter,
  series,
}: ValueTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-sm leading-7">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[310px] w-full rounded-[1.75rem] bg-muted/18 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
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
                tickFormatter={(value) => valueFormatter(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f7f7f5",
                  border: "1px solid rgba(62,79,60,0.1)",
                  borderRadius: "20px",
                  fontSize: "12px",
                  boxShadow: "0 16px 40px rgba(62,79,60,0.10)",
                }}
                formatter={(value: number) => valueFormatter(value)}
              />
              {series.map((item) => (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2.1}
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: item.color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
