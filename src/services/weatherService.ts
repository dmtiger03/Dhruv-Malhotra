import {
  GeoLocation,
  CompleteWeatherData,
  HourlyDataPoint,
  DailyForecast,
  WeatherIntelligenceBriefing,
  AppError,
} from "../types";
import { getWeatherInfo } from "../utils/weatherUtils";

export async function searchCities(query: string): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const response = await fetch(`/api/weather/search?q=${encodeURIComponent(trimmed)}`);
    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        return [];
      }
      throw new Error(`Search failed: HTTP ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err: any) {
    // Fallback to direct geocoding api if proxy had transient error
    try {
      const directUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        trimmed
      )}&count=10&language=en&format=json`;
      const directRes = await fetch(directUrl);
      if (directRes.ok) {
        const directData = await directRes.json();
        return directData.results || [];
      }
    } catch {
      // ignore
    }
    throw new Error(err.message || "Failed to search cities");
  }
}

export async function fetchWeatherForLocation(
  location: GeoLocation
): Promise<CompleteWeatherData> {
  let rawData: any;
  try {
    const response = await fetch(
      `/api/weather/forecast?lat=${location.latitude}&lon=${location.longitude}&timezone=${encodeURIComponent(
        location.timezone || "auto"
      )}`
    );

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    rawData = await response.json();
  } catch (err: any) {
    // Fallback to direct Open-Meteo endpoint
    try {
      const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${
        location.longitude
      }&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=${encodeURIComponent(
        location.timezone || "auto"
      )}`;
      const directRes = await fetch(directUrl);
      if (!directRes.ok) throw new Error("Direct meteorological service unreachable");
      rawData = await directRes.json();
    } catch (fallbackErr: any) {
      throw new Error(
        `Unable to fetch weather forecast data. Check your network connection. (${err.message})`
      );
    }
  }

  const current = rawData.current;
  const hourly = rawData.hourly;
  const daily = rawData.daily;

  if (!current || !hourly || !daily) {
    throw new Error("Received incomplete meteorological data payload.");
  }

  const isDay = current.is_day === 1;
  const weatherInfo = getWeatherInfo(current.weather_code, isDay);

  // Transform Current
  const currentWeather = {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    relativeHumidity: current.relative_humidity_2m,
    isDay: isDay,
    precipitation: current.precipitation ?? 0,
    rain: current.rain ?? 0,
    showers: current.showers ?? 0,
    snowfall: current.snowfall ?? 0,
    weatherCode: current.weather_code,
    cloudCover: current.cloud_cover ?? 0,
    pressureMsl: current.pressure_msl ?? current.surface_pressure ?? 1013,
    surfacePressure: current.surface_pressure ?? 1013,
    windSpeed: current.wind_speed_10m ?? 0,
    windDirection: current.wind_direction_10m ?? 0,
    windGusts: current.wind_gusts_10m ?? current.wind_speed_10m ?? 0,
    time: current.time,
    conditionText: weatherInfo.description,
    conditionIcon: weatherInfo.iconName,
  };

  // Find current hour index in hourly array
  const nowIso = new Date().toISOString().slice(0, 13);
  let startIndex = 0;
  if (Array.isArray(hourly.time)) {
    const found = hourly.time.findIndex((t: string) => t.startsWith(nowIso));
    startIndex = found >= 0 ? found : 0;
  }

  // Parse Hourly Data Points (next 48 hours)
  const hourlyPoints: HourlyDataPoint[] = [];
  const maxHours = Math.min(hourly.time.length, startIndex + 48);

  for (let i = startIndex; i < maxHours; i++) {
    const rawTime = hourly.time[i];
    const dateObj = new Date(rawTime);
    const displayHour = dateObj.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const hCode = hourly.weather_code[i];
    const hInfo = getWeatherInfo(hCode, true);

    hourlyPoints.push({
      time: rawTime,
      displayHour: i === startIndex ? "Now" : displayHour,
      temperature: hourly.temperature_2m[i],
      apparentTemperature: hourly.apparent_temperature[i],
      relativeHumidity: hourly.relative_humidity_2m[i],
      dewPoint: hourly.dew_point_2m ? hourly.dew_point_2m[i] : hourly.temperature_2m[i] - 5,
      precipitationProbability: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
      precipitation: hourly.precipitation ? hourly.precipitation[i] : 0,
      weatherCode: hCode,
      pressureMsl: hourly.pressure_msl ? hourly.pressure_msl[i] : 1013,
      cloudCover: hourly.cloud_cover ? hourly.cloud_cover[i] : 0,
      visibility: hourly.visibility ? Math.round(hourly.visibility[i] / 1000) : 10,
      windSpeed: hourly.wind_speed_10m[i],
      windDirection: hourly.wind_direction_10m[i],
      windGusts: hourly.wind_gusts_10m ? hourly.wind_gusts_10m[i] : hourly.wind_speed_10m[i],
      uvIndex: hourly.uv_index ? hourly.uv_index[i] : 0,
      conditionText: hInfo.description,
    });
  }

  // Parse Daily Forecasts (7-10 days)
  const dailyForecasts: DailyForecast[] = [];
  const daysCount = daily.time.length;

  for (let d = 0; d < daysCount; d++) {
    const dateStr = daily.time[d];
    const dateObj = new Date(dateStr + "T12:00:00");
    const isToday = d === 0;
    const isTomorrow = d === 1;
    const dayName = isToday
      ? "Today"
      : isTomorrow
      ? "Tomorrow"
      : dateObj.toLocaleDateString([], { weekday: "short" });

    const code = daily.weather_code[d];
    const info = getWeatherInfo(code, true);

    dailyForecasts.push({
      date: dateStr,
      dayName,
      weatherCode: code,
      tempMax: daily.temperature_2m_max[d],
      tempMin: daily.temperature_2m_min[d],
      apparentTempMax: daily.apparent_temperature_max ? daily.apparent_temperature_max[d] : daily.temperature_2m_max[d],
      apparentTempMin: daily.apparent_temperature_min ? daily.apparent_temperature_min[d] : daily.temperature_2m_min[d],
      sunrise: daily.sunrise ? daily.sunrise[d] : "",
      sunset: daily.sunset ? daily.sunset[d] : "",
      daylightDuration: daily.daylight_duration ? Math.round(daily.daylight_duration[d] / 3600) : 12,
      uvIndexMax: daily.uv_index_max ? daily.uv_index_max[d] : 5,
      precipitationSum: daily.precipitation_sum ? daily.precipitation_sum[d] : 0,
      precipitationProbabilityMax: daily.precipitation_probability_max ? daily.precipitation_probability_max[d] : 0,
      windSpeedMax: daily.wind_speed_10m_max ? daily.wind_speed_10m_max[d] : 15,
      windGustsMax: daily.wind_gusts_10m_max ? daily.wind_gusts_10m_max[d] : 20,
      windDirectionDominant: daily.wind_direction_10m_dominant ? daily.wind_direction_10m_dominant[d] : 0,
      conditionText: info.description,
    });
  }

  // Request Intelligence Briefing (AI with Heuristic Fallback)
  let intelligence: WeatherIntelligenceBriefing;
  try {
    const intRes = await fetch("/api/weather/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: location.name,
        country: location.country,
        temperature: currentWeather.temperature,
        condition: currentWeather.conditionText,
        humidity: currentWeather.relativeHumidity,
        windSpeed: currentWeather.windSpeed,
        precipitationProbability: dailyForecasts[0]?.precipitationProbabilityMax || 0,
        uvIndex: dailyForecasts[0]?.uvIndexMax || 3,
        tempMax: dailyForecasts[0]?.tempMax || currentWeather.temperature,
        tempMin: dailyForecasts[0]?.tempMin || currentWeather.temperature,
      }),
    });

    if (intRes.ok) {
      intelligence = await intRes.json();
    } else {
      throw new Error("Intelligence service offline");
    }
  } catch {
    // Generate deterministic client-side recommendations
    intelligence = generateClientRecommendations(location, currentWeather, dailyForecasts[0]);
  }

  return {
    location,
    current: currentWeather,
    hourly: hourlyPoints,
    daily: dailyForecasts,
    intelligence,
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

export function generateClientRecommendations(
  location: GeoLocation,
  current: any,
  todayForecast?: DailyForecast
): WeatherIntelligenceBriefing {
  const temp = current.temperature;
  const rainChance = todayForecast?.precipitationProbabilityMax || 0;
  const wind = current.windSpeed;
  const uv = todayForecast?.uvIndexMax || 3;

  // Outfit
  let outfit = "";
  if (temp < 0) {
    outfit = "Heavy down coat, thermal base layer, wool gloves, and insulated snow boots.";
  } else if (temp < 10) {
    outfit = "Warm winter coat or parka with a knit scarf and closed-toe footwear.";
  } else if (temp < 18) {
    outfit = "Light jacket, sweater, or fleece layer with comfortable jeans or trousers.";
  } else if (temp < 26) {
    outfit = "Breathable t-shirt, light chinos or denim, and comfortable walking shoes.";
  } else {
    outfit = "Ultra-lightweight breathable fabrics, linen or cotton, sunglasses, and a sunhat.";
  }
  if (rainChance > 45) {
    outfit += " Carry a sturdy compact umbrella or water-resistant shell.";
  }

  // Outdoor
  let outdoor = "";
  if (rainChance > 60 || current.precipitation > 2) {
    outdoor = "Wet conditions expected. Indoor activities or gym workouts are highly recommended.";
  } else if (wind > 35) {
    outdoor = "Breezy to gusty conditions. High-wind sports and open umbrellas may be challenging.";
  } else if (temp >= 15 && temp <= 25) {
    outdoor = "Optimal atmospheric window for running, cycling, hiking, or patio dining.";
  } else {
    outdoor = "Moderate conditions for casual outdoor walks; stay prepared for shifts.";
  }

  // Commute
  let commute = "";
  if (rainChance > 50 || current.precipitation > 0) {
    commute = "Slick roadways and wet pavement; increase following distance and anticipate transit slowdowns.";
  } else if (wind > 40) {
    commute = "Crosswind alerts on exposed highways and bridges; grip the steering wheel firmly.";
  } else {
    commute = "Clear road visibility and smooth transit conditions across the metropolitan area.";
  }

  // Health
  let health = "";
  if (uv >= 6) {
    health = "High solar radiation. Apply SPF 30+ sunscreen, seek shade between 11 AM - 3 PM, and stay hydrated.";
  } else if (temp < 5) {
    health = "Cold air can dry mucous membranes. Keep moisturized and wear a neck gaiter or scarf.";
  } else {
    health = "Comfortable ambient humidity and barometric levels. Standard hydration recommended.";
  }

  return {
    isAiGenerated: false,
    summary: `${current.conditionText} throughout ${location.name} with temperatures near ${Math.round(temp)}°C.`,
    briefing: `Expect peak daytime highs of ${Math.round(todayForecast?.tempMax || temp)}°C and a ${rainChance}% probability of rain.`,
    outfit,
    outdoor,
    commute,
    health,
  };
}

export function createSimulatedError(type: AppError["type"]): AppError {
  switch (type) {
    case "city_not_found":
      return {
        type: "city_not_found",
        title: "City Not Found",
        message: "We couldn't find any location matching your search query.",
        suggestion: "Check spelling, try searching for a major nearby city or country name (e.g. 'Tokyo', 'London', 'San Francisco').",
        canRetry: false,
      };
    case "network_error":
      return {
        type: "network_error",
        title: "Network Connection Timeout",
        message: "The meteorological data servers could not be contacted due to a network interruption.",
        suggestion: "Verify your internet connectivity and click the retry button below to re-establish connection.",
        details: "ERR_CONNECTION_TIMED_OUT: 504 Gateway Timeout on /api/weather/forecast",
        canRetry: true,
      };
    case "api_error":
      return {
        type: "api_error",
        title: "Weather Service Error (500)",
        message: "The upstream weather data service encountered an unexpected internal server error.",
        suggestion: "Our service has logged this incident. You can retry in a few moments or switch to a preset city.",
        details: "HTTP 500 Internal Server Error: Meteorological model processing failure",
        canRetry: true,
      };
    case "geo_denied":
      return {
        type: "geo_denied",
        title: "Location Access Denied",
        message: "Location permissions were declined or unavailable in your browser.",
        suggestion: "Enable location permissions in your browser address bar settings or use the search box above to choose any city worldwide.",
        canRetry: true,
      };
    case "search_empty":
      return {
        type: "search_empty",
        title: "Empty Search Query",
        message: "Please enter a valid city or place name before searching.",
        suggestion: "Type at least 2 letters, e.g., 'Paris', 'Zurich', or pick one of our quick presets.",
        canRetry: false,
      };
    default:
      return {
        type: "simulated_error",
        title: "System Diagnostics State",
        message: "This is a simulated error state to verify application resilience and recovery mechanisms.",
        suggestion: "Click 'Recover to Default City' or 'Retry' to restore active weather streaming.",
        canRetry: true,
      };
  }
}
