import type { Reactor } from '@/app/types/reactor';

function getBackendBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '';
  return raw.replace(/\/$/, '');
}

function getTelemetryIngestUrl() {
  const direct = process.env.NEXT_PUBLIC_TELEMETRY_INGEST_URL || '';
  if (direct) {
    return direct;
  }

  const baseUrl = getBackendBaseUrl();
  return baseUrl ? `${baseUrl}/api/telemetry` : '';
}

export function isBackendConfigured() {
  return Boolean(getTelemetryIngestUrl());
}

export async function sendTelemetrySnapshot(reactors: Reactor[]) {
  const ingestUrl = getTelemetryIngestUrl();
  if (!ingestUrl || reactors.length === 0) {
    return { sent: 0, skipped: true };
  }

  const payloads = reactors.map((reactor) => ({
    reactorId: reactor.id,
    reactorName: reactor.name,
    location: reactor.location,
    status: reactor.status,
    temperature: reactor.currentMetrics.temperature,
    ph: reactor.currentMetrics.pH,
    pressure: reactor.currentMetrics.pressure,
    flowRate: reactor.currentMetrics.flowRate,
    enzymeActivity: reactor.currentMetrics.enzymeActivity,
    substrateConcentration: reactor.currentMetrics.substrateConcentration,
    productYield: reactor.currentMetrics.productYield,
    dissolvedOxygen: reactor.currentMetrics.dissolvedOxygen,
    uptimeHours: reactor.uptime,
    unresolvedAlerts: reactor.alerts.filter((alert) => !alert.resolved).length,
    capturedAt: reactor.currentMetrics.timestamp.toISOString(),
  }));

  const responses = await Promise.all(
    payloads.map((body) =>
      fetch(ingestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    )
  );

  const failed = responses.filter((res) => !res.ok).length;
  if (failed > 0) {
    throw new Error(`${failed} telemetry request(s) failed`);
  }

  return { sent: payloads.length, skipped: false };
}
