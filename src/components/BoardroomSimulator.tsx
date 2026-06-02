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

  return (
    <section className="boardroom-shell mb-8">
      <div className="boardroom-head">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Boardroom Mode</p>
          <h2 className="text-2xl font-bold text-white">90-Day ROI Simulator</h2>
          <p className="text-sm text-zinc-300 mt-2 max-w-3xl">
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

      <div className="mt-4 card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Why The Model Moves</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenario.drivers.map((driver) => (
            <div key={driver.label} className="p-3 rounded border border-zinc-700/60 bg-zinc-800/40">
              <div className="text-sm font-semibold text-white">{driver.label}</div>
              <div className="text-xs text-zinc-300 mt-1">{driver.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

