import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = 5000;
const weatherApi = process.env.OPEN_WEATHER_API;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "success",
  });
});

app.post("/search", async (req, res) => {
  const body = await req.body;
  const { location } = body;

  if (typeof location != "string" || !location) {
    return res.json({
      message: "Incorrect Location",
    });
  }

  try {
    const geoCode = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${weatherApi}`,
    );

    const result = await geoCode.json();
    const { lat, lon } = result[0];

    const getWeatherData = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,temperature_2m_max,temperature_2m_min,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&current=temperature_2m,precipitation,relative_humidity_2m&timezone=auto`,
    );

    const parseWeatherData = await getWeatherData.json();
    res.json({
      message: "success",
      data: parseWeatherData,
    });
  } catch (err) {
    console.error(err);
  }
});

app.listen(port, () => {
  console.log(`backend running on ${port}`);
});
