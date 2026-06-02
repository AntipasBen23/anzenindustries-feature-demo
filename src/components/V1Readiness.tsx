'use client';

import type { Reactor } from '@/app/types/reactor';

interface Props {
  reactors: Reactor[];
}

// The six v1 launch criteria checked per reactor
function checkReadiness(reactor: Reactor) {
  const m = reactor.currentMetrics;
  const purity =
    m.enzymeActivity *
    Math.max(0, 1 - Math.abs(m.pH - 7.35) * 0.12) *
    (m.dissolvedOxygen / 100);
  return [
    { label: 'Yield ≥ 78%',    pass: m.productYield >= 78 },
    { label: 'Enzyme ≥ 80%',   pass: m.enzymeActivity >= 80 },
    { label: 'pH ± 0.15',      pass: Math.abs(m.pH - 7.35) < 0.15 },
    { label: 'O₂ ≥ 85%',       pass: m.dissolvedOxygen >= 85 },
    { label: 'Temp ± 0.5°C',   pass: Math.abs(m.temperature - 35.8) < 0.5 },
    { label: 'Purity ≥ 82%',   pass: purity >= 82 },
  ];
}

const PHASES = [
  {
    tag: 'Phase 1',
    name: 'Baseline Calibration',
    days: 'Days 1–14',
    milestones: [
      'Establish enzyme activity baseline per reactor',
      'Validate pH control within ±0.15 of 7.35',
      'Run 3 consecutive calibration batches per station',
      'Document first deactivation curves',
    ],
  },
  {
    tag: 'Phase 2',
    name: 'First Production Runs',
    days: 'Days 15–30',
    milestones: [
      'Target ≥6 runs without manual intervention',
      'Set OPC alert thresholds from Phase 1 data',
      'Begin substrate replenishment protocol testing',
      'Record anomaly frequency and type per station',
    ],
  },
  {
    tag: 'Phase 3',
    name: 'AI Optimization Cycles',
    days: 'Days 31–60',
    milestones: [
      'Run AI-guided parameter adjustments on one reactor',
      'Target sustained purity ≥82% over 5 runs',
      'Compare optimized vs baseline deactivation rate',
      'Build per-reactor performance fingerprint',
    ],
  },
  {
    tag: 'Phase 4',
    name: 'v1 Certification',
    days: 'Days 61–90',
    milestones: [
      'Sustain all v1 targets across ≥10 consecutive runs',
      'Complete anomaly response playbook',
      'Document cost-per-gram improvement trajectory',
      'v1 commercial readiness sign-off',
    ],
  },
];

