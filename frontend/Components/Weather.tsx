import * as React from "react";
import { WeatherChart } from "./WeatherChart";

const { useEffect, useMemo, useState } = React;

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function wmoLabel(code: number | null | undefined) {
  if (code == null) return "-";
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  return "Thunderstorm";
}

function fmt(n: number | null | undefined, d = 1) {
  if (n == null || Number.isNaN(n)) return "-";
  return Number(n).toFixed(d);
}

function fmtTime(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

type Props = {
  location: { lat: number; lon: number } | null;
};

export default function Weather({ location }: Props) {
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);

  const toF = (c: number | null) => (c == null ? null : c * 9 / 5 + 32);
  const tempUnit = unit === "F" ? "°F" : "°C";

  const load = async () => {
    if (!location) return;
    setErr(null);
    setLoading(true);
    const cacheKey = `weather:v1:${location.lat.toFixed(4)}:${location.lon.toFixed(4)}:${selectedDate}`;

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
          startDate: selectedDate,
          endDate: selectedDate,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || "Failed to load weather");
      }
      const j = await res.json();
      setPayload(j);
      localStorage.setItem(cacheKey, JSON.stringify(j));
    } catch (e: any) {
      setErr(e?.message || "Failed to load weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, selectedDate]);

  const current = payload?.data?.current;
  const daily = payload?.data?.daily;
  const hourly = payload?.data?.hourly;
  const aqiCurrent = payload?.aqi?.current;
  const aqiHourly = payload?.aqi?.hourly;

  const hourLabels = (hourly?.time ?? []).map((t: string) => `${pad2(new Date(t).getHours())}:00`);
  const nowHourIndex = useMemo(() => {
    if (!hourly?.time?.length) return 0;
    const h = new Date().getHours();
    const idx = hourly.time.findIndex((t: string) => new Date(t).getHours() === h);
    return idx >= 0 ? idx : 0;
  }, [hourly?.time]);

  const chartData = hourLabels.map((h: string, i: number) => {
    const tC = hourly?.temperature_2m?.[i] ?? null;
    const t = unit === "F" ? toF(tC) : tC;
    return {
      hour: h,
      temp: t,
      humidity: hourly?.relative_humidity_2m?.[i] ?? null,
      precip: hourly?.precipitation?.[i] ?? null,
      visibility_km: hourly?.visibility?.[i] != null ? hourly.visibility[i] / 1000 : null,
      wind: hourly?.wind_speed_10m?.[i] ?? null,
      pm10: aqiHourly?.pm10?.[i] ?? null,
      pm2_5: aqiHourly?.pm2_5?.[i] ?? null,
      uv: hourly?.uv_index?.[i] ?? null,
    };
  });

  const day0 = 0;
  const dailyTempMinC = daily?.temperature_2m_min?.[day0] ?? null;
  const dailyTempMaxC = daily?.temperature_2m_max?.[day0] ?? null;
  const dailyTempMin = unit === "F" ? toF(dailyTempMinC) : dailyTempMinC;
  const dailyTempMax = unit === "F" ? toF(dailyTempMaxC) : dailyTempMaxC;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="date"
          value={selectedDate}
          max={toISODate(new Date())}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm"
        />
        <button
          onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold px-3 py-2 rounded-lg cursor-pointer"
        >
          Toggle °{unit === "C" ? "F" : "C"}
        </button>
        {location ? (
          <div className="text-xs text-slate-400">
            📍 {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </div>
        ) : null}
        {loading ? <div className="text-sm text-slate-400">Loading…</div> : null}
      </div>

      {err ? (
        <div className="bg-red-950/40 border border-red-900 text-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {err}
        </div>
      ) : null}

      {/* Individual variables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 mb-1">Temperature</div>
          <div className="text-slate-200 text-sm">
            Current: <span className="font-semibold">{fmt(unit === "F" ? toF(current?.temperature_2m ?? null) : current?.temperature_2m, 1)} {tempUnit}</span>
          </div>
          <div className="text-slate-200 text-sm">
            Min: <span className="font-semibold">{fmt(dailyTempMin as any, 1)} {tempUnit}</span>
          </div>
          <div className="text-slate-200 text-sm">
            Max: <span className="font-semibold">{fmt(dailyTempMax as any, 1)} {tempUnit}</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">{wmoLabel(current?.weather_code)}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 mb-1">Atmospheric Conditions</div>
          <div className="text-slate-200 text-sm">
            Precipitation: <span className="font-semibold">{fmt(daily?.precipitation_sum?.[day0], 1)} mm</span>
          </div>
          <div className="text-slate-200 text-sm">
            Relative Humidity: <span className="font-semibold">{fmt(hourly?.relative_humidity_2m?.[nowHourIndex], 0)}%</span>
          </div>
          <div className="text-slate-200 text-sm">
            UV Index: <span className="font-semibold">{fmt(daily?.uv_index_max?.[day0], 1)}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 mb-1">Sun / Wind / Air</div>
          <div className="text-slate-200 text-sm">
            Sunrise: <span className="font-semibold">{fmtTime(daily?.sunrise?.[day0])}</span>
          </div>
          <div className="text-slate-200 text-sm">
            Sunset: <span className="font-semibold">{fmtTime(daily?.sunset?.[day0])}</span>
          </div>
          <div className="text-slate-200 text-sm">
            Max Wind Speed: <span className="font-semibold">{fmt(daily?.wind_speed_10m_max?.[day0], 1)} km/h</span>
          </div>
          <div className="text-slate-200 text-sm">
            Precip Prob (max): <span className="font-semibold">{fmt(daily?.precipitation_probability_max?.[day0], 0)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-6">
        <div className="text-xs text-slate-400 mb-3">Air Quality Metrics</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-200">
          <div>AQI: <span className="font-semibold">{aqiCurrent?.european_aqi ?? "-"}</span></div>
          <div>PM10: <span className="font-semibold">{fmt(aqiCurrent?.pm10, 1)} μg/m³</span></div>
          <div>PM2.5: <span className="font-semibold">{fmt(aqiCurrent?.pm2_5, 1)} μg/m³</span></div>
          <div>CO: <span className="font-semibold">{fmt(aqiCurrent?.carbon_monoxide, 1)} μg/m³</span></div>
          <div>NO₂: <span className="font-semibold">{fmt(aqiCurrent?.nitrogen_dioxide, 1)} μg/m³</span></div>
          <div>SO₂: <span className="font-semibold">{fmt(aqiCurrent?.sulphur_dioxide, 1)} μg/m³</span></div>
          <div>CO₂: <span className="font-semibold">~420 ppm</span></div>
        </div>
      </div>

      {/* Hourly charts */}
      <div className="space-y-6">
        <WeatherChart title="Temperature (Hourly)" unit={tempUnit} data={chartData} dataKeys={["temp"]} colors={["#38bdf8"]} />
        <WeatherChart title="Relative Humidity (Hourly)" unit="%" data={chartData} dataKeys={["humidity"]} colors={["#818cf8"]} />
        <WeatherChart title="Precipitation (Hourly)" unit="mm" data={chartData} dataKeys={["precip"]} colors={["#60a5fa"]} />
        <WeatherChart title="Visibility (Hourly)" unit="km" data={chartData} dataKeys={["visibility_km"]} colors={["#34d399"]} />
        <WeatherChart title="Wind Speed 10m (Hourly)" unit="km/h" data={chartData} dataKeys={["wind"]} colors={["#4ade80"]} />
        <WeatherChart title="PM10 & PM2.5 (Hourly)" unit="μg/m³" data={chartData} dataKeys={["pm10", "pm2_5"]} colors={["#f97316", "#ef4444"]} />
      </div>
    </div>
  );
}