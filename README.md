# Anzen Reactor Intelligence Frontend

This project runs fully as a frontend-only demo.

## Frontend-only demo mode (default)
No backend required.

```bash
npm install
npm run dev
```

The app simulates:
- real-time telemetry updates
- optimization recommendations
- cloud-sync heartbeat (demo stream)

## Optional live API mode
If you later want live telemetry ingestion, set either:

```bash
NEXT_PUBLIC_TELEMETRY_INGEST_URL=https://YOUR_PROJECT.supabase.co/functions/v1/telemetry-ingest
```

or

```bash
NEXT_PUBLIC_BACKEND_BASE_URL=https://your-backend-domain.com
```

## Build
```bash
npm run lint
npm run build
npm run start
```

