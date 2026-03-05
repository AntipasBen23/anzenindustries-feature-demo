# Anzen Reactor Intelligence Frontend

## Production setup
This frontend now sends live telemetry snapshots to your deployed backend.

Required env:
```bash
NEXT_PUBLIC_BACKEND_BASE_URL=https://your-backend-domain.com
```

Use `.env.example` as template.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run start
```

## Deploy to Vercel (recommended)
1. Import this repo into Vercel.
2. Add env var:
   - `NEXT_PUBLIC_BACKEND_BASE_URL` = your deployed backend URL.
3. Redeploy.

## Backend expectation
Frontend expects these endpoints on your backend:
- `GET /health`
- `POST /api/telemetry`
- `GET /api/telemetry`

