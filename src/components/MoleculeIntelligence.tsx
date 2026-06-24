'use client';

import type { Reactor } from '@/app/types/reactor';

interface Props {
  reactors: Reactor[];
}

interface MoleculeMetrics {
  purity: number;
  pathwayEfficiency: number;
  interactionScore: number;
}

function computeMoleculeMetrics(reactor: Reactor): MoleculeMetrics {
  const m = reactor.currentMetrics;

  // Purity: enzyme selectivity degrades with pH drift from 7.35 and low dissolved O₂
  const purity = Math.max(0, Math.min(98,
    m.enzymeActivity
    * Math.max(0, 1 - Math.abs(m.pH - 7.35) * 0.12)
    * (m.dissolvedOxygen / 100)
  ));

  // Pathway efficiency: substrate→product conversion rate, penalised by temperature drift from 35.8°C
  const pathwayEfficiency = Math.max(0, Math.min(98,
    m.productYield * Math.max(0, 1 - Math.abs(m.temperature - 35.8) * 0.008)
  ));

  // Enzyme–molecule interaction: composite of enzyme health, thermal fit, and pH optimality
  const interactionScore = Math.max(0, Math.min(98,
    m.enzymeActivity
    * Math.max(0, 1 - Math.abs(m.temperature - 35.8) * 0.02)
    * Math.max(0, 1 - Math.abs(m.pH - 7.35) * 0.15)
  ));

  return {
    purity: Math.round(purity * 10) / 10,
    pathwayEfficiency: Math.round(pathwayEfficiency * 10) / 10,
    interactionScore: Math.round(interactionScore * 10) / 10,
  };
}

function fleetAvg(values: number[]) {
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function ThinBar({ value }: { value: number }) {
  const pct = Math.min(100, value);
  const dim = value < 75;
  return (
    <div className="h-px bg-zinc-800 rounded-full overflow-hidden mt-1.5">
      <div
        className={`h-full rounded-full transition-all duration-500 ${dim ? 'bg-zinc-500' : 'bg-zinc-100'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function MoleculeIntelligence({ reactors }: Props) {
  const allMetrics = reactors.map(computeMoleculeMetrics);

  const fleetPurity = fleetAvg(allMetrics.map((m) => m.purity));
  const fleetPathway = fleetAvg(allMetrics.map((m) => m.pathwayEfficiency));
  const fleetInteraction = fleetAvg(allMetrics.map((m) => m.interactionScore));

  return (
    <div className="mb-8">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Molecule Intelligence</p>
        <h2 className="text-xl font-semibold text-white">Molecular Quality Layer</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Per-run metrics derived from live reactor telemetry · updates every 2s
        </p>
      </div>

      {/* Fleet averages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="metric-card">
          <div className="metric-label mb-3">Target Molecule Purity</div>
          <div className="metric-value-large font-mono">{fleetPurity}%</div>
          <div className="text-xs text-zinc-500 mt-2 leading-relaxed">
            Enzyme selectivity × pH optimality × dissolved O₂
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label mb-3">Pathway Efficiency</div>
          <div className="metric-value-large font-mono">{fleetPathway}%</div>
          <div className="text-xs text-zinc-500 mt-2 leading-relaxed">
            Substrate → product conversion rate, penalised by temperature drift
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label mb-3">Enz–Mol Interaction Score</div>
          <div className="metric-value-large font-mono">{fleetInteraction}<span className="text-sm text-zinc-500 font-normal ml-1">/100</span></div>
          <div className="text-xs text-zinc-500 mt-2 leading-relaxed">
            Enzyme activity × thermal fit × pH optimality
          </div>
        </div>
      </div>

      {/* Per-reactor breakdown */}
      <div className="card p-5">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-5">Per-reactor breakdown</p>
        <div className="divide-y divide-zinc-800">
          {reactors.map((reactor, i) => {
            const m = allMetrics[i];
            const station = reactor.location.split('·')[1]?.trim() ?? reactor.location;
            return (
              <div key={reactor.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-sm font-semibold text-white">{reactor.name}</span>
                  <span className="text-xs text-zinc-600">{reactor.id} · {station}</span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-zinc-500">Purity</span>
                      <span className={`text-sm font-mono font-medium tabular-nums ${m.purity < 75 ? 'text-zinc-400' : 'text-zinc-100'}`}>
                        {m.purity}%
                      </span>
                    </div>
                    <ThinBar value={m.purity} />
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-zinc-500">Pathway</span>
                      <span className={`text-sm font-mono font-medium tabular-nums ${m.pathwayEfficiency < 75 ? 'text-zinc-400' : 'text-zinc-100'}`}>
                        {m.pathwayEfficiency}%
                      </span>
                    </div>
                    <ThinBar value={m.pathwayEfficiency} />
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-zinc-500">Enz–Mol</span>
                      <span className={`text-sm font-mono font-medium tabular-nums ${m.interactionScore < 75 ? 'text-zinc-400' : 'text-zinc-100'}`}>
                        {m.interactionScore}
                      </span>
                    </div>
                    <ThinBar value={m.interactionScore} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
