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
  return Math.round(2400 * batches * (yieldPct / 100));
}

export default function BoardroomSimulator({ reactors }: BoardroomSimulatorProps) {
  const [mode, setMode] = useState<'current' | 'optimized'>('optimized');

  const scenario = useMemo(() => {
    const avgYield = reactors.reduce((sum, r) => sum + r.currentMetrics.productYield, 0) / reactors.length;
    const unresolvedAlerts = reactors.reduce(
      (sum, r) => sum + r.alerts.filter((a) => !a.resolved).length,
      0
    );
    const avgEnzymeActivity =
      reactors.reduce((sum, r) => sum + r.currentMetrics.enzymeActivity, 0) / reactors.length;

    const current: RoiScenario = {
      label: 'Current',
      yield: round(avgYield),
      downtimeHours: round(reactors.length * 18 + unresolvedAlerts * 0.8),
      batches: Math.round(reactors.length * 92),
      confidence: [62, 72],
    };

    const optimized: RoiScenario = {
      label: 'AI-Optimized',
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

    // --- Molecular Economics ---
    // Fleet-average purity: enzyme selectivity × pH optimality × dissolved O₂
    const avgRawPurity =
      reactors.reduce((sum, r) => {
        const m = r.currentMetrics;
        return (
          sum +
          m.enzymeActivity *
            Math.max(0, 1 - Math.abs(m.pH - 7.35) * 0.12) *
            (m.dissolvedOxygen / 100)
        );
      }, 0) / reactors.length;

    const currentPurity = Math.round(avgRawPurity * 10) / 10;
    // Purity improves with yield optimisation (tighter pH/temp control)
    const optimizedPurity = Math.round(Math.min(95, currentPurity + deltaYield * 0.5) * 10) / 10;

    // Cost per gram — 10 L reactor, 10 g/L max product concentration, $11,500/run
    const costPerRun = 11500;
    const currentGpR = 10 * 10 * (current.yield / 100) * (currentPurity / 100);
    const optimizedGpR = 10 * 10 * (optimized.yield / 100) * (optimizedPurity / 100);
    const currentCostPerGram = Math.round(costPerRun / currentGpR);
    const optimizedCostPerGram = Math.round(costPerRun / optimizedGpR);

    // Time to 88% purity milestone (sustained across ≥3 consecutive runs)
    const targetPurity = 88;
    const purityGap = Math.max(0, targetPurity - currentPurity);
    const baseRatePerRun = Math.max(0.5, 0.6 + (avgEnzymeActivity - 75) * 0.04);
    const currentRunsNeeded = purityGap > 0 ? Math.ceil(purityGap / baseRatePerRun) + 3 : 3;
    const optimizedRunsNeeded =
      purityGap > 0 ? Math.ceil(purityGap / (baseRatePerRun * 2.6)) + 1 : 1;
    const runDays = 2;
    const currentDaysToMilestone = currentRunsNeeded * runDays;
    const optimizedDaysToMilestone = Math.max(2, optimizedRunsNeeded * runDays);

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
      molecularEconomics: {
        currentCostPerGram,
        optimizedCostPerGram,
        deltaCostPerGram: currentCostPerGram - optimizedCostPerGram,
        currentPurity,
        optimizedPurity,
        currentDaysToMilestone,
        optimizedDaysToMilestone,
        deltaDaysToMilestone: currentDaysToMilestone - optimizedDaysToMilestone,
        targetPurity,
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

  const me = scenario.molecularEconomics;

  return (
    <section className="boardroom-shell mb-8">
      <div className="boardroom-head">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Founder Mode</p>
          <h2 className="text-2xl font-bold text-white">90-Day Optimization Model</h2>
          <p className="text-sm text-zinc-300 mt-2 max-w-3xl">
            From molecule purity to margin — optimization modeled across both dimensions.
          </p>
        </div>
        <div className="mode-switch">
          <button
            className={mode === 'current' ? 'mode-active' : 'mode-btn'}
            onClick={() => setMode('current')}
          >
            Current
          </button>
          <button
            className={mode === 'optimized' ? 'mode-active' : 'mode-btn'}
            onClick={() => setMode('optimized')}
          >
            AI-Optimized
          </button>
        </div>
      </div>

      {/* Commercial KPIs */}
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
            Confidence: {scenario.selected.confidence[0]}–{scenario.selected.confidence[1]}%
          </div>
        </div>
      </div>

      {/* Molecular Economics — science + commercial bridge */}
      <div className="mt-4 card p-5">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-5">Molecular Economics</p>

        <div className="space-y-5">
          {/* Cost per gram */}
          <div>
            <p className="text-xs text-zinc-500 mb-3">
              Cost per gram of target molecule
              <span className="ml-2 text-zinc-700">10 L reactor · $11,500 / run · purity-adjusted</span>
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-zinc-600 mb-1">Current</div>
                <div className="text-xl font-mono font-semibold text-zinc-300">
                  ${me.currentCostPerGram}
                  <span className="text-sm font-normal text-zinc-500"> /g</span>
                </div>
                <div className="text-xs text-zinc-600 mt-1">{me.currentPurity}% purity</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 mb-1">AI-Optimized</div>
                <div className="text-xl font-mono font-semibold text-white">
                  ${me.optimizedCostPerGram}
                  <span className="text-sm font-normal text-zinc-500"> /g</span>
                </div>
                <div className="text-xs text-zinc-600 mt-1">{me.optimizedPurity}% purity</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 mb-1">Reduction</div>
                <div className="text-xl font-mono font-semibold text-zinc-100">
                  −${me.deltaCostPerGram}
                  <span className="text-sm font-normal text-zinc-500"> /g</span>
                </div>
                <div className="text-xs text-zinc-600 mt-1">per gram saved</div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800" />

          {/* Time to purity milestone */}
          <div>
            <p className="text-xs text-zinc-500 mb-3">
              Days to {me.targetPurity}% purity milestone
              <span className="ml-2 text-zinc-700">sustained across ≥3 consecutive runs</span>
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-zinc-600 mb-1">Current</div>
                <div className="text-xl font-mono font-semibold text-zinc-300">
                  {me.currentDaysToMilestone}
                  <span className="text-sm font-normal text-zinc-500"> days</span>
                </div>
                <div className="text-xs text-zinc-600 mt-1">at current rate</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 mb-1">AI-Optimized</div>
                <div className="text-xl font-mono font-semibold text-white">
                  {me.optimizedDaysToMilestone}
                  <span className="text-sm font-normal text-zinc-500"> days</span>
                </div>
                <div className="text-xs text-zinc-600 mt-1">with parameter tuning</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 mb-1">Faster by</div>
                <div className="text-xl font-mono font-semibold text-zinc-100">
                  {me.deltaDaysToMilestone}
                  <span className="text-sm font-normal text-zinc-500"> days</span>
                </div>
                <div className="text-xs text-zinc-600 mt-1">to milestone</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why The Model Moves */}
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
