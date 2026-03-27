import * as React from "react";
import { WeatherChart } from "./WeatherChart";

const { useEffect, useMemo, useState } = React;

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function clampStartToTwoYears(startDate: string, endDate: string) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const maxSpanStart = new Date(e);
  maxSpanStart.setFullYear(e.getFullYear() - 2);
  if (s < maxSpanStart) return toISODate(maxSpanStart);
  return startDate;
}

function timeToISTHourNumber(iso: string | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  // Convert to IST and return hour fraction (0-24)
  const istMs = d.getTime() + 5.5 * 60 * 60 * 1000;
  const ist = new Date(istMs);
  return ist.getUTCHours() + ist.getUTCMinutes() / 60;
}

type Props = {
  location: { lat: number; lon: number } | null;
};

export default function Historical({ location }: Props) {
  const today = useMemo(() => new Date(), []);
  const twoYearsAgo = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 2);
    return d;
  }, []);

  const [startDate, setStartDate] = useState(toISODate(new Date(Date.now() - 30 * 86400000)));
  const [endDate, setEndDate] = useState(toISODate(new Date()));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);

  const load = async () => {
    if (!location) return;
    setErr(null);
    setLoading(true);
    const start = clampStartToTwoYears(startDate, endDate);
    if (start !== startDate) setStartDate(start);
    const cacheKey = `history:v1:${location.lat.toFixed(4)}:${location.lon.toFixed(4)}:${start}:${endDate}`;

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setPayload(JSON.parse(cached));
      } catch {
        // ignore cache parse errors
      }
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: String(location.lat),
          lon: String(location.lon),
          startDate: start,
          endDate,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || "Failed to load historical data");
      }
      const j = await res.json();
      setPayload(j);
      localStorage.setItem(cacheKey, JSON.stringify(j));
    } catch (e: any) {
      setErr(e?.message || "Failed to load historical data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) void load();
  }, [location]);

  const daily = payload?.data?.daily;
  const labels = (daily?.time ?? []).map((t: string) => t);
  const chartData = labels.map((t: string, i: number) => ({
    day: t,
    t_mean: daily?.temperature_2m_mean?.[i] ?? null,
    t_max: daily?.temperature_2m_max?.[i] ?? null,
    t_min: daily?.temperature_2m_min?.[i] ?? null,
    precip: daily?.precipitation_sum?.[i] ?? null,
    wind_max: daily?.wind_speed_10m_max?.[i] ?? null,
    wind_dir: daily?.wind_direction_10m_dominant?.[i] ?? null,
    sunrise_ist: timeToISTHourNumber(daily?.sunrise?.[i]) ?? null,
    sunset_ist: timeToISTHourNumber(daily?.sunset?.[i]) ?? null,
    pm10: payload?.aqi?.daily?.pm10?.[i] ?? daily?.pm10?.[i] ?? null,
    pm2_5: payload?.aqi?.daily?.pm2_5?.[i] ?? daily?.pm2_5?.[i] ?? null,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div>
          <div className="text-xs text-slate-400 mb-1">Start date (max 2 years)</div>
          <input
            type="date"
            value={startDate}
            min={toISODate(twoYearsAgo)}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm"
          />
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">End date</div>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={toISODate(today)}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm"
          />
        </div>
        <button
          onClick={load}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          Load
        </button>
        {loading && <div className="text-sm text-slate-400">Loading…</div>}
      </div>

      {err && (
        <div className="bg-red-950/40 border border-red-900 text-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {err}
        </div>
      )}

      {!payload && !loading ? (
        <div className="text-slate-400 text-sm">Pick a range and click Load.</div>
      ) : null}

      {payload ? (
        <div className="space-y-6">
          <WeatherChart
            title="Temperature (Mean / Max / Min)"
            unit="°C"
            xKey="day"
            data={chartData}
            dataKeys={["t_mean", "t_max", "t_min"]}
            colors={["#38bdf8", "#f472b6", "#818cf8"]}
          />

          <WeatherChart
            title="Sun Cycle (IST hour-of-day)"
            unit="hr"
            xKey="day"
            data={chartData}
            dataKeys={["sunrise_ist", "sunset_ist"]}
            colors={["#fb923c", "#f59e0b"]}
          />

          <WeatherChart
            title="Precipitation Total"
            unit="mm"
            xKey="day"
            data={chartData}
            dataKeys={["precip"]}
            colors={["#60a5fa"]}
          />

          <WeatherChart
            title="Wind (Max Speed)"
            unit="km/h"
            xKey="day"
            data={chartData}
            dataKeys={["wind_max"]}
            colors={["#4ade80"]}
          />

          <WeatherChart
            title="Air Quality (PM10 / PM2.5)"
            unit="μg/m³"
            xKey="day"
            data={chartData}
            dataKeys={["pm10", "pm2_5"]}
            colors={["#f97316", "#ef4444"]}
          />
        </div>
      ) : null}
    </div>
  );
}

