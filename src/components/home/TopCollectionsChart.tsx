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
            stroke="rgba(255, 255, 255, 0.12)"
          />

          <XAxis
            type="number"
            allowDecimals={false}
            tick={{
              fill: "rgba(255, 255, 255, 0.72)",
            }}
            axisLine={{
              stroke: "rgba(255, 255, 255, 0.24)",
            }}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={125}
            tick={{
              fill: "rgba(255, 255, 255, 0.72)",
            }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            cursor={{
              fill: "rgba(255, 255, 255, 0.04)",
            }}
            contentStyle={{
              backgroundColor: "#17191b",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
            }}
            labelStyle={{
              color: "#ffffff",
            }}
            itemStyle={{
              color: "#ffffff",
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