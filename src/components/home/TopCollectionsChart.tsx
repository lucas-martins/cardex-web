import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CollectionAnalytics } from "../../types/collectionAnalytics";

interface TopCollectionsChartProps {
  collections: CollectionAnalytics["collections"];
}

export function TopCollectionsChart({
  collections,
}: TopCollectionsChartProps) {
  const data = collections.slice(0, 5);

  if (data.length === 0) {
    return <p className="home-analytics-empty">No data available.</p>;
  }

  return (
    <div className="home-chart">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 8,
            right: 16,
            bottom: 8,
            left: 16,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="var(--chart-grid)"
          />

          <XAxis
            type="number"
            allowDecimals={false}
            tick={{
              fill: "var(--chart-text)",
            }}
            axisLine={{
              stroke: "var(--chart-axis)",
            }}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={125}
            tick={{
              fill: "var(--chart-text)",
            }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            cursor={{
              fill: "var(--bg-surface-hover)",
            }}
            contentStyle={{
              backgroundColor: "var(--chart-tooltip-bg)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: "8px",
              boxShadow: "var(--shadow-lg)",
            }}
            labelStyle={{
              color: "var(--chart-tooltip-text)",
            }}
            itemStyle={{
              color: "var(--chart-tooltip-text)",
            }}
            formatter={(value) => [value, "Cards"]}
          />

          <Bar
            dataKey="quantity"
            fill="var(--color-primary, #2563eb)"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}