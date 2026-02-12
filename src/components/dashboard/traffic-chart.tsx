"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { trafficSourceData } from "@/lib/data";

const COLORS = [
  "oklch(0.637 0.237 25.331)",
  "oklch(0.696 0.17 162.48)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.488 0.243 264.376)",
];

export function TrafficChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <CardDescription>Breakdown by channel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={trafficSourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {trafficSourceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.175 0 0)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {trafficSourceData.map((source, i) => (
            <div key={source.name} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i] }}
              />
              <span className="text-muted-foreground">{source.name}</span>
              <span className="ml-auto font-medium">{source.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
