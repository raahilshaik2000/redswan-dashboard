"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Users, Activity, TrendingUp } from "lucide-react";

const kpis = [
  {
    title: "Total Revenue",
    value: "$456,000",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Active Users",
    value: "8,100",
    change: "+18.2%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "+0.8%",
    trend: "up" as const,
    icon: Activity,
  },
  {
    title: "Avg. Order Value",
    value: "$284",
    change: "-2.1%",
    trend: "down" as const,
    icon: TrendingUp,
  },
];

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p
              className={`mt-1 text-xs ${
                kpi.trend === "up"
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {kpi.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
