import React from "react";
import { CompleteWeatherData, UnitSystem } from "../types";
import { formatTemp, formatWind, getWindDirection } from "../utils/weatherUtils";
import { WeatherIcon } from "./WeatherIcon";
import { MapPin } from "lucide-react";

interface CurrentConditionsCardProps {
  weather: CompleteWeatherData;
  unit: UnitSystem;
}

export const CurrentConditionsCard: React.FC<CurrentConditionsCardProps> = ({
  weather,
  unit,
}) => {
  const { location, current, daily } = weather;
  const today = daily[0];

  const tempDisplay = formatTemp(current.temperature, unit).replace(/[°CF]/g, "");
  const unitLabel = unit === "celsius" ? "Celsius" : "Fahrenheit";
  const windDir = getWindDirection(current.windDirection);

  return (
    <div
      id="current-conditions-card"
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-5 transition-all"
    >
      {/* Top row: Label & Weather icon */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Current Conditions</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-semibold normal-case flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location.name}, {location.country_code || location.country}
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {current.conditionText}
          </p>
        </div>
        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600">
          <WeatherIcon name={current.conditionIcon} className="w-8 h-8" />
        </div>
      </div>

      {/* Temperature readout */}
      <div className="flex items-end gap-2 my-1">
        <span className="text-6xl font-bold tracking-tighter text-slate-900 leading-none">
          {tempDisplay}°
        </span>
        <span className="text-slate-400 text-xl font-light pb-1">
          {unitLabel}
        </span>
      </div>

      {/* High, Low, Feels like, and key atmospheric indicators */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
        {today && (
          <>
            <span>
              H: <strong className="text-slate-800">{formatTemp(today.tempMax, unit)}</strong>
            </span>
            <span>
              L: <strong className="text-slate-800">{formatTemp(today.tempMin, unit)}</strong>
            </span>
          </>
        )}
        <span>
          Feels like:{" "}
          <strong className="text-slate-800">
            {formatTemp(current.apparentTemperature, unit)}
          </strong>
        </span>
        <span>
          Wind:{" "}
          <strong className="text-slate-800">
            {formatWind(current.windSpeed, unit)} {windDir}
          </strong>
        </span>
        <span>
          Humidity: <strong className="text-slate-800">{current.relativeHumidity}%</strong>
        </span>
      </div>
    </div>
  );
};
