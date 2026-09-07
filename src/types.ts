export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code: string;
  country: string;
  admin1?: string;
  admin2?: string;
  timezone: string;
  population?: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  cloudCover: number;
  pressureMsl: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  time: string;
  conditionText: string;
  conditionIcon: string;
}

export interface HourlyDataPoint {
  time: string;
  displayHour: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  dewPoint: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  pressureMsl: number;
  cloudCover: number;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  conditionText: string;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  daylightDuration: number;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
  conditionText: string;
}

export interface WeatherIntelligenceBriefing {
  isAiGenerated: boolean;
  summary: string;
  briefing: string;
  outfit: string;
  outdoor: string;
  commute: string;
  health: string;
}

export interface CompleteWeatherData {
  location: GeoLocation;
  current: CurrentWeather;
  hourly: HourlyDataPoint[];
  daily: DailyForecast[];
  intelligence: WeatherIntelligenceBriefing;
  lastUpdated: string;
}

export type UnitSystem = "celsius" | "fahrenheit";

export type ChartMetric = "temperature" | "precipitation" | "wind" | "humidity";

export interface AppError {
  type: "search_empty" | "city_not_found" | "network_error" | "api_error" | "geo_denied" | "simulated_error";
  title: string;
  message: string;
  suggestion?: string;
  details?: string;
  canRetry: boolean;
}
