'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TopPagesChartProps {
  data: Array<{ page: string; views: number }>;
}

export default function TopPagesChart({ data }: TopPagesChartProps) {
  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <h3 className="text-white font-semibold text-sm mb-1">Top Pages</h3>
      <p className="text-gray-500 text-xs mb-5">By page view count</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="page"
            type="category"
            width={90}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 14) + '…' : v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [(Number(value)).toLocaleString(), 'Views']}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Bar dataKey="views" radius={[0, 4, 4, 0]}>
            {data.map((entry) => {
              const intensity = entry.views / maxViews;
              const opacity = 0.4 + intensity * 0.6;
              return (
                <Cell
                  key={entry.page}
                  fill={`rgba(139, 92, 246, ${opacity})`}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
