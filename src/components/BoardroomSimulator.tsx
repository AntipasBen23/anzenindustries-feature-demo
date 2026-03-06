'use client';

import { useMemo, useState } from 'react';
import type { Reactor } from '@/app/types/reactor';

interface BoardroomSimulatorProps {
  reactors: Reactor[];
}

interface RoiScenario {
  label: string;
  yield: number;
  downtimeHours: number;
  batches: number;
  confidence: [number, number];
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function estimateRevenue(yieldPct: number, batches: number) {
  const unitValue = 2400;
  const conversion = yieldPct / 100;
  return Math.round(unitValue * batches * conversion);
}

export default function BoardroomSimulator({ reactors }: BoardroomSimulatorProps) {
  const [mode, setMode] = useState<'current' | 'optimized'>('optimized');

  const scenario = useMemo(() => {
    const avgYield = reactors.reduce((sum, reactor) => sum + reactor.currentMetrics.productYield, 0) / reactors.length;
    const unresolvedAlerts = reactors.reduce(
      (sum, reactor) => sum + reactor.alerts.filter((alert) => !alert.resolved).length,
      0
    );

    const current: RoiScenario = {
      label: 'Current Ops',
      yield: round(avgYield),
      downtimeHours: round(reactors.length * 18 + unresolvedAlerts * 0.8),
      batches: Math.round(reactors.length * 92),
      confidence: [62, 72],
    };

    const optimized: RoiScenario = {
      label: 'AI-Optimized Ops',
      yield: round(Math.min(95, avgYield + 11.8)),
      downtimeHours: round(Math.max(8, current.downtimeHours * 0.56)),
      batches: Math.round(current.batches * 1.24),
      confidence: [79, 89],
    };

    const selected = mode === 'optimized' ? optimized : current;
    const deltaYield = round(optimized.yield - current.yield);
    const deltaDowntime = round(current.downtimeHours - optimized.downtimeHours);
    const deltaBatches = optimized.batches - current.batches;
    const currentRevenue = estimateRevenue(current.yield, current.batches);
    const optimizedRevenue = estimateRevenue(optimized.yield, optimized.batches);

    return {
      current,
      optimized,
      selected,
      deltas: {
        yield: deltaYield,
        downtime: deltaDowntime,
        batches: deltaBatches,
        revenue: optimizedRevenue - currentRevenue,
      },
      drivers: [
        {
          label: 'pH Stability Window',
          detail: `Variance tightened by 34%, reducing side reactions and raising conversion efficiency.`,
        },
        {
          label: 'Deactivation Timing',
          detail: `Forecast-guided replenishment adds ~${Math.max(4, Math.round(deltaBatches / 8))} productive reactor hours/week.`,
        },
        {
          label: 'Flow/Pressure Coupling',
          detail: `Adaptive flow-rate correction recovers ~${Math.max(6, Math.round(deltaYield * 0.9))}% yield under transient load.`,
        },
      ],
    };
  }, [mode, reactors]);

  const exportProposal = () => {
    const lines = [
      'ANZEN INDUSTRIES - PILOT PROPOSAL',
      '',
      'Program: Reactor Intelligence Boardroom Mode',
      'Window: 90 days',
      '',
      `Current Yield: ${scenario.current.yield}%`,
      `Optimized Yield: ${scenario.optimized.yield}%`,
      `Yield Uplift: +${scenario.deltas.yield}%`,
      '',
      `Current Downtime: ${scenario.current.downtimeHours}h`,
      `Optimized Downtime: ${scenario.optimized.downtimeHours}h`,
      `Downtime Avoided: ${scenario.deltas.downtime}h`,
      '',
      `Current Batches: ${scenario.current.batches}`,
      `Optimized Batches: ${scenario.optimized.batches}`,
      `Additional Batches: +${scenario.deltas.batches}`,
      '',
      `Estimated 90-day Revenue Delta: +$${scenario.deltas.revenue.toLocaleString()}`,
      '',
      'Top Drivers:',
      ...scenario.drivers.map((driver) => `- ${driver.label}: ${driver.detail}`),
      '',
      'Recommendation:',
      'Run a 6-week pilot on 2 reactors with weekly performance review gates.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'anzen-pilot-proposal.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="boardroom-shell mb-8">
      <div className="boardroom-head">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-600 mb-1">Boardroom Mode</p>
          <h2 className="text-2xl font-bold text-black">90-Day ROI Simulator</h2>
          <p className="text-sm text-gray-700 mt-2 max-w-3xl">
            Translate reactor optimization into hiring, throughput, and commercial outcomes leadership can act on.
          </p>
        </div>
        <div className="mode-switch">
          <button
            className={mode === 'current' ? 'mode-active' : 'mode-btn'}
            onClick={() => setMode('current')}
          >
            Current Ops
          </button>
          <button
            className={mode === 'optimized' ? 'mode-active' : 'mode-btn'}
            onClick={() => setMode('optimized')}
          >
            AI-Optimized
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <div className="roi-card-3d">
          <div className="roi-label">Projected Yield</div>
          <div className="roi-value">{scenario.selected.yield}%</div>
          <div className="roi-sub">Delta vs current: +{scenario.deltas.yield}%</div>
        </div>
        <div className="roi-card-3d">
          <div className="roi-label">Downtime Hours</div>
          <div className="roi-value">{scenario.selected.downtimeHours}h</div>
          <div className="roi-sub">Avoided: {scenario.deltas.downtime}h / 90d</div>
        </div>
        <div className="roi-card-3d">
          <div className="roi-label">Batches Completed</div>
          <div className="roi-value">{scenario.selected.batches}</div>
          <div className="roi-sub">Increase: +{scenario.deltas.batches}</div>
        </div>
        <div className="roi-card-3d roi-card-highlight">
          <div className="roi-label">Revenue Delta</div>
          <div className="roi-value">+${scenario.deltas.revenue.toLocaleString()}</div>
          <div className="roi-sub">
            Confidence: {scenario.selected.confidence[0]}-{scenario.selected.confidence[1]}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <div className="xl:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-black mb-3">Why The Model Moves</h3>
          <div className="space-y-3">
            {scenario.drivers.map((driver) => (
              <div key={driver.label} className="p-3 rounded border border-gray-200 bg-gray-50">
                <div className="text-sm font-semibold text-black">{driver.label}</div>
                <div className="text-xs text-gray-700 mt-1">{driver.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-black mb-3">Executive Action Pack</h3>
          <p className="text-xs text-gray-700 mb-4">
            Export a concise pilot recommendation with hard numbers for stakeholder review.
          </p>
          <button className="btn-primary w-full" onClick={exportProposal}>
            Export Pilot Proposal
          </button>
          <div className="mt-3 text-xs text-gray-600">
            Includes upside, confidence band, and top operational drivers.
          </div>
        </div>
      </div>
    </section>
  );
}

