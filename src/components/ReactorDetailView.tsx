'use client';

import { useState } from 'react';
import type { Reactor } from '@/app/types/reactor';
import { useReactors } from '@/contexts/ReactorContext';

interface ReactorDetailViewProps {
  reactor: Reactor;
  onClose: () => void;
}

export default function ReactorDetailView({ reactor, onClose }: ReactorDetailViewProps) {
  const { 
    updateReactorParameter, 
    startOptimization, 
    applyOptimization,
    dismissAlert,
    isOptimizing,
    optimizationResult 
  } = useReactors();

  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'predictions'>('overview');

  const metrics = [
    { 
      label: 'Temperature', 
      value: reactor.currentMetrics.temperature.toFixed(1), 
      unit: '°C',
      target: reactor.config.targetTemperature,
      parameter: 'temperature' as const
    },
    { 
      label: 'pH Level', 
      value: reactor.currentMetrics.pH.toFixed(2), 
      unit: '',
      target: reactor.config.targetPH,
      parameter: 'pH' as const
    },
    { 
      label: 'Pressure', 
      value: reactor.currentMetrics.pressure.toFixed(2), 
      unit: 'bar',
      target: reactor.config.targetPressure,
      parameter: 'pressure' as const
    },
    { 
      label: 'Flow Rate', 
      value: reactor.currentMetrics.flowRate.toFixed(0), 
      unit: 'mL/min',
      target: reactor.config.targetFlowRate,
      parameter: 'flowRate' as const
    },
    { 
      label: 'Enzyme Activity', 
      value: reactor.currentMetrics.enzymeActivity.toFixed(1), 
      unit: '%',
    },
    { 
      label: 'Substrate Conc.', 
      value: reactor.currentMetrics.substrateConcentration.toFixed(1), 
      unit: 'g/L',
    },
    { 
      label: 'Product Yield', 
      value: reactor.currentMetrics.productYield.toFixed(1), 
      unit: '%',
    },
    { 
      label: 'Dissolved O₂', 
      value: reactor.currentMetrics.dissolvedOxygen.toFixed(0), 
      unit: '%',
    },
  ];

  const unresolvedAlerts = reactor.alerts.filter(a => !a.resolved);
  const maintenanceDays = Math.floor(
    (reactor.currentMetrics.timestamp.getTime() - reactor.lastMaintenance.getTime()) / 86400000
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="border-b border-zinc-800 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{reactor.name}</h2>
                <div className="flex items-center gap-2">
                  <div className={`status-dot status-${reactor.status}`}></div>
                  <span className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
                    {reactor.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-400">{reactor.location}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                <span>ID: {reactor.id}</span>
                <span>•</span>
                <span>Uptime: {reactor.uptime.toFixed(1)}h</span>
                <span>•</span>
                <span>Total Batches: {reactor.totalBatches}</span>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded transition-colors"
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-800 px-6">
          <div className="flex gap-6">
            {(['overview', 'controls', 'predictions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-zinc-100 text-white font-medium'
                    : 'border-transparent text-zinc-500 hover:text-zinc-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Metrics Grid */}
              <div>
                <h3 className="card-title mb-4">Current Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="metric-card">
                      <div className="metric-label mb-2">{metric.label}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="metric-value-medium">{metric.value}</span>
                        <span className="text-sm text-zinc-400">{metric.unit}</span>
                      </div>
                      {metric.target !== undefined && (
                        <div className="text-xs text-zinc-500 mt-1">
                          Target: {metric.target.toFixed(1)}{metric.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts Section */}
              {unresolvedAlerts.length > 0 && (
                <div>
                  <h3 className="card-title mb-4">Active Alerts</h3>
                  <div className="space-y-2">
                    {unresolvedAlerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={`alert-${alert.type} p-4 rounded alert-enter flex items-start justify-between`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wide">
                              {alert.type}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-white">{alert.message}</p>
                        </div>
                        <button
                          onClick={() => dismissAlert(reactor.id, alert.id)}
                          className="ml-4 text-zinc-500 hover:text-zinc-100 transition-colors"
                          aria-label="Dismiss alert"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Operating Mode:</span>
                      <span className="font-medium text-zinc-100">{reactor.config.operatingMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Auto-Optimize:</span>
                      <span className="font-medium text-zinc-100">
                        {reactor.config.autoOptimize ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Min Enzyme Activity:</span>
                      <span className="font-medium text-zinc-100">{reactor.config.minEnzymeActivity}%</span>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Maintenance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Last Maintenance:</span>
                      <span className="font-medium text-zinc-100">
                        {maintenanceDays}d ago
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Runtime:</span>
                      <span className="font-medium text-zinc-100">
                        {(reactor.uptime / 24).toFixed(1)} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Completed Batches:</span>
                      <span className="font-medium text-zinc-100">{reactor.totalBatches}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls Tab */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              <div>
                <h3 className="card-title mb-4">Manual Parameter Control</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Adjust reactor parameters manually. Changes take effect gradually to prevent system shock.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {metrics.slice(0, 4).map((metric) => (
                    <div key={metric.label} className="card p-4">
                      <label className="block text-sm font-semibold text-white mb-2">
                        {metric.label}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          step="0.1"
                          defaultValue={metric.value}
                          className="flex-1"
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && metric.parameter) {
                              updateReactorParameter(reactor.id, metric.parameter, value);
                            }
                          }}
                        />
                        <span className="text-sm text-zinc-400 w-16">{metric.unit}</span>
                      </div>
                      {metric.target !== undefined && (
                        <div className="text-xs text-zinc-500 mt-2">
                          Current target: {metric.target.toFixed(1)}{metric.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Controls */}
              <div className="card p-4 border-2 border-zinc-700">
                <h4 className="text-sm font-semibold text-white mb-3">System Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button className="btn-secondary" disabled>
                    Pause Reactor
                  </button>
                  <button className="btn-secondary" disabled>
                    Reset Parameters
                  </button>
                  <button className="btn-secondary" disabled>
                    Emergency Stop
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Emergency controls disabled in demo mode
                </p>
              </div>
            </div>
          )}

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="space-y-6">
              {/* AI Optimization */}
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="card-title mb-2">AI-Powered Yield Optimization</h3>
                    <p className="text-sm text-zinc-400">
                      Machine learning model analyzes 14+ parameters to maximize production efficiency
                    </p>
                  </div>
                  <button
                    onClick={() => startOptimization(reactor.id)}
                    disabled={isOptimizing}
                    className="btn-primary"
                  >
                    {isOptimizing ? (
                      <span className="flex items-center gap-2">
                        <span className="spinner"></span>
                        Optimizing...
                      </span>
                    ) : (
                      'Run Optimization'
                    )}
                  </button>
                </div>

                {/* Current vs Predicted */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-zinc-800/60 p-4 rounded border border-zinc-700">
                    <div className="text-xs text-zinc-400 mb-1">Current Yield</div>
                    <div className="text-2xl font-bold text-white">
                      {reactor.predictions.yieldOptimization.currentYield.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-zinc-100 text-zinc-900 p-4 rounded">
                    <div className="text-xs opacity-75 mb-1">Predicted Yield</div>
                    <div className="text-2xl font-bold">
                      {reactor.predictions.yieldOptimization.predictedYield.toFixed(1)}%
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      +{(reactor.predictions.yieldOptimization.predictedYield - 
                        reactor.predictions.yieldOptimization.currentYield).toFixed(1)}% improvement
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {reactor.predictions.yieldOptimization.recommendedChanges.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Recommended Adjustments</h4>
                    <div className="space-y-2">
                      {reactor.predictions.yieldOptimization.recommendedChanges.map((change, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/60 rounded border border-zinc-700/50">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-zinc-100 capitalize">
                              {change.parameter.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-xs text-zinc-400">
                              {change.currentValue.toFixed(2)} → {change.suggestedValue.toFixed(2)} 
                              <span className="ml-2 text-white font-medium">{change.impact}</span>
                            </div>
                          </div>
                          <span className={`badge ${
                            change.priority === 'high' ? 'badge-outline' : 'badge-default'
                          }`}>
                            {change.priority}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => applyOptimization(reactor.id, reactor.predictions.yieldOptimization.recommendedChanges)}
                      className="btn-primary w-full mt-4"
                      disabled={isOptimizing}
                    >
                      Apply All Recommendations
                    </button>
                  </div>
                )}

                {/* Optimization Result */}
                {optimizationResult && optimizationResult.reactorId === reactor.id && (
                  <div className="mt-4 p-4 bg-zinc-100 text-zinc-900 rounded alert-enter">
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="flex-shrink-0 mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="flex-1">
                        <div className="font-semibold mb-1">Optimization Complete</div>
                        <div className="text-sm opacity-90">
                          Yield increase: +{optimizationResult.improvements.yieldIncrease.toFixed(1)}% • 
                          Efficiency gain: +{optimizationResult.improvements.efficiencyGain.toFixed(1)}% • 
                          Cost reduction: {optimizationResult.improvements.costReduction.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enzyme Deactivation Prediction */}
              <div className="card p-6">
                <h3 className="card-title mb-4">Enzyme Deactivation Forecast</h3>
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400 mb-2">Time Until 70% Activity</div>
                    <div className="text-3xl font-bold text-white">
                      {reactor.predictions.enzymeDeactivation.hoursRemaining.toFixed(1)} hours
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Confidence: {(reactor.predictions.enzymeDeactivation.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="w-32 h-32 relative">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#27272a"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#fafafa"
                        strokeWidth="8"
                        strokeDasharray={`${(reactor.currentMetrics.enzymeActivity / 100) * 251.2} 251.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {reactor.currentMetrics.enzymeActivity.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                {reactor.predictions.enzymeDeactivation.suggestedAction && (
                  <div className="p-3 bg-zinc-800/60 rounded text-sm text-zinc-200 border border-zinc-700/50">
                    <strong>Recommendation:</strong> {reactor.predictions.enzymeDeactivation.suggestedAction}
                  </div>
                )}
              </div>

              {/* Anomaly Detection */}
              <div className="card p-6">
                <h3 className="card-title mb-4">Anomaly Detection</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Anomaly Score</div>
                    <div className="text-2xl font-bold text-white">
                      {(reactor.predictions.anomalyDetection.score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded ${
                    reactor.predictions.anomalyDetection.score > 0.5 ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {reactor.predictions.anomalyDetection.score > 0.5 ? 'Attention Required' : 'Normal Operation'}
                  </div>
                </div>
                {reactor.predictions.anomalyDetection.parameters.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-zinc-100 mb-2">Flagged Parameters:</div>
                    <div className="flex flex-wrap gap-2">
                      {reactor.predictions.anomalyDetection.parameters.map((param, idx) => (
                        <span key={idx} className="badge badge-default capitalize">
                          {param.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
