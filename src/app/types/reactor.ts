// Core reactor data types for the Anzen Industries monitoring platform

export interface ReactorMetrics {
  temperature: number; // Celsius
  pH: number;
  pressure: number; // bar
  flowRate: number; // mL/min
  enzymeActivity: number; // percentage
  substrateConcentration: number; // g/L
  productYield: number; // percentage
  dissolvedOxygen: number; // percentage
  timestamp: Date;
}

export interface HistoricalDataPoint extends ReactorMetrics {
  id: string;
}

export interface Alert {
  id: string;
  reactorId: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  timestamp: Date;
  resolved: boolean;
  parameter?: keyof ReactorMetrics;
  value?: number;
}

export interface AIPrediction {
  enzymeDeactivation: {
    hoursRemaining: number;
    confidence: number; // 0-1
    suggestedAction?: string;
  };
  yieldOptimization: {
    currentYield: number;
    predictedYield: number;
    confidenceInterval: [number, number];
    recommendedChanges: ParameterAdjustment[];
  };
  anomalyDetection: {
    score: number; // 0-1, higher = more anomalous
    parameters: string[];
  };
}

export interface ParameterAdjustment {
  parameter: keyof ReactorMetrics;
  currentValue: number;
  suggestedValue: number;
  impact: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Reactor {
  id: string;
  name: string;
  location: string;
  status: 'running' | 'idle' | 'maintenance' | 'error' | 'optimizing';
  currentMetrics: ReactorMetrics;
  history: HistoricalDataPoint[];
  alerts: Alert[];
  predictions: AIPrediction;
  config: ReactorConfig;
  uptime: number; // hours
  totalBatches: number;
  lastMaintenance: Date;
}

export interface ReactorConfig {
  targetTemperature: number;
  targetPH: number;
  targetPressure: number;
  targetFlowRate: number;
  minEnzymeActivity: number;
  maxSubstrateConcentration: number;
  operatingMode: 'batch' | 'continuous' | 'fed-batch';
  autoOptimize: boolean;
}

export interface OptimizationResult {
  reactorId: string;
  timestamp: Date;
  status: 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  parametersAnalyzed: number;
  improvements: {
    yieldIncrease: number;
    efficiencyGain: number;
    costReduction: number;
  };
  appliedChanges: ParameterAdjustment[];
}

export interface ScaleUpSimulation {
  currentVolume: number; // Liters
  targetVolume: number; // Liters
  predictedYield: number;
  confidenceInterval: [number, number];
  potentialBottlenecks: {
    parameter: string;
    atVolume: number;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
  estimatedCost: number;
  timeToImplement: number; // days
}

// Dashboard summary types
export interface DashboardStats {
  totalReactors: number;
  activeReactors: number;
  averageYield: number;
  totalAlerts: number;
  criticalAlerts: number;
  systemHealth: number; // 0-100
  dailyProduction: number; // kg
  uptime: number; // percentage
}

// Real-time update event types
export interface ReactorUpdateEvent {
  reactorId: string;
  metric: keyof ReactorMetrics;
  value: number;
  timestamp: Date;
}