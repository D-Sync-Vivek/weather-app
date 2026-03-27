import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/search", async (req, res) => {
    const { lat, lon, startDate, endDate } = req.body;
    
    // Fallback: If no end date, use start date (Page 1)
    const end = endDate || startDate;

    // 1. Date Logic
    // Today at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);

    // If the date is before today, use the Archive API
    const isHistorical = start < today;
    
    const baseUrl = isHistorical 
        ? "https://archive-api.open-meteo.com/v1/archive" 
        : "https://api.open-meteo.com/v1/forecast";

    try {
        // 2. Weather Params 
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            start_date: startDate,
            end_date: end,
            timezone: "auto",
            current: "temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code",
            hourly: "temperature_2m,relative_humidity_2m,precipitation,visibility,wind_speed_10m,uv_index",
            daily: "sunrise,sunset,temperature_2m_max,temperature_2m_min,temperature_2m_mean,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant"
        });

        // 3. Air Quality Params
        const aqiParams = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            start_date: startDate,
            end_date: end,
            timezone: "auto",
            hourly: "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,european_aqi",
            current: "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,european_aqi"
        });

        // 4. Simultaneous Fetching
        const [wRes, aRes] = await Promise.all([
            fetch(`${baseUrl}?${params.toString()}`),
            fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${aqiParams.toString()}`)
        ]);

        const weather = await wRes.json();
        const aqi = await aRes.json();

        // Check for Open-Meteo specific errors (e.g., date out of range)
        if (weather.error) {
            console.error("Open-Meteo Error:", weather.reason);
            return res.status(400).json({ message: weather.reason });
        }

        res.json({ data: weather, aqi: aqi });

    } catch (err) {
        console.error("Server Fetch Error:", err);
        res.status(500).json({ message: "Internal Server Error during fetching" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
    console.log(`🚀 Ready to handle ${new Date().getFullYear()} Weather Data`);
});