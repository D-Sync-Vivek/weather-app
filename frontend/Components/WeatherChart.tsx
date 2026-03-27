import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartProps {
  title: string;
  data: Array<Record<string, number | string | null | undefined>>;
  dataKeys: string[];
  colors: string[];
  unit: string;
  xKey?: string;
}

export const WeatherChart = ({
  title,
  data,
  dataKeys,
  colors,
  unit,
  xKey = "hour",
}: ChartProps) => (
  <div className="w-full bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
    <h3 className="text-lg font-semibold mb-4 text-slate-300 ml-4">{title}</h3>
    <div className="w-full overflow-x-auto">
      <div className="min-w-225">
        <LineChart width={900} height={320} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} unit={unit} />
          <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }} />
          <Legend />
          {dataKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={colors[i]} strokeWidth={2} dot={false} />
          ))}
          {/* ZOOM FUNCTIONALITY REQUIREMENT */}
          <Brush dataKey={xKey} height={30} stroke="#3b82f6" fill="#1e293b" />
        </LineChart>
      </div>
    </div>
  </div>
);