import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DistributionItem {
  name: string;
  quantity: number;
}

interface DistributionDonutChartProps {
  items: DistributionItem[];
  formatName?: (name: string) => string;
}

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

export function DistributionDonutChart({
  items,
  formatName = (name) => name,
}: DistributionDonutChartProps) {
  const data = items.map((item) => ({
    ...item,
    formattedName: formatName(item.name),
  }));

  if (data.length === 0) {
    return <p className="home-analytics-empty">No data available.</p>;
  }

  return (
    <div className="home-donut-chart">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="quantity"
            nameKey="formattedName"
            cx="50%"
            cy="45%"
            innerRadius={58}
            outerRadius={90}
            paddingAngle={3}
          >
            {data.map((item, index) => (
              <Cell
                key={item.name}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
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
            formatter={(value, name) => [value, name]}
          />

          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(value) => (
              <span className="home-chart-legend-label">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}