import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// City geocoding search endpoint
app.get("/api/weather/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=10&language=en&format=json`;

    const response = await fetch(geoUrl, {
      headers: { "User-Agent": "WeatherIntelligence/1.0" },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Geocoding service error: ${response.statusText}`,
      });
    }

    const data = await response.json();
    return res.json(data.results || []);
  } catch (err: any) {
    console.error("Geocoding search failed:", err);
    return res.status(500).json({
      error: "Failed to search cities. Please check network connectivity.",
      details: err.message,
    });
  }
});

// Comprehensive Weather Forecast endpoint
app.get("/api/weather/forecast", async (req, res) => {
  try {
    const lat = req.query.lat as string;
    const lon = req.query.lon as string;
    const timezone = (req.query.timezone as string) || "auto";

    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: "Invalid coordinate values" });
    }

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "weather_code",
        "cloud_cover",
        "pressure_msl",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
      ].join(","),
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "dew_point_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "weather_code",
        "pressure_msl",
        "surface_pressure",
        "cloud_cover",
        "visibility",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "uv_index",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "sunrise",
        "sunset",
        "daylight_duration",
        "sunshine_duration",
        "uv_index_max",
        "precipitation_sum",
        "rain_sum",
        "showers_sum",
        "snowfall_sum",
        "precipitation_hours",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "wind_gusts_10m_max",
        "wind_direction_10m_dominant",
      ].join(","),
      timezone: timezone,
    });

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const response = await fetch(forecastUrl, {
      headers: { "User-Agent": "WeatherIntelligence/1.0" },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Weather service error: ${response.statusText}`,
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error("Weather forecast fetch failed:", err);
    return res.status(500).json({
      error: "Unable to retrieve meteorological forecast data.",
      details: err.message,
    });
  }
});

// AI-Powered Weather Intelligence Briefing Endpoint
app.post("/api/weather/intelligence", async (req, res) => {
  try {
    const {
      city,
      country,
      temperature,
      condition,
      humidity,
      windSpeed,
      precipitationProbability,
      uvIndex,
      tempMax,
      tempMin,
    } = req.body;

    const ai = getAI();
    if (!ai) {
      // Return structured heuristic intelligence if Gemini API key not present
      return res.json({
        isAiGenerated: false,
        summary: `Current conditions in ${city || "your area"} show ${condition || "stable skies"} at ${temperature}°C with ${humidity}% humidity and winds around ${windSpeed} km/h.`,
        briefing: `Expect daytime highs of ${tempMax}°C and overnight lows of ${tempMin}°C with a ${precipitationProbability}% chance of rain. Prepare layers for temperature shifts.`,
        outfit: temperature < 10 ? "Heavy winter coat, scarf, and thermal underlayer." : temperature < 18 ? "Comfortable light jacket, sweater, or hoodie." : "Breathable, lightweight cotton clothing and sunglasses.",
        outdoor: precipitationProbability > 40 ? "Rain expected; prioritize indoor workouts or covered outdoor areas." : "Great window for jogging, walking, or cycling today.",
        commute: windSpeed > 35 || precipitationProbability > 50 ? "Allow extra travel time; wet road surfaces and gusts reported." : "Favorable travel conditions with smooth visibility.",
        health: uvIndex >= 6 ? "High UV index — apply SPF 30+ sunscreen and wear protective eyewear." : "Air conditions and atmospheric pressure are within comfortable ranges.",
      });
    }

    const prompt = `You are a world-class meteorologist and tactical lifestyle advisor providing a Weather Intelligence Briefing.
Location: ${city}, ${country}
Current Temperature: ${temperature}°C
Condition: ${condition}
Humidity: ${humidity}%
Wind Speed: ${windSpeed} km/h
Precipitation Probability: ${precipitationProbability}%
UV Index: ${uvIndex}
Today's Range: High ${tempMax}°C / Low ${tempMin}°C

Provide a concise, highly insightful, structured JSON response with these exact keys:
- "summary": A 1-2 sentence atmospheric summary highlighting key weather drivers.
- "briefing": A 2-sentence tactical recommendation for the next 12-24 hours.
- "outfit": Specific clothing and gear recommendations.
- "outdoor": Advice for sports, walking, dining, or outdoor plans.
- "commute": Impact on driving, transit, cycling, and road safety.
- "health": Advice on UV exposure, hydration, allergens, or comfort.

Respond with ONLY valid JSON and no markdown quotes or extra text.`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = aiResponse.text || "{}";
    const parsed = JSON.parse(text);

    return res.json({
      isAiGenerated: true,
      ...parsed,
    });
  } catch (err: any) {
    console.warn("Gemini intelligence fallback activated:", err.message);
    const { city, temperature, condition, tempMax, tempMin, precipitationProbability } = req.body || {};
    return res.json({
      isAiGenerated: false,
      summary: `Atmospheric conditions for ${city || "the selected location"} indicate ${condition || "typical seasonal weather"} at ${temperature || "--"}°C.`,
      briefing: `Daytime high reaches ${tempMax ?? "--"}°C with ${precipitationProbability ?? 0}% rain probability.`,
      outfit: (temperature ?? 20) < 15 ? "Layer with a medium jacket and wind-resistant outer shell." : "Light, breathable apparel.",
      outdoor: (precipitationProbability ?? 0) > 40 ? "Keep an umbrella on hand; potential for intermittent precipitation." : "Ideal conditions for open-air recreational activities.",
      commute: "Standard transit conditions expected; maintain normal precautions.",
      health: "Ensure adequate hydration throughout the day.",
    });
  }
});

// Vite / static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Weather Intelligence server running on http://localhost:${PORT}`);
  });
}

startServer();
