export function SkeletonCard() {
  return (
    <div className="cf-card rounded-xl border cf-border p-5 cf-pulse theme-transition">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-20 mt-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
        </div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="cf-card rounded-xl border cf-border p-5 cf-pulse theme-transition">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-6" />
      <div className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-lg flex items-end gap-2 px-4 pb-4">
        {[30, 60, 40, 75, 45, 80, 50, 70, 35, 65, 55, 85].map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b cf-border cf-pulse theme-transition">
      <td className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-8" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" /></td>
    </tr>
  );
}
