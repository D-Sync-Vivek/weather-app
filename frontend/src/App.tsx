
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Weather from "../Components/Weather";
import Historical from "../Components/Historical";

function App() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locErr, setLocErr] = useState<string | null>(null);

  useEffect(() => {
    const fallback = { lat: 28.6692, lon: 77.4538 }; // Ghaziabad
    if (!navigator.geolocation) {
      setLocErr("Geolocation unavailable — using fallback location (Ghaziabad, India).");
      setLocation(fallback);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setLocation({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {
        setLocErr("GPS denied — using fallback location (Ghaziabad, India).");
        setLocation(fallback);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        {locErr ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="bg-amber-950/40 border border-amber-900 text-amber-200 rounded-lg px-4 py-3 text-sm">
              {locErr}
            </div>
          </div>
        ) : null}
        <Routes>
          <Route path="/" element={<Weather location={location} />} />
          <Route path="/historical" element={<Historical location={location} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;