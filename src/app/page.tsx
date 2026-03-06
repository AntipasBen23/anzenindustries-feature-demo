'use client';

import { useReactors } from '@/contexts/ReactorContext';
import DashboardStats from '@/components/DashboardStats';
import ReactorCard from '@/components/ReactorCard';
import ReactorDetailView from '@/components/ReactorDetailView';

export default function DashboardPage() {
  const { reactors, selectedReactor, selectReactor, cloudSync } = useReactors();
  const averageYield = reactors.reduce((sum, reactor) => sum + reactor.currentMetrics.productYield, 0) / reactors.length;
  const projectedYieldGain = Math.max(6, Math.round((90 - averageYield) * 0.75));
  const annualBatchUplift = Math.round(reactors.length * 28 * (projectedYieldGain / 10));
  const avoidedDowntimeHours = Math.round(reactors.length * 4.5);

  const syncText = cloudSync.lastError
    ? `Sync issue: ${cloudSync.lastError}`
    : cloudSync.mode === 'demo'
      ? cloudSync.lastSyncedAt
        ? `Demo stream synced at ${cloudSync.lastSyncedAt.toLocaleTimeString()}`
        : 'Starting demo stream...'
      : cloudSync.lastSyncedAt
        ? `Cloud synced at ${cloudSync.lastSyncedAt.toLocaleTimeString()}`
        : 'Connecting to cloud sync...';

  const streamLabel = cloudSync.mode === 'demo'
    ? 'Simulation Mode'
    : 'Live Cloud Mode';

  return (
    <div className="container-responsive py-8">
      <div className="executive-hero mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-600 mb-2">Anzen Reactor Intelligence</p>
            <h1 className="section-title mb-2">Optimization Command Center</h1>
            <p className="text-sm text-gray-700 max-w-2xl">
              Real-time decision support for cell-free biomanufacturing. Designed to cut manual tuning cycles
              and convert every reactor run into measurable output gains.
            </p>
          </div>
          <div className="stream-pill">
            <span className="w-2 h-2 rounded-full bg-black pulse-indicator"></span>
            <span>{streamLabel}</span>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="impact-card">
          <div className="impact-label">Projected Yield Uplift</div>
          <div className="impact-value">+{projectedYieldGain}%</div>
          <div className="impact-caption">from active optimization recommendations</div>
        </div>
        <div className="impact-card">
          <div className="impact-label">Annual Batch Increase</div>
          <div className="impact-value">+{annualBatchUplift}</div>
          <div className="impact-caption">estimated additional successful runs</div>
        </div>
        <div className="impact-card">
          <div className="impact-label">Downtime Avoided</div>
          <div className="impact-value">{avoidedDowntimeHours}h</div>
          <div className="impact-caption">early anomaly detection and intervention</div>
        </div>
      </div>

      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-black mb-1">Reactor Dashboard</h2>
            <p className="text-sm text-gray-600">
              Real-time monitoring and AI-powered optimization
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-black rounded-full pulse-indicator"></div>
            <span className="text-gray-600">Live Updates</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <DashboardStats />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">Reactor Systems</h2>
          <span className="text-sm text-gray-600">
            {reactors.length} {reactors.length === 1 ? 'reactor' : 'reactors'} configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reactors.map((reactor) => (
            <ReactorCard key={reactor.id} reactor={reactor} />
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="card-title">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <button
            className="btn-secondary text-left p-4 h-auto"
            onClick={() => {
              const firstReactorWithAlerts = reactors.find(
                (reactor) => reactor.alerts.filter((alert) => !alert.resolved).length > 0
              );
              if (firstReactorWithAlerts) {
                selectReactor(firstReactorWithAlerts.id);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <div className="font-semibold text-black mb-1">View Alerts</div>
                <div className="text-sm text-gray-600">
                  {reactors.reduce(
                    (sum, reactor) => sum + reactor.alerts.filter((alert) => !alert.resolved).length,
                    0
                  )}{' '}
                  active alerts
                </div>
              </div>
            </div>
          </button>

          <button
            className="btn-secondary text-left p-4 h-auto"
            onClick={() => {
              const firstRunningReactor = reactors.find((reactor) => reactor.status === 'running');
              if (firstRunningReactor) {
                selectReactor(firstRunningReactor.id);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div>
                <div className="font-semibold text-black mb-1">AI Optimization</div>
                <div className="text-sm text-gray-600">Optimize reactor parameters</div>
              </div>
            </div>
          </button>

          <button
            className="btn-secondary text-left p-4 h-auto"
            onClick={() => {
              alert('Report generation feature - Coming soon in full version');
            }}
          >
            <div className="flex items-start gap-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <div className="font-semibold text-black mb-1">Generate Report</div>
                <div className="text-sm text-gray-600">Export system analytics</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
        <div className="flex items-start gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-black mt-0.5 flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M12 16v-4M12 8h.01" />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-medium text-black mb-1">Platform Status: Operational</div>
            <div className="text-xs text-gray-600">
              All systems connected | Data updates every 2 seconds | {syncText}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border-2 border-black rounded">
        <div className="flex items-start gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-black mt-0.5 flex-shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-bold text-black mb-1">Investor-Ready Demo Mode</div>
            <div className="text-xs text-gray-700">
              This interface demonstrates real-time reactor monitoring with physics-based simulations.
              It is intentionally frontend-first to validate operational workflows, optimization decisions,
              and measurable business impact before full sensor integration.
            </div>
          </div>
        </div>
      </div>

      {selectedReactor && (
        <ReactorDetailView reactor={selectedReactor} onClose={() => selectReactor('')} />
      )}
    </div>
  );
}

