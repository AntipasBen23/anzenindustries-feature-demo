// Mock data generator for realistic enzyme reactor simulation
// Implements physics-based models for enzyme kinetics, temperature dynamics, and process control

import type {
  Reactor,
  ReactorMetrics,
  HistoricalDataPoint,
  Alert,
  AIPrediction,
  ParameterAdjustment,
  ReactorConfig,
  DashboardStats,
} from '@/types/reactor';

// Seeded random number generator for reproducible demos
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  gaussian(mean: number, stdDev: number): number {
    // Box-Muller transform
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
}

// Physics-based enzyme kinetics model
class EnzymeKineticsModel {
  private time: number = 0;
  private initialActivity: number = 95;
  private deactivationRate: number = 0.002; // per hour

  constructor(private random: SeededRandom) {}

  // Enzyme deactivation follows first-order kinetics
  calculateActivity(hours: number, temperature: number, pH: number): number {
    // Temperature effect (Arrhenius-like)
    const tempFactor = temperature > 37 ? 1 + (temperature - 37) * 0.05 : 1;
    
    // pH effect (optimal at 7.4)
    const pHDeviation = Math.abs(pH - 7.4);
    const pHFactor = 1 + pHDeviation * 0.1;
    
    // Combined deactivation
    const effectiveRate = this.deactivationRate * tempFactor * pHFactor;
    const activity = this.initialActivity * Math.exp(-effectiveRate * hours);
    
    // Add realistic noise
    return Math.max(0, activity + this.random.gaussian(0, 0.5));
  }

  reset() {
    this.time = 0;
    this.initialActivity = this.random.range(92, 98);
  }
}

// Reactor state manager with temporal dynamics
class ReactorSimulator {
  private metrics: ReactorMetrics;
  private config: ReactorConfig;
  private startTime: Date;
  private enzymeModel: EnzymeKineticsModel;
  private random: SeededRandom;
  private runningTime: number = 0; // hours

  constructor(reactorId: string, seed: number) {
    this.random = new SeededRandom(seed);
    this.enzymeModel = new EnzymeKineticsModel(this.random);
    this.startTime = new Date(Date.now() - this.random.range(2, 48) * 3600000);
    this.runningTime = (Date.now() - this.startTime.getTime()) / 3600000;

    // Initialize with realistic starting conditions
    this.config = {
      targetTemperature: 35,
      targetPH: 7.4,
      targetPressure: 1.2,
      targetFlowRate: 150,
      minEnzymeActivity: 70,
      maxSubstrateConcentration: 20,
      operatingMode: 'continuous',
      autoOptimize: true,
    };

    this.metrics = {
      temperature: this.config.targetTemperature + this.random.gaussian(0, 0.3),
      pH: this.config.targetPH + this.random.gaussian(0, 0.1),
      pressure: this.config.targetPressure + this.random.gaussian(0, 0.05),
      flowRate: this.config.targetFlowRate + this.random.gaussian(0, 5),
      enzymeActivity: this.enzymeModel.calculateActivity(
        this.runningTime,
        this.config.targetTemperature,
        this.config.targetPH
      ),
      substrateConcentration: this.random.range(10, 15),
      productYield: this.random.range(75, 85),
      dissolvedOxygen: this.random.range(85, 95),
      timestamp: new Date(),
    };
  }

  // Simulate one time step (realistic drift + control)
  update(): ReactorMetrics {
    this.runningTime += 1 / 3600; // 1 second increment

    // Temperature dynamics (thermal inertia)
    const tempError = this.config.targetTemperature - this.metrics.temperature;
    this.metrics.temperature += tempError * 0.02 + this.random.gaussian(0, 0.05);

    // pH dynamics (buffering effect)
    const pHError = this.config.targetPH - this.metrics.pH;
    this.metrics.pH += pHError * 0.01 + this.random.gaussian(0, 0.02);

    // Pressure follows flow rate with lag
    const targetPressure = 1.0 + (this.metrics.flowRate / 200) * 0.4;
    this.metrics.pressure += (targetPressure - this.metrics.pressure) * 0.05 + this.random.gaussian(0, 0.01);

    // Flow rate has small random fluctuations
    this.metrics.flowRate += this.random.gaussian(0, 2);
    this.metrics.flowRate = Math.max(0, this.metrics.flowRate);

    // Enzyme activity decreases over time
    this.metrics.enzymeActivity = this.enzymeModel.calculateActivity(
      this.runningTime,
      this.metrics.temperature,
      this.metrics.pH
    );

    // Substrate concentration decreases as it's consumed
    const consumptionRate = 0.5 * (this.metrics.enzymeActivity / 100) * (this.metrics.flowRate / 150);
    this.metrics.substrateConcentration = Math.max(
      5,
      this.metrics.substrateConcentration - consumptionRate * 0.001 + this.random.gaussian(0, 0.1)
    );

    // Product yield depends on enzyme activity and substrate
    const theoreticalYield = 
      (this.metrics.enzymeActivity / 100) * 
      (this.metrics.substrateConcentration / 15) * 
      90;
    this.metrics.productYield += (theoreticalYield - this.metrics.productYield) * 0.05 + this.random.gaussian(0, 0.5);
    this.metrics.productYield = Math.max(0, Math.min(100, this.metrics.productYield));

    // Dissolved oxygen
    this.metrics.dissolvedOxygen += this.random.gaussian(0, 1);
    this.metrics.dissolvedOxygen = Math.max(70, Math.min(100, this.metrics.dissolvedOxygen));

    this.metrics.timestamp = new Date();

    return { ...this.metrics };
  }

  // Adjust a parameter (simulates control action)
  adjustParameter(param: keyof ReactorMetrics, value: number) {
    if (param === 'temperature') this.config.targetTemperature = value;
    if (param === 'pH') this.config.targetPH = value;
    if (param === 'flowRate') this.metrics.flowRate = value;
  }

  getConfig(): ReactorConfig {
    return { ...this.config };
  }

  getCurrentMetrics(): ReactorMetrics {
    return { ...this.metrics };
  }

  getRunningTime(): number {
    return this.runningTime;
  }
}

// Generate historical data with realistic patterns
function generateHistoricalData(
  reactorId: string,
  hours: number = 24,
  intervalMinutes: number = 5
): HistoricalDataPoint[] {
  const simulator = new ReactorSimulator(reactorId, reactorId.charCodeAt(0));
  const dataPoints: HistoricalDataPoint[] = [];
  const pointsCount = (hours * 60) / intervalMinutes;

  for (let i = 0; i < pointsCount; i++) {
    // Update simulator for each interval
    for (let j = 0; j < intervalMinutes * 60; j++) {
      simulator.update();
    }

    const metrics = simulator.getCurrentMetrics();
    dataPoints.push({
      ...metrics,
      id: `${reactorId}-${i}`,
      timestamp: new Date(Date.now() - (pointsCount - i) * intervalMinutes * 60000),
    });
  }

  return dataPoints;
}

