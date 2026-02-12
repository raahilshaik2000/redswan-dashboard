"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { revenueData } from "@/lib/data";

export function RevenueChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Revenue vs expenses over the last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.637 0.237 25.331)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.637 0.237 25.331)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.175 0 0)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
                  fontSize: "12px",
                }}
                formatter={(value) => [`$${(Number(value) / 1000).toFixed(0)}k`]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.637 0.237 25.331)"
                fill="url(#revenueGradient)"
                strokeWidth={2}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="oklch(0.696 0.17 162.48)"
                fill="url(#expensesGradient)"
                strokeWidth={2}
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
