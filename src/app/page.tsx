'use client';

import { useState } from 'react';
import { useReactors } from '@/contexts/ReactorContext';
import ThemeToggle from '@/components/ThemeToggle';
import DashboardStats from '@/components/DashboardStats';
import ReactorCard from '@/components/ReactorCard';
import ReactorDetailView from '@/components/ReactorDetailView';
import BoardroomSimulator from '@/components/BoardroomSimulator';
import MoleculeIntelligence from '@/components/MoleculeIntelligence';
import V1Readiness from '@/components/V1Readiness';

type Tab = 'live' | 'v1';

export default function DashboardPage() {
  const { reactors, selectedReactor, selectReactor, cloudSync } = useReactors();
  const [activeTab, setActiveTab] = useState<Tab>('live');

  const averageYield = reactors.reduce((sum, r) => sum + r.currentMetrics.productYield, 0) / reactors.length;
  const projectedYieldGain = Math.max(6, Math.round((90 - averageYield) * 0.75));
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

  const streamLabel = cloudSync.mode === 'demo' ? 'Simulation Mode' : 'Live Cloud Mode';

  return (
    <div className="container-responsive py-8">

      {/* Hero — always visible */}
      <div className="executive-hero mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title mb-2">Reactor Intelligence</h1>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Real-time decision support for cell-free biomanufacturing. Designed to cut manual tuning cycles
              and convert every reactor run into measurable output gains.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="stream-pill">
              <span className="status-dot status-running" style={{ width: '0.5rem', height: '0.5rem' }}></span>
              <span>{streamLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-0 border-b border-zinc-800 mb-8">
        {([
          { id: 'live', label: 'Live Ops' },
          { id: 'v1',   label: 'v1 Readiness' },
        ] as { id: Tab; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-zinc-100 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Ops tab */}
      {activeTab === 'live' && (
        <>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="impact-card">
              <div className="impact-label">Projected Yield Uplift</div>
              <div className="impact-value">+{projectedYieldGain}%</div>
              <div className="impact-caption">from active optimization recommendations</div>
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
                <h2 className="text-xl font-semibold text-white mb-1">Reactor Dashboard</h2>
                <p className="text-sm text-zinc-400">
                  Real-time monitoring and AI-powered optimization
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="status-dot status-running"></div>
                <span className="text-zinc-400">Live Updates</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <DashboardStats />
          </div>

          <MoleculeIntelligence reactors={reactors} />

          <BoardroomSimulator reactors={reactors} />

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Reactor Systems</h2>
              <span className="text-sm text-zinc-400">
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
            <h3 className="card-title text-white">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <button
                className="btn-secondary text-left p-4 h-auto"
                onClick={() => {
                  const first = reactors.find((r) => r.alerts.filter((a) => !a.resolved).length > 0);
                  if (first) selectReactor(first.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-white mb-1">View Alerts</div>
                    <div className="text-sm text-zinc-400">
                      {reactors.reduce((sum, r) => sum + r.alerts.filter((a) => !a.resolved).length, 0)}{' '}
                      active alerts
                    </div>
                  </div>
                </div>
              </button>

              <button
                className="btn-secondary text-left p-4 h-auto"
                onClick={() => {
                  const first = reactors.find((r) => r.status === 'running');
                  if (first) selectReactor(first.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-white mb-1">AI Optimization</div>
                    <div className="text-sm text-zinc-400">Optimize reactor parameters</div>
                  </div>
                </div>
              </button>

              <button
                className="btn-secondary text-left p-4 h-auto"
                onClick={() => alert('Report generation — coming soon')}
              >
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-white mb-1">Generate Report</div>
                    <div className="text-sm text-zinc-400">Export system analytics</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-zinc-900 rounded border border-zinc-800">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                className="text-zinc-400 mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
                <path strokeLinecap="round" strokeWidth={2} d="M12 16v-4M12 8h.01" />
              </svg>
              <div className="flex-1">
                <div className="text-sm font-medium text-zinc-100 mb-1">Platform Status: Operational</div>
                <div className="text-xs text-zinc-500">
                  All systems connected | Data updates every 2 seconds | {syncText}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* v1 Readiness tab */}
      {activeTab === 'v1' && <V1Readiness reactors={reactors} />}

      {selectedReactor && (
        <ReactorDetailView reactor={selectedReactor} onClose={() => selectReactor('')} />
      )}
    </div>
  );
}