export default function V1Readiness({ reactors }: Props) {
  // Per-reactor readiness
  const reactorChecks = reactors.map((r) => ({
    reactor: r,
    checks: checkReadiness(r),
  }));

  // Fleet averages for baseline targets table
  const n = reactors.length;
  const fleetYield   = reactors.reduce((s, r) => s + r.currentMetrics.productYield, 0) / n;
  const fleetEnzyme  = reactors.reduce((s, r) => s + r.currentMetrics.enzymeActivity, 0) / n;
  const fleetPhDev   = reactors.reduce((s, r) => s + Math.abs(r.currentMetrics.pH - 7.35), 0) / n;
  const fleetO2      = reactors.reduce((s, r) => s + r.currentMetrics.dissolvedOxygen, 0) / n;
  const fleetTempDev = reactors.reduce((s, r) => s + Math.abs(r.currentMetrics.temperature - 35.8), 0) / n;
  const fleetPurity  = reactors.reduce((s, r) => {
    const m = r.currentMetrics;
    return s + m.enzymeActivity * Math.max(0, 1 - Math.abs(m.pH - 7.35) * 0.12) * (m.dissolvedOxygen / 100);
  }, 0) / n;

  const targets = [
    {
      name: 'Product Yield',
      description: 'Minimum viable throughput per run for commercial ops',
      target: '≥ 78%',
      current: fleetYield.toFixed(1) + '%',
      ready: fleetYield >= 78,
      watch: fleetYield >= 74,
    },
    {
      name: 'Enzyme Activity',
      description: 'Stability baseline — sets your deactivation clock accuracy',
      target: '≥ 80%',
      current: fleetEnzyme.toFixed(1) + '%',
      ready: fleetEnzyme >= 80,
      watch: fleetEnzyme >= 75,
    },
    {
      name: 'pH Deviation',
      description: 'Buffer control tolerance from 7.35 optimum — drives purity and side reactions',
      target: '< 0.15',
      current: fleetPhDev.toFixed(3),
      ready: fleetPhDev < 0.15,
      watch: fleetPhDev < 0.30,
    },
    {
      name: 'Molecule Purity',
      description: 'Target molecule purity per run — the quality bar Amy ships against',
      target: '≥ 82%',
      current: fleetPurity.toFixed(1) + '%',
      ready: fleetPurity >= 82,
      watch: fleetPurity >= 75,
    },
    {
      name: 'Temperature Stability',
      description: 'Drift from 35.8°C — chiller tolerance matters more early than it did in the lab',
      target: '< 0.5°C',
      current: fleetTempDev.toFixed(2) + '°C',
      ready: fleetTempDev < 0.5,
      watch: fleetTempDev < 0.8,
    },
    {
      name: 'Dissolved Oxygen',
      description: 'Sparging adequacy — critical for enzyme turnover rate',
      target: '≥ 85%',
      current: fleetO2.toFixed(1) + '%',
      ready: fleetO2 >= 85,
      watch: fleetO2 >= 80,
    },
  ];

  // Live anomaly detection against current reactor state
  const enzymeSpread =
    Math.max(...reactors.map((r) => r.currentMetrics.enzymeActivity)) -
    Math.min(...reactors.map((r) => r.currentMetrics.enzymeActivity));

  const anomalies = [
    {
      name: 'Enzyme Batch Variability',
      detail:
        'Common in cell-free v1 when enzyme lots differ across stations. Target <5% activity spread before scaling throughput.',
      status:
        enzymeSpread > 5 ? 'detected' : enzymeSpread > 3 ? 'watch' : 'clear',
      context: `${enzymeSpread.toFixed(1)}% spread across stations`,
    },
    {
      name: 'pH Startup Drift',
      detail:
        'Expect 0.1–0.3 drift in the first 12h of each run as buffers equilibrate. Establish automated correction triggers early — do not rely on manual checks.',
      status:
        reactors.some((r) => Math.abs(r.currentMetrics.pH - 7.35) > 0.25)
          ? 'detected'
          : reactors.some((r) => Math.abs(r.currentMetrics.pH - 7.35) > 0.15)
          ? 'watch'
          : 'clear',
      context: `Max deviation: ${Math.max(...reactors.map((r) => Math.abs(r.currentMetrics.pH - 7.35))).toFixed(3)} from 7.35`,
    },
    {
      name: 'Flow Rate Instability',
      detail:
        'Pump calibration drift is normal in new hardware. Flag if any station exceeds ±15 mL/min from 150 across 3 consecutive readings.',
      status:
        reactors.some((r) => r.currentMetrics.flowRate < 128 || r.currentMetrics.flowRate > 168)
          ? 'detected'
          : reactors.some((r) => r.currentMetrics.flowRate < 135 || r.currentMetrics.flowRate > 165)
          ? 'watch'
          : 'clear',
      context: `Range: ${Math.min(...reactors.map((r) => r.currentMetrics.flowRate)).toFixed(0)}–${Math.max(...reactors.map((r) => r.currentMetrics.flowRate)).toFixed(0)} mL/min`,
    },
    {
      name: 'Mid-Run Substrate Depletion',
      detail:
        'A substrate drop mid-run can signal higher-than-modelled enzyme activity — sometimes good news, but plan replenishment protocols before it becomes a yield floor.',
      status:
        reactors.some((r) => r.currentMetrics.substrateConcentration < 7)
          ? 'detected'
          : reactors.some((r) => r.currentMetrics.substrateConcentration < 9)
          ? 'watch'
          : 'clear',
      context: `Min concentration: ${Math.min(...reactors.map((r) => r.currentMetrics.substrateConcentration)).toFixed(1)} g/L`,
    },
    {
      name: 'Temperature Excursion',
      detail:
        'Chiller lag in the first month of California ops is common. Use ±0.5°C as your v1 alert threshold — tighter lab specs will generate noise before hardware is broken in.',
      status:
        reactors.some((r) => Math.abs(r.currentMetrics.temperature - 35.8) > 0.8)
          ? 'detected'
          : reactors.some((r) => Math.abs(r.currentMetrics.temperature - 35.8) > 0.5)
          ? 'watch'
          : 'clear',
      context: `Max drift: ${Math.max(...reactors.map((r) => Math.abs(r.currentMetrics.temperature - 35.8))).toFixed(2)}°C from 35.8`,
    },
    {
      name: 'Dissolved O₂ Drop',
      detail:
        'Sparging calibration in new reactors typically needs 2–3 run cycles to stabilise. Track trend over time, not just single-point threshold breaches.',
      status:
        reactors.some((r) => r.currentMetrics.dissolvedOxygen < 80)
          ? 'detected'
          : reactors.some((r) => r.currentMetrics.dissolvedOxygen < 85)
          ? 'watch'
          : 'clear',
      context: `Min: ${Math.min(...reactors.map((r) => r.currentMetrics.dissolvedOxygen)).toFixed(0)}%`,
    },
  ];

  const statusIcon = (s: string) =>
    s === 'detected' ? '●' : s === 'watch' ? '◎' : '○';
  const statusColor = (s: string) =>
    s === 'detected' ? 'text-zinc-200' : s === 'watch' ? 'text-zinc-400' : 'text-zinc-600';

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">v1 Launch Intelligence</p>
        <h2 className="text-xl font-semibold text-white">Tera v1 Readiness</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
          What to measure, establish, and watch in the first 90 days of California operations.
          Built around where Tera actually is — not where a generic biomanufacturing company is.
        </p>
      </div>

      {/* Station readiness scores */}
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Station Readiness</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reactorChecks.map(({ reactor, checks }) => {
            const passed = checks.filter((c) => c.pass).length;
            const isReady = passed >= 5;
            const isWatch = passed >= 3 && !isReady;
            return (
              <div key={reactor.id} className="card p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-white">{reactor.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{reactor.id}</div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isReady
                        ? 'bg-zinc-100 text-zinc-900'
                        : isWatch
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isReady ? 'Ready' : isWatch ? 'Watch' : 'At Risk'}
                  </span>
                </div>

                <div className="space-y-2">
                  {checks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{check.label}</span>
                      <span className={`text-xs font-mono font-medium ${check.pass ? 'text-zinc-100' : 'text-zinc-600'}`}>
                        {check.pass ? '✓' : '—'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-500">v1 criteria met</span>
                    <span className="font-mono text-zinc-100">{passed} / {checks.length}</span>
                  </div>
                  <div className="h-px bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-100 rounded-full transition-all duration-500"
                      style={{ width: `${(passed / checks.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Baseline targets table */}
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">v1 Baseline Targets</p>
        <div className="card overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-zinc-800">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Metric</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Target</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right w-20">Fleet Avg</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right w-16">Status</span>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {targets.map((t) => (
              <div key={t.name} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-white">{t.name}</div>
                  <div className="text-xs text-zinc-600 mt-0.5">{t.description}</div>
                </div>
                <div className="text-xs font-mono text-zinc-500 text-right">{t.target}</div>
                <div className={`text-sm font-mono font-medium text-right w-20 ${t.ready ? 'text-zinc-100' : t.watch ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {t.current}
                </div>
                <div className={`text-xs font-medium text-right w-16 ${t.ready ? 'text-zinc-300' : t.watch ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  {t.ready ? 'Ready' : t.watch ? 'Watch' : 'At Risk'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly watch list */}
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Early Anomaly Intelligence</p>
        <p className="text-xs text-zinc-600 mb-4">
          What to expect and watch in v1 California operations — live status from current reactor telemetry
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anomalies.map((a) => (
            <div key={a.name} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-white">{a.name}</span>
                <span className={`text-xs font-medium ml-3 flex-shrink-0 font-mono ${statusColor(a.status)}`}>
                  {statusIcon(a.status)} {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{a.detail}</p>
              <div className="mt-2.5 text-xs font-mono text-zinc-600">{a.context}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 90-day timeline */}
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">90-Day Launch Plan</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {PHASES.map((phase) => (
            <div key={phase.tag} className="card p-4">
              <div className="text-xs font-mono text-zinc-600 mb-1">{phase.days}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-0.5">{phase.tag}</div>
              <div className="text-sm font-semibold text-white mb-3">{phase.name}</div>
              <ul className="space-y-2">
                {phase.milestones.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="text-zinc-700 mt-0.5 flex-shrink-0">—</span>
                    <span className="leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
