import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart.tsx";
import type { Metric, Point } from "@/lib/mock/insights.ts";

export default function MetricChart({
  metric,
  data,
}: {
  metric: Metric;
  data: Point[];
}) {
  const config = {
    value: { label: metric.title, color: "var(--chart-1)" },
    compare: { label: metric.compareLabel ?? "Compare", color: "var(--chart-3)" },
  } satisfies ChartConfig;

  const axes = (
    <>
      <CartesianGrid vertical={false} strokeDasharray="3 3" />
      <XAxis
        dataKey="label"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={16}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        width={34}
        domain={["auto", "auto"]}
      />
      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
    </>
  );

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      {metric.chart === "bar" ? (
        <BarChart data={data} margin={{ left: 0, right: 4, top: 8 }}>
          {axes}
          <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
        </BarChart>
      ) : metric.chart === "line" ? (
        <LineChart data={data} margin={{ left: 0, right: 4, top: 8 }}>
          {axes}
          <Line
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={3}
            dot={false}
          />
          {metric.compareLabel && (
            <Line
              dataKey="compare"
              type="monotone"
              stroke="var(--color-compare)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
          )}
        </LineChart>
      ) : (
        <AreaChart data={data} margin={{ left: 0, right: 4, top: 8 }}>
          <defs>
            <linearGradient id={`fill-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.45} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          {axes}
          <Area
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={3}
            fill={`url(#fill-${metric.key})`}
          />
        </AreaChart>
      )}
    </ChartContainer>
  );
}
