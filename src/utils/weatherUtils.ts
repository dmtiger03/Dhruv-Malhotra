import { GeoLocation, UnitSystem } from "../types";

export interface WMOWeatherInfo {
  description: string;
  iconName: string;
  category: "clear" | "cloudy" | "fog" | "rain" | "snow" | "thunderstorm";
  accentColor: string;
}

export function getWeatherInfo(code: number, isDay: boolean = true): WMOWeatherInfo {
  switch (code) {
    case 0:
      return {
        description: isDay ? "Clear sky" : "Clear night",
        iconName: isDay ? "Sun" : "Moon",
        category: "clear",
        accentColor: "text-amber-500",
      };
    case 1:
      return {
        description: isDay ? "Mainly clear" : "Mainly clear night",
        iconName: isDay ? "SunMedium" : "Moon",
        category: "clear",
        accentColor: "text-amber-400",
      };
    case 2:
      return {
        description: "Partly cloudy",
        iconName: isDay ? "CloudSun" : "CloudMoon",
        category: "cloudy",
        accentColor: "text-sky-400",
      };
    case 3:
      return {
        description: "Overcast",
        iconName: "Cloud",
        category: "cloudy",
        accentColor: "text-slate-400",
      };
    case 45:
    case 48:
      return {
        description: code === 48 ? "Depositing rime fog" : "Foggy",
        iconName: "CloudFog",
        category: "fog",
        accentColor: "text-zinc-400",
      };
    case 51:
    case 53:
    case 55:
      return {
        description: "Light to moderate drizzle",
        iconName: "CloudDrizzle",
        category: "rain",
        accentColor: "text-blue-400",
      };
    case 56:
    case 57:
      return {
        description: "Freezing drizzle",
        iconName: "CloudSnow",
        category: "rain",
        accentColor: "text-cyan-400",
      };
    case 61:
      return {
        description: "Slight rain",
        iconName: "CloudRain",
        category: "rain",
        accentColor: "text-blue-500",
      };
    case 63:
      return {
        description: "Moderate rain",
        iconName: "CloudRain",
        category: "rain",
        accentColor: "text-blue-600",
      };
    case 65:
      return {
        description: "Heavy rain",
        iconName: "CloudRain",
        category: "rain",
        accentColor: "text-indigo-600",
      };
    case 66:
    case 67:
      return {
        description: "Freezing rain",
        iconName: "CloudHail",
        category: "rain",
        accentColor: "text-cyan-500",
      };
    case 71:
      return {
        description: "Slight snowfall",
        iconName: "Snowflake",
        category: "snow",
        accentColor: "text-sky-300",
      };
    case 73:
      return {
        description: "Moderate snowfall",
        iconName: "Snowflake",
        category: "snow",
        accentColor: "text-sky-400",
      };
    case 75:
      return {
        description: "Heavy snowfall",
        iconName: "Snowflake",
        category: "snow",
        accentColor: "text-blue-300",
      };
    case 77:
      return {
        description: "Snow grains",
        iconName: "Snowflake",
        category: "snow",
        accentColor: "text-slate-300",
      };
    case 80:
    case 81:
    case 82:
      return {
        description: "Rain showers",
        iconName: "CloudRain",
        category: "rain",
        accentColor: "text-blue-500",
      };
    case 85:
    case 86:
      return {
        description: "Snow showers",
        iconName: "CloudSnow",
        category: "snow",
        accentColor: "text-sky-300",
      };
    case 95:
      return {
        description: "Thunderstorm",
        iconName: "CloudLightning",
        category: "thunderstorm",
        accentColor: "text-amber-500",
      };
    case 96:
    case 99:
      return {
        description: "Thunderstorm with hail",
        iconName: "CloudLightning",
        category: "thunderstorm",
        accentColor: "text-purple-500",
      };
    default:
      return {
        description: "Variable conditions",
        iconName: "Sun",
        category: "clear",
        accentColor: "text-amber-500",
      };
  }
}

export function formatTemp(celsius: number, unit: UnitSystem): string {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return "--°";
  if (unit === "fahrenheit") {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempRaw(celsius: number, unit: UnitSystem): number {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return 0;
  if (unit === "fahrenheit") {
    return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
  }
  return Math.round(celsius * 10) / 10;
}

export function formatWind(kmh: number, unit: UnitSystem): string {
  if (kmh === undefined || kmh === null || isNaN(kmh)) return "--";
  if (unit === "fahrenheit") {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function getWindDirection(deg: number): string {
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return directions[index];
}

export function getUVRating(uv: number): { text: string; color: string; badgeBg: string } {
  if (uv < 3) return { text: "Low", color: "text-emerald-600", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (uv < 6) return { text: "Moderate", color: "text-amber-600", badgeBg: "bg-amber-50 text-amber-700 border-amber-200" };
  if (uv < 8) return { text: "High", color: "text-orange-600", badgeBg: "bg-orange-50 text-orange-700 border-orange-200" };
  if (uv < 11) return { text: "Very High", color: "text-rose-600", badgeBg: "bg-rose-50 text-rose-700 border-rose-200" };
  return { text: "Extreme", color: "text-purple-600", badgeBg: "bg-purple-50 text-purple-700 border-purple-200" };
}

export function getHumidityRating(humidity: number): string {
  if (humidity < 30) return "Dry & Crisp";
  if (humidity <= 55) return "Comfortable & Ideal";
  if (humidity <= 70) return "Moderately Humid";
  return "Humid & Muggy";
}

export const PRESET_CITIES: GeoLocation[] = [
  {
    id: 2673730,
    name: "Stockholm",
    latitude: 59.3293,
    longitude: 18.0686,
    country_code: "SE",
    country: "Sweden",
    admin1: "Stockholm",
    timezone: "Europe/Stockholm",
  },
  {
    id: 2643743,
    name: "London",
    latitude: 51.50853,
    longitude: -0.12574,
    country_code: "GB",
    country: "United Kingdom",
    admin1: "England",
    timezone: "Europe/London",
  },
  {
    id: 5128581,
    name: "New York",
    latitude: 40.71427,
    longitude: -74.00597,
    country_code: "US",
    country: "United States",
    admin1: "New York",
    timezone: "America/New_York",
  },
  {
    id: 1850147,
    name: "Tokyo",
    latitude: 35.6895,
    longitude: 139.69171,
    country_code: "JP",
    country: "Japan",
    admin1: "Tokyo",
    timezone: "Asia/Tokyo",
  },
  {
    id: 2988507,
    name: "Paris",
    latitude: 48.85341,
    longitude: 2.3488,
    country_code: "FR",
    country: "France",
    admin1: "Île-de-France",
    timezone: "Europe/Paris",
  },
  {
    id: 2147714,
    name: "Sydney",
    latitude: -33.86785,
    longitude: 151.20732,
    country_code: "AU",
    country: "Australia",
    admin1: "New South Wales",
    timezone: "Australia/Sydney",
  },
  {
    id: 292223,
    name: "Dubai",
    latitude: 25.07725,
    longitude: 55.30927,
    country_code: "AE",
    country: "United Arab Emirates",
    admin1: "Dubai",
    timezone: "Asia/Dubai",
  },
  {
    id: 5391959,
    name: "San Francisco",
    latitude: 37.77493,
    longitude: -122.41942,
    country_code: "US",
    country: "United States",
    admin1: "California",
    timezone: "America/Los_Angeles",
  },
  {
    id: 1275339,
    name: "Mumbai",
    latitude: 19.07283,
    longitude: 72.88261,
    country_code: "IN",
    country: "India",
    admin1: "Maharashtra",
    timezone: "Asia/Kolkata",
  },
];
