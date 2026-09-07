import React, { useState } from "react";
import { HourlyDataPoint, UnitSystem } from "../types";
import { formatTempRaw, formatWind, getWindDirection } from "../utils/weatherUtils";

interface WeatherChartsProps {
  hourly: HourlyDataPoint[];
  unit: UnitSystem;
  currentWindSpeed: number;
  currentWindDirection: number;
}

export const WeatherCharts: React.FC<WeatherChartsProps> = ({
  hourly,
  unit,
  currentWindSpeed,
  currentWindDirection,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take the next 12 hours for crisp 24h bar variance representation
  const varianceHours = hourly.slice(0, 12);
  const temps = varianceHours.map((h) => formatTempRaw(h.temperature, unit));
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  // 12 data points for precipitation curve
  const precipHours = hourly.slice(0, 12);
  const peakRainChance = Math.max(...precipHours.map((h) => h.precipitationProbability), 0);
  const currentVisibility = hourly[0]?.visibility ?? 10;
  const windDir = getWindDirection(currentWindDirection);

  // Compute SVG path for smooth precipitation curve
  const width = 400;
  const height = 90;
  const paddingX = 10;
  const points = precipHours.map((h, i) => {
    const x = paddingX + (i / (precipHours.length - 1)) * (width - 2 * paddingX);
    // Prob 0 to 100 mapped to height - 10 down to 10
    const prob = Math.min(100, Math.max(0, h.precipitationProbability));
    const y = height - 10 - (prob / 100) * (height - 25);
    return { x, y, prob, hour: h.displayHour };
  });

  // Generate smooth SVG bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Temperature Variance (24h) */}
      <div
        id="chart-temperature-variance"
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Temperature Variance (24h)
            </h2>
            <span className="text-xs font-semibold text-slate-700">
              {hoveredIndex !== null
                ? `${varianceHours[hoveredIndex]?.displayHour}: ${temps[hoveredIndex]}°${unit === "celsius" ? "C" : "F"}`
                : `Range: ${Math.round(minTemp)}° to ${Math.round(maxTemp)}°`}
            </span>
          </div>

          {/* Bar visualizer matching the Professional Polish aesthetic */}
          <div className="h-32 flex items-end gap-1.5 px-2 pt-4">
            {varianceHours.map((h, idx) => {
              const val = temps[idx];
              // Normalize relative height between 25% and 95%
              const heightPercent = 25 + ((val - minTemp) / tempRange) * 70;
              const isHovered = hoveredIndex === idx;

              // Blue gradient shade steps
              const colorClass =
                idx === 4 || idx === 5
                  ? "bg-blue-600"
                  : idx === 3 || idx === 6
                  ? "bg-blue-500"
                  : idx === 2 || idx === 7
                  ? "bg-blue-400"
                  : idx === 1 || idx === 8
                  ? "bg-blue-300"
                  : "bg-blue-200";

              return (
                <div
                  key={`temp-bar-${idx}`}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${colorClass} ${
                      isHovered ? "ring-2 ring-blue-400 brightness-110" : "hover:opacity-90"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Time axis */}
        <div className="flex justify-between text-[10px] text-slate-400 mt-3 uppercase font-bold tracking-widest pt-2 border-t border-slate-100">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
        </div>
      </div>

      {/* 2. Precipitation Probability & Atmospheric Metrics */}
      <div
        id="chart-precipitation-probability"
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Precipitation Probability
            </h2>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Peak: {peakRainChance}%
            </span>
          </div>

          {/* Smooth SVG Area Chart */}
          <div className="relative h-28 w-full">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="precipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1={height - 5} x2={width} y2={height - 5} stroke="#e2e8f0" />

              {/* Area fill */}
              <path d={areaD} fill="url(#precipGrad)" />

              {/* Stroke line */}
              <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

              {/* Data points */}
              {points.map((p, i) => (
                <circle
                  key={`pt-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  className="fill-white stroke-blue-600 stroke-2"
                />
              ))}
            </svg>

            {/* Floating indicator tag */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-2.5 py-1 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg shadow-xs text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                RAIN RISK: {peakRainChance > 45 ? "HIGH" : peakRainChance > 15 ? "MODERATE" : "MINIMAL"}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Key Conditions: Wind Velocity & Visibility */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Wind Velocity</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {formatWind(currentWindSpeed, unit)}{" "}
              <span className="text-xs font-normal text-slate-400">{windDir}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Visibility</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {currentVisibility} km{" "}
              <span
                className={`text-xs font-normal ${
                  currentVisibility < 5 ? "text-amber-500 font-medium" : "text-slate-400"
                }`}
              >
                {currentVisibility >= 10 ? "Clear" : currentVisibility >= 5 ? "Moderate" : "Low"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
