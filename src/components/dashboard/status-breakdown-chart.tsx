"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusBreakdownChartProps {
  data: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  new: "#06b6d4",
  pending_review: "#eab308",
  approved: "#22c55e",
  sent: "#a855f7",
  archived: "#52525b",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  pending_review: "Pending",
  approved: "Approved",
  sent: "Sent",
  archived: "Archived",
};

export function StatusBreakdownChart({ data }: StatusBreakdownChartProps) {
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: STATUS_LABELS[d.status] || d.status,
      value: d.count,
      color: STATUS_COLORS[d.status] || "#6b7280",
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                    color: "#fafafa",
                  }}
                  itemStyle={{ color: "#fafafa" }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Legend wrapperStyle={{ color: "#fafafa" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
