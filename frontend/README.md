# Weather Dashboard (Open‑Meteo)

Responsive React + Vite app that uses browser GPS to show:

- **Page 1** (`/`): current weather + hourly charts (temperature toggle °C/°F, humidity, precipitation, visibility, wind, PM10/PM2.5).
- **Page 2** (`/historical`): historical trends for a selectable date range (max **2 years**).

Data is fetched via a small Express backend that calls:

- Open‑Meteo Forecast/Archive APIs
- Open‑Meteo Air Quality API

## Tech

- **Frontend**: React, TypeScript, Tailwind, Recharts, React Router
- **Backend**: Express (single endpoint: `POST /search`)

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

Notes:

- The frontend uses a Vite dev proxy, so it calls the backend as **`/api/search`**.
- If GPS permission is denied, the app falls back to **Ghaziabad, India** coordinates.

## Known limitations

- **CO₂** is **not** provided by Open‑Meteo’s air-quality API. The UI shows a clearly labeled **global-average placeholder (~420 ppm)**.