// Generate realistic alerts based on current state
function generateAlerts(reactorId: string, metrics: ReactorMetrics, history: HistoricalDataPoint[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  // Check for pH deviation
  if (Math.abs(metrics.pH - 7.4) > 0.3) {
    alerts.push({
      id: `alert-${reactorId}-ph-${Date.now()}`,
      reactorId,
      type: Math.abs(metrics.pH - 7.4) > 0.5 ? 'critical' : 'warning',
      message: `pH deviation detected: ${metrics.pH.toFixed(2)} (target: 7.4)`,
      timestamp: new Date(now.getTime() - Math.random() * 3600000),
      resolved: false,
      parameter: 'pH',
      value: metrics.pH,
    });
  }

  // Check for low enzyme activity
  if (metrics.enzymeActivity < 75) {
    alerts.push({
      id: `alert-${reactorId}-enzyme-${Date.now()}`,
      reactorId,
      type: metrics.enzymeActivity < 70 ? 'critical' : 'warning',
      message: `Low enzyme activity: ${metrics.enzymeActivity.toFixed(1)}%`,
      timestamp: new Date(now.getTime() - Math.random() * 7200000),
      resolved: false,
      parameter: 'enzymeActivity',
      value: metrics.enzymeActivity,
    });
  }

  // Check for temperature stability
  if (history.length >= 10) {
    const recentTemps = history.slice(-10).map(d => d.temperature);
    const tempVariance = recentTemps.reduce((sum, t) => sum + Math.pow(t - metrics.temperature, 2), 0) / 10;
    
    if (tempVariance > 0.5) {
      alerts.push({
        id: `alert-${reactorId}-temp-${Date.now()}`,
        reactorId,
        type: 'info',
        message: 'Temperature fluctuation detected - control system compensating',
        timestamp: new Date(now.getTime() - Math.random() * 1800000),
        resolved: true,
        parameter: 'temperature',
        value: metrics.temperature,
      });
    }
  }

  // Success alert for optimization
  if (metrics.productYield > 82) {
    alerts.push({
      id: `alert-${reactorId}-success-${Date.now()}`,
      reactorId,
      type: 'success',
      message: `High yield achieved: ${metrics.productYield.toFixed(1)}%`,
      timestamp: new Date(now.getTime() - Math.random() * 900000),
      resolved: true,
      parameter: 'productYield',
      value: metrics.productYield,
    });
  }

  return alerts.slice(0, 5); // Return most recent 5 alerts
}

// Generate AI predictions
function generateAIPredictions(
  metrics: ReactorMetrics,
  history: HistoricalDataPoint[],
  runningTime: number
): AIPrediction {
  const random = new SeededRandom(Date.now());

  // Predict enzyme deactivation
  const currentActivity = metrics.enzymeActivity;
  const deactivationRate = 0.002; // per hour
  const hoursTo70Percent = Math.log(currentActivity / 70) / deactivationRate;

  // Calculate yield optimization potential
  const currentYield = metrics.productYield;
  const optimizedTemp = 35.8;
  const optimizedPH = 7.35;
  const optimizedFlow = 165;

  const tempDelta = Math.abs(metrics.temperature - optimizedTemp);
  const pHDelta = Math.abs(metrics.pH - optimizedPH);
  const flowDelta = Math.abs(metrics.flowRate - optimizedFlow);

  const potentialGain = (tempDelta * 2) + (pHDelta * 15) + (flowDelta * 0.05);
  const predictedYield = Math.min(95, currentYield + potentialGain);

  const recommendations: ParameterAdjustment[] = [];

  if (tempDelta > 0.5) {
    recommendations.push({
      parameter: 'temperature',
      currentValue: metrics.temperature,
      suggestedValue: optimizedTemp,
      impact: `+${(tempDelta * 2).toFixed(1)}% yield`,
      priority: tempDelta > 1 ? 'high' : 'medium',
    });
  }

  if (pHDelta > 0.1) {
    recommendations.push({
      parameter: 'pH',
      currentValue: metrics.pH,
      suggestedValue: optimizedPH,
      impact: `+${(pHDelta * 15).toFixed(1)}% yield`,
      priority: pHDelta > 0.3 ? 'high' : 'medium',
    });
  }

  if (flowDelta > 10) {
    recommendations.push({
      parameter: 'flowRate',
      currentValue: metrics.flowRate,
      suggestedValue: optimizedFlow,
      impact: `+${(flowDelta * 0.05).toFixed(1)}% yield`,
      priority: 'low',
    });
  }

  // Anomaly detection (simplified)
  const anomalyScore = Math.max(
    0,
    Math.min(1, (tempDelta / 5) + (pHDelta / 2) + ((100 - metrics.enzymeActivity) / 100))
  );

  return {
    enzymeDeactivation: {
      hoursRemaining: Math.max(0, hoursTo70Percent),
      confidence: 0.87 + random.range(0, 0.1),
      suggestedAction: currentActivity < 80 ? 'Consider enzyme replenishment or batch termination' : undefined,
    },
    yieldOptimization: {
      currentYield,
      predictedYield,
      confidenceInterval: [predictedYield - 2.5, predictedYield + 2.5],
      recommendedChanges: recommendations,
    },
    anomalyDetection: {
      score: anomalyScore,
      parameters: anomalyScore > 0.3 ? ['temperature', 'pH'] : [],
    },
  };
}

// Create a complete reactor with all data
export function createMockReactor(
  id: string,
  name: string,
  location: string,
  seed: number
): Reactor {
  const simulator = new ReactorSimulator(id, seed);
  const currentMetrics = simulator.getCurrentMetrics();
  const history = generateHistoricalData(id, 24, 5);
  const alerts = generateAlerts(id, currentMetrics, history);
  const predictions = generateAIPredictions(currentMetrics, history, simulator.getRunningTime());

  const random = new SeededRandom(seed);
  const status = currentMetrics.enzymeActivity < 70 ? 'maintenance' :
                 alerts.some(a => a.type === 'critical') ? 'error' : 'running';

  return {
    id,
    name,
    location,
    status,
    currentMetrics,
    history,
    alerts,
    predictions,
    config: simulator.getConfig(),
    uptime: simulator.getRunningTime(),
    totalBatches: Math.floor(random.range(50, 200)),
    lastMaintenance: new Date(Date.now() - random.range(5, 30) * 86400000),
  };
}

// Generate dashboard statistics
export function generateDashboardStats(reactors: Reactor[]): DashboardStats {
  const activeReactors = reactors.filter(r => r.status === 'running' || r.status === 'optimizing').length;
  const averageYield = reactors.reduce((sum, r) => sum + r.currentMetrics.productYield, 0) / reactors.length;
  const totalAlerts = reactors.reduce((sum, r) => sum + r.alerts.length, 0);
  const criticalAlerts = reactors.reduce(
    (sum, r) => sum + r.alerts.filter(a => a.type === 'critical' && !a.resolved).length,
    0
  );
  const avgEnzymeActivity = reactors.reduce((sum, r) => sum + r.currentMetrics.enzymeActivity, 0) / reactors.length;

  return {
    totalReactors: reactors.length,
    activeReactors,
    averageYield,
    totalAlerts,
    criticalAlerts,
    systemHealth: avgEnzymeActivity,
    dailyProduction: reactors.reduce((sum, r) => 
      sum + (r.status === 'running' ? r.currentMetrics.productYield * 0.5 : 0), 0
    ),
    uptime: (activeReactors / reactors.length) * 100,
  };
}

// Initialize mock reactors
export const mockReactors: Reactor[] = [
  createMockReactor('RXN-001', 'Reactor Alpha', 'California Facility - Bay 1', 12345),
  createMockReactor('RXN-002', 'Reactor Beta', 'California Facility - Bay 2', 67890),
  createMockReactor('RXN-003', 'Reactor Gamma', 'California Facility - Bay 3', 11121),
];

// Update function to be called every second
export function updateReactorMetrics(reactor: Reactor): ReactorMetrics {
  const simulator = new ReactorSimulator(reactor.id, reactor.id.charCodeAt(0));
  return simulator.update();
}