'use client';

import type { Reactor } from '@/app/types/reactor';
import { useReactors } from '@/contexts/ReactorContext';

interface ReactorCardProps {
  reactor: Reactor;
}

export default function ReactorCard({ reactor }: ReactorCardProps) {
  const { selectReactor } = useReactors();

  const statusConfig = {
    running: { label: 'Running', dotClass: 'status-running' },
    idle: { label: 'Idle', dotClass: 'status-idle' },
    error: { label: 'Error', dotClass: 'status-error' },
    maintenance: { label: 'Maintenance', dotClass: 'status-maintenance' },
    optimizing: { label: 'Optimizing', dotClass: 'status-running' },
  };

  const config = statusConfig[reactor.status];
  const criticalAlerts = reactor.alerts.filter(a => a.type === 'critical' && !a.resolved).length;

  return (
    <div
      onClick={() => selectReactor(reactor.id)}
      className="reactor-card relative overflow-hidden"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          selectReactor(reactor.id);
        }
      }}
    >
      {/* Critical Alert Indicator */}
      {criticalAlerts > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black"></div>
      )}

      {/* Card Header */}
      <div className="card-header flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-black mb-1">
            {reactor.name}
          </h3>
          <p className="text-sm text-gray-600">
            {reactor.location}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 mt-1">
          <div className={`status-dot ${config.dotClass}`}></div>
          <span className="text-xs font-medium text-black uppercase tracking-wide">
            {config.label}
          </span>
        </div>
      </div>

      {/* Card Body - Metrics Grid */}
      <div className="card-body">
        <div className="grid grid-cols-2 gap-4">
          {/* Temperature */}
          <div>
            <div className="text-xs text-gray-500 mb-1">Temperature</div>
            <div className="text-xl font-bold text-black metric-value">
              {reactor.currentMetrics.temperature.toFixed(1)}°C
            </div>
          </div>

          {/* pH */}
          <div>
            <div className="text-xs text-gray-500 mb-1">pH Level</div>
            <div className="text-xl font-bold text-black metric-value">
              {reactor.currentMetrics.pH.toFixed(2)}
            </div>
          </div>

          {/* Enzyme Activity */}
          <div>
            <div className="text-xs text-gray-500 mb-1">Enzyme Activity</div>
            <div className="text-xl font-bold text-black metric-value">
              {reactor.currentMetrics.enzymeActivity.toFixed(1)}%
            </div>
          </div>

          {/* Product Yield */}
          <div>
            <div className="text-xs text-gray-500 mb-1">Product Yield</div>
            <div className="text-xl font-bold text-black metric-value">
              {reactor.currentMetrics.productYield.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider"></div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-500">Uptime: </span>
              <span className="font-medium text-black">
                {reactor.uptime.toFixed(1)}h
              </span>
            </div>
            <div>
              <span className="text-gray-500">Batches: </span>
              <span className="font-medium text-black">
                {reactor.totalBatches}
              </span>
            </div>
          </div>

          {/* Alert Count */}
          {reactor.alerts.filter(a => !a.resolved).length > 0 && (
            <div className="flex items-center gap-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-black"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium text-black">
                {reactor.alerts.filter(a => !a.resolved).length}
              </span>
            </div>
          )}
        </div>

        {/* AI Prediction Preview */}
        {reactor.predictions.enzymeDeactivation.hoursRemaining < 12 && (
          <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-start gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-black mt-0.5 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
                <path strokeLinecap="round" strokeWidth={2} d="M12 6v6l4 2" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-black mb-0.5">
                  Enzyme Deactivation Alert
                </div>
                <div className="text-xs text-gray-600">
                  Activity may drop below 70% in{' '}
                  <span className="font-medium text-black">
                    {reactor.predictions.enzymeDeactivation.hoursRemaining.toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Available */}
        {reactor.predictions.yieldOptimization.predictedYield > 
         reactor.currentMetrics.productYield + 5 && (
          <div className="mt-3 p-2 bg-black text-white rounded text-center">
            <div className="text-xs font-medium">
              Optimization Available: +
              {(reactor.predictions.yieldOptimization.predictedYield - 
                reactor.currentMetrics.productYield).toFixed(1)}% Yield
            </div>
          </div>
        )}
      </div>

      {/* Click Indicator */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
}