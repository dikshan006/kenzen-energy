"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CostBreakdownProps {
  data: Array<{
    name: string
    cost: number
  }>
}

export function CostBreakdown({ data }: CostBreakdownProps) {
  const colors = ["#3E4F3C", "#6D7A67", "#A8B2A2", "#D0D7CA"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Cost Drivers</CardTitle>
        <CardDescription className="text-sm leading-7">
          A minimal view of where the latest bill is concentrating spend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full rounded-[1.75rem] bg-muted/18 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 8" stroke="rgba(62,79,60,0.1)" horizontal vertical={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "rgba(38,48,36,0.62)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "rgba(38,48,36,0.62)" }}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f7f7f5",
                  border: "1px solid rgba(62,79,60,0.1)",
                  borderRadius: "20px",
                  fontSize: "12px",
                  boxShadow: "0 16px 40px rgba(62,79,60,0.10)",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Cost"]}
              />
              <Bar dataKey="cost" radius={[0, 14, 14, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
