'use client';

// Global state management for reactor monitoring platform
// Handles real-time updates, optimization, and user interactions

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  Reactor,
  ReactorMetrics,
  DashboardStats,
  OptimizationResult,
  ParameterAdjustment,
} from '@/app/types/reactor';
import {
  mockReactors,
  generateDashboardStats,
  createMockReactor,
} from '@/lib/mockData';

interface ReactorContextType {
  reactors: Reactor[];
  dashboardStats: DashboardStats;
  selectedReactor: Reactor | null;
  isOptimizing: boolean;
  optimizationResult: OptimizationResult | null;
  selectReactor: (reactorId: string) => void;
  updateReactorParameter: (reactorId: string, parameter: keyof ReactorMetrics, value: number) => void;
  startOptimization: (reactorId: string) => void;
  applyOptimization: (reactorId: string, changes: ParameterAdjustment[]) => void;
  dismissAlert: (reactorId: string, alertId: string) => void;
  refreshReactor: (reactorId: string) => void;
}

const ReactorContext = createContext<ReactorContextType | undefined>(undefined);

export function ReactorProvider({ children }: { children: React.ReactNode }) {
  const [reactors, setReactors] = useState<Reactor[]>(mockReactors);
  const [selectedReactor, setSelectedReactor] = useState<Reactor | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(
    generateDashboardStats(mockReactors)
  );
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

  // Real-time metric updates (every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setReactors((prevReactors) => {
        const updatedReactors = prevReactors.map((reactor) => {
          // Simulate realistic drift for each metric
          const updated = { ...reactor };
          const metrics = { ...reactor.currentMetrics };

          // Temperature drift toward target
          const tempTarget = reactor.config.targetTemperature;
          const tempError = tempTarget - metrics.temperature;
          metrics.temperature += tempError * 0.02 + (Math.random() - 0.5) * 0.1;

          // pH drift toward target
          const pHTarget = reactor.config.targetPH;
          const pHError = pHTarget - metrics.pH;
          metrics.pH += pHError * 0.01 + (Math.random() - 0.5) * 0.03;

          // Pressure follows flow rate
          const targetPressure = 1.0 + (metrics.flowRate / 200) * 0.4;
          const pressureError = targetPressure - metrics.pressure;
          metrics.pressure += pressureError * 0.05 + (Math.random() - 0.5) * 0.02;

          // Flow rate fluctuates slightly
          metrics.flowRate += (Math.random() - 0.5) * 3;
          metrics.flowRate = Math.max(100, Math.min(200, metrics.flowRate));

          // Enzyme activity decreases over time (exponential decay)
          const hoursRunning = reactor.uptime;
          const deactivationRate = 0.002;
          metrics.enzymeActivity = 95 * Math.exp(-deactivationRate * hoursRunning) + (Math.random() - 0.5) * 0.5;
          metrics.enzymeActivity = Math.max(60, metrics.enzymeActivity);

          // Substrate concentration decreases
          const consumptionRate = 0.5 * (metrics.enzymeActivity / 100);
          metrics.substrateConcentration -= consumptionRate * 0.001;
          metrics.substrateConcentration = Math.max(5, metrics.substrateConcentration + (Math.random() - 0.5) * 0.2);

          // Product yield depends on enzyme activity
          const theoreticalYield = (metrics.enzymeActivity / 100) * 90;
          const yieldError = theoreticalYield - metrics.productYield;
          metrics.productYield += yieldError * 0.05 + (Math.random() - 0.5) * 0.5;
          metrics.productYield = Math.max(60, Math.min(95, metrics.productYield));

          // Dissolved oxygen
          metrics.dissolvedOxygen += (Math.random() - 0.5) * 2;
          metrics.dissolvedOxygen = Math.max(75, Math.min(100, metrics.dissolvedOxygen));

          metrics.timestamp = new Date();

          // Add to history (keep last 288 points = 24 hours at 5-min intervals)
          const newHistoryPoint = {
            ...metrics,
            id: `${reactor.id}-${Date.now()}`,
          };
          
          updated.history = [...reactor.history.slice(-287), newHistoryPoint];
          updated.currentMetrics = metrics;
          updated.uptime += 2 / 3600; // Add 2 seconds in hours

          // Update predictions
          const currentActivity = metrics.enzymeActivity;
          const deactivationRateCalc = 0.002;
          const hoursTo70Percent = Math.log(currentActivity / 70) / deactivationRateCalc;

          updated.predictions = {
            ...reactor.predictions,
            enzymeDeactivation: {
              hoursRemaining: Math.max(0, hoursTo70Percent),
              confidence: 0.87 + Math.random() * 0.1,
              suggestedAction: currentActivity < 80 ? 'Consider enzyme replenishment' : undefined,
            },
          };

          // Update status based on metrics
          if (metrics.enzymeActivity < 70) {
            updated.status = 'maintenance';
          } else if (reactor.alerts.some(a => a.type === 'critical' && !a.resolved)) {
            updated.status = 'error';
          } else if (isOptimizing && reactor.id === selectedReactor?.id) {
            updated.status = 'optimizing';
          } else {
            updated.status = 'running';
          }

          return updated;
        });

        // Update dashboard stats
        setDashboardStats(generateDashboardStats(updatedReactors));

        return updatedReactors;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isOptimizing, selectedReactor]);

  // Select a reactor for detailed view
  const selectReactor = useCallback((reactorId: string) => {
    const reactor = reactors.find((r) => r.id === reactorId);
    setSelectedReactor(reactor || null);
  }, [reactors]);

  // Update a specific parameter (manual control)
  const updateReactorParameter = useCallback(
    (reactorId: string, parameter: keyof ReactorMetrics, value: number) => {
      setReactors((prevReactors) =>
        prevReactors.map((reactor) => {
          if (reactor.id !== reactorId) return reactor;

          const updated = { ...reactor };

          // Update target in config for controlled parameters
          if (parameter === 'temperature') {
            updated.config.targetTemperature = value;
          } else if (parameter === 'pH') {
            updated.config.targetPH = value;
          } else if (parameter === 'flowRate') {
            updated.currentMetrics.flowRate = value;
          }

          // Add alert for manual adjustment
          updated.alerts = [
            {
              id: `alert-${reactorId}-manual-${Date.now()}`,
              reactorId,
              type: 'info',
              message: `Manual adjustment: ${parameter} set to ${value.toFixed(2)}`,
              timestamp: new Date(),
              resolved: false,
              parameter,
              value,
            },
            ...reactor.alerts.slice(0, 4),
          ];

          return updated;
        })
      );
    },
    []
  );

  // Start AI optimization process
  const startOptimization = useCallback((reactorId: string) => {
    setIsOptimizing(true);
    
    const reactor = reactors.find((r) => r.id === reactorId);
    if (!reactor) return;

    // Simulate AI processing time
    setTimeout(() => {
      const currentYield = reactor.currentMetrics.productYield;
      const improvements = {
        yieldIncrease: 8.5 + Math.random() * 5,
        efficiencyGain: 12.3 + Math.random() * 3,
        costReduction: 7.8 + Math.random() * 2,
      };

      const result: OptimizationResult = {
        reactorId,
        timestamp: new Date(),
        status: 'completed',
        progress: 100,
        parametersAnalyzed: 14,
        improvements,
        appliedChanges: reactor.predictions.yieldOptimization.recommendedChanges,
      };

      setOptimizationResult(result);
      setIsOptimizing(false);

      // Add success alert
      setReactors((prevReactors) =>
        prevReactors.map((r) => {
          if (r.id !== reactorId) return r;

          return {
            ...r,
            status: 'running',
            alerts: [
              {
                id: `alert-${reactorId}-opt-${Date.now()}`,
                reactorId,
                type: 'success',
                message: `Optimization complete: +${improvements.yieldIncrease.toFixed(1)}% yield predicted`,
                timestamp: new Date(),
                resolved: false,
              },
              ...r.alerts.slice(0, 4),
            ],
          };
        })
      );
    }, 3500); // 3.5 seconds "AI processing"
  }, [reactors]);

  // Apply optimization recommendations
  const applyOptimization = useCallback(
    (reactorId: string, changes: ParameterAdjustment[]) => {
      changes.forEach((change) => {
        updateReactorParameter(reactorId, change.parameter, change.suggestedValue);
      });

      // Clear optimization result
      setTimeout(() => {
        setOptimizationResult(null);
      }, 5000);
    },
    [updateReactorParameter]
  );

  // Dismiss an alert
  const dismissAlert = useCallback((reactorId: string, alertId: string) => {
    setReactors((prevReactors) =>
      prevReactors.map((reactor) => {
        if (reactor.id !== reactorId) return reactor;

        return {
          ...reactor,
          alerts: reactor.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, resolved: true } : alert
          ),
        };
      })
    );
  }, []);

  // Refresh reactor data (simulates reconnection)
  const refreshReactor = useCallback((reactorId: string) => {
    setReactors((prevReactors) =>
      prevReactors.map((reactor) => {
        if (reactor.id !== reactorId) return reactor;

        // Generate fresh reactor data
        const seed = reactor.id.charCodeAt(0);
        const fresh = createMockReactor(reactor.id, reactor.name, reactor.location, seed);

        return {
          ...fresh,
          config: reactor.config, // Preserve user config
        };
      })
    );
  }, []);

  const value: ReactorContextType = {
    reactors,
    dashboardStats,
    selectedReactor,
    isOptimizing,
    optimizationResult,
    selectReactor,
    updateReactorParameter,
    startOptimization,
    applyOptimization,
    dismissAlert,
    refreshReactor,
  };

  return <ReactorContext.Provider value={value}>{children}</ReactorContext.Provider>;
}

// Custom hook to use the reactor context
export function useReactors() {
  const context = useContext(ReactorContext);
  if (context === undefined) {
    throw new Error('useReactors must be used within a ReactorProvider');
  }
  return context;
}