# Weather Dashboard (Open‑Meteo) — Full Stack

This repository contains:

- `frontend/`: React + TypeScript + Vite weather dashboard (mobile responsive).
- `backend/`: Express server that fetches Open‑Meteo weather + air quality.

## Features

- **Auto GPS location** on landing (fallback to Ghaziabad, India if denied).
- **Page 1 — Current & Hourly** (`/`)
  - Temperature min/max/current (toggle °C/°F)
  - Precipitation, humidity, UV index
  - Sunrise/sunset
  - Wind max + precipitation probability max
  - Air quality: AQI, PM10, PM2.5, CO, NO₂, SO₂ (+ CO₂ placeholder)
  - Hourly charts: temperature, humidity, precipitation, visibility, wind, PM10+PM2.5
- **Page 2 — Historical (max 2 years)** (`/historical`)
  - Temperature mean/max/min
  - Sun cycle (displayed in IST)
  - Precipitation totals
  - Wind max speed (+ dominant direction in API payload)
  - PM10/PM2.5 trends

Charts support **horizontal scrolling** and **zooming** via a brush selector.

## Run locally

### Backend

```bash
cd backend
npm install
node server.js
```

Backend runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

The frontend calls the backend via **`/api/search`** (Vite dev proxy).

## Note about CO₂

Open‑Meteo’s air-quality API does not provide CO₂. The UI shows a clearly labeled **global average placeholder (~420 ppm)**.

