import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ title, value, icon: Icon, gradient, change, changeType }: StatCardProps) {
  return (
    <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-5 overflow-hidden group hover:border-gray-700 transition-all duration-200">
      {/* Background gradient glow */}
      <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${gradient} rounded-xl`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={`text-xs mt-2 font-medium ${
              changeType === 'up' ? 'text-emerald-400' :
              changeType === 'down' ? 'text-red-400' :
              'text-gray-500'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
