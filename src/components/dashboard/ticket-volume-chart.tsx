"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VolumeEntry {
  date: string;
  contact_us: number;
  property_tokenization: number;
  job_application: number;
}

interface TicketVolumeChartProps {
  data: VolumeEntry[];
}

const SERIES = [
  { key: "contact_us", label: "Contact Us", color: "#06b6d4" },
  { key: "property_tokenization", label: "Tokenization", color: "#f97316" },
  { key: "job_application", label: "Job Applicants", color: "#a855f7" },
] as const;

export function TicketVolumeChart({ data }: TicketVolumeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Volume (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) =>
                  new Date(v + "T00:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
                fontSize={12}
                tick={{ fill: "#a1a1aa" }}
                stroke="#3f3f46"
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                fontSize={12}
                tick={{ fill: "#a1a1aa" }}
                stroke="#3f3f46"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
                itemStyle={{ color: "#fafafa" }}
                labelStyle={{ color: "#fafafa" }}
                labelFormatter={(v) =>
                  new Date(v + "T00:00:00").toLocaleDateString()
                }
              />
              <Legend
                wrapperStyle={{ color: "#fafafa", fontSize: 12 }}
              />
              {SERIES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  fill={s.color}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  stackId="1"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
