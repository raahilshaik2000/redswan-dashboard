"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { performanceData } from "@/lib/data";

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Performance</CardTitle>
        <CardDescription>Latency (ms) and throughput (req/s) this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
              <XAxis
                dataKey="day"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}ms`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.175 0 0)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
                  fontSize: "12px",
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="latency"
                stroke="oklch(0.769 0.188 70.08)"
                strokeWidth={2}
                dot={{ fill: "oklch(0.769 0.188 70.08)", r: 3 }}
                name="Latency (ms)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="throughput"
                stroke="oklch(0.637 0.237 25.331)"
                strokeWidth={2}
                dot={{ fill: "oklch(0.637 0.237 25.331)", r: 3 }}
                name="Throughput (req/s)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
