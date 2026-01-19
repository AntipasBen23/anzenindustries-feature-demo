'use client';

import { useReactors } from '@/contexts/ReactorContext';

export default function DashboardStats() {
  const { dashboardStats } = useReactors();

  const stats = [
    {
      label: 'Total Reactors',
      value: dashboardStats.totalReactors,
      unit: '',
      description: 'Monitored systems',
    },
    {
      label: 'Active Reactors',
      value: dashboardStats.activeReactors,
      unit: '',
      description: 'Currently running',
    },
    {
      label: 'Average Yield',
      value: dashboardStats.averageYield.toFixed(1),
      unit: '%',
      description: 'Across all reactors',
    },
    {
      label: 'System Health',
      value: dashboardStats.systemHealth.toFixed(1),
      unit: '%',
      description: 'Enzyme activity',
    },
    {
      label: 'Daily Production',
      value: dashboardStats.dailyProduction.toFixed(1),
      unit: 'kg',
      description: 'Estimated output',
    },
    {
      label: 'Uptime',
      value: dashboardStats.uptime.toFixed(0),
      unit: '%',
      description: 'System availability',
    },
    {
      label: 'Active Alerts',
      value: dashboardStats.totalAlerts,
      unit: '',
      description: `${dashboardStats.criticalAlerts} critical`,
      highlight: dashboardStats.criticalAlerts > 0,
    },
    {
      label: 'Critical Issues',
      value: dashboardStats.criticalAlerts,
      unit: '',
      description: 'Requires attention',
      highlight: dashboardStats.criticalAlerts > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`metric-card chart-enter ${stat.highlight ? 'border-black border-2' : ''}`}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <div className="flex flex-col">
            {/* Label */}
            <div className="metric-label mb-2">
              {stat.label}
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1">
              <span className="metric-value-large">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-base font-medium text-gray-600">
                  {stat.unit}
                </span>
              )}
            </div>

            {/* Description */}
            <div className={`text-xs mt-2 ${stat.highlight ? 'text-black font-medium' : 'text-gray-500'}`}>
              {stat.description}
            </div>
          </div>

          {/* Visual indicator for active status */}
          {stat.label === 'Active Reactors' && Number(stat.value) > 0 && (
            <div className="absolute top-3 right-3">
              <div className="w-2 h-2 bg-black rounded-full pulse-indicator"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}