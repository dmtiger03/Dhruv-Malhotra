import React, { useState } from "react";
import { DailyForecast, UnitSystem } from "../types";
import { formatTemp } from "../utils/weatherUtils";
import { WeatherIcon } from "./WeatherIcon";
import { Umbrella, Wind, SunMedium } from "lucide-react";

interface StrategicForecastProps {
  forecasts: DailyForecast[];
  unit: UnitSystem;
}

export const StrategicForecast: React.FC<StrategicForecastProps> = ({
  forecasts,
  unit,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const selectedDay = forecasts[selectedDayIndex] || forecasts[0];

  return (
    <div
      id="strategic-forecast-card"
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
          7-Day Strategic Forecast
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          Select a day for atmospheric breakdown
        </span>
      </div>

      {/* Daily Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {forecasts.slice(0, 7).map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          const isToday = idx === 0;
          return (
            <button
              key={day.date}
              type="button"
              id={`forecast-day-${idx}`}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-center border ${
                isSelected
                  ? "bg-slate-50 border-blue-500 ring-2 ring-blue-500/10 shadow-xs"
                  : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/60"
              }`}
            >
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isSelected ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {isToday ? "TODAY" : day.dayName}
              </span>

              <div className="w-8 h-8 flex items-center justify-center text-blue-600 my-0.5">
                <WeatherIcon name={getForecastIcon(day.weatherCode)} className="w-6 h-6" />
              </div>

              <div className="flex flex-col items-center leading-none">
                <span className="text-sm font-bold text-slate-900">
                  {formatTemp(day.tempMax, unit)}
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {formatTemp(day.tempMin, unit)}
                </span>
              </div>

              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  day.precipitationProbabilityMax > 40
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-400"
                }`}
              >
                {day.precipitationProbabilityMax}% Prec.
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Breakdown Strip */}
      {selectedDay && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 uppercase tracking-wide">
              {selectedDay.dayName} ({selectedDay.date})
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-700">{selectedDay.conditionText}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-blue-700">
              <Umbrella className="w-3.5 h-3.5" />
              {selectedDay.precipitationSum} mm ({selectedDay.precipitationProbabilityMax}%)
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <Wind className="w-3.5 h-3.5 text-slate-400" />
              Max Gusts {Math.round(selectedDay.windGustsMax)} km/h
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <SunMedium className="w-3.5 h-3.5" />
              UV Index {selectedDay.uvIndexMax}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

function getForecastIcon(code: number): string {
  if (code === 0 || code === 1) return "Sun";
  if (code === 2) return "CloudSun";
  if (code === 3) return "Cloud";
  if (code >= 51 && code <= 67) return "CloudRain";
  if (code >= 71 && code <= 86) return "Snowflake";
  if (code >= 95) return "CloudLightning";
  return "Cloud";
}
