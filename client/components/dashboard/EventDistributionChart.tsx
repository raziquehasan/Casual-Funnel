'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EventDistributionChartProps {
  data: Array<{ type: string; count: number }>;
}

const COLORS: Record<string, string> = {
  click: '#06b6d4',
  page_view: '#8b5cf6',
};
const FALLBACK_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function EventDistributionChart({ data }: EventDistributionChartProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <h3 className="text-white font-semibold text-sm mb-1">Event Distribution</h3>
      <p className="text-gray-500 text-xs mb-5">Breakdown by type</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.type}
                fill={COLORS[entry.type] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [(Number(value)).toLocaleString(), String(name)]}
          />
          <Legend
            formatter={(value) => (
              <span className="text-gray-400 text-xs capitalize">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
