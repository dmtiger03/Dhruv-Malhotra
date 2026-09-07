import React from "react";
import {
  Compass,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { UnitSystem } from "../types";

interface HeaderProps {
  unit: UnitSystem;
  onToggleUnit: (unit: UnitSystem) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: string;
  onOpenErrorPlayground: () => void;
  hasActiveError: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onToggleUnit,
  onUseCurrentLocation,
  isLocating,
  onRefresh,
  isRefreshing,
  lastUpdated,
  onOpenErrorPlayground,
  hasActiveError,
}) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-xs flex-shrink-0">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                WEATHER INTEL <span className="font-normal text-slate-400">| SYSTEMS</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Precision Atmospheric Intelligence & Predictive Modeling
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Error States QA Trigger */}
          <button
            id="btn-error-playground"
            onClick={onOpenErrorPlayground}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              hasActiveError
                ? "bg-rose-100 text-rose-800 border border-rose-300 ring-2 ring-rose-400/20"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            }`}
            title="Confirm and simulate error states"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Test Error States</span>
            <span className="md:hidden">Error QA</span>
          </button>

          {/* Current Geolocation */}
          <button
            id="btn-current-location"
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 transition-colors disabled:opacity-60"
            title="Detect location automatically"
          >
            <MapPin className={`w-3.5 h-3.5 text-sky-600 ${isLocating ? "animate-bounce" : ""}`} />
            <span className="hidden sm:inline">{isLocating ? "Locating..." : "My Location"}</span>
          </button>

          {/* Temperature Unit Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              id="btn-unit-celsius"
              onClick={() => onToggleUnit("celsius")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                unit === "celsius"
                  ? "bg-white text-sky-700 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              °C
            </button>
            <button
              id="btn-unit-fahrenheit"
              onClick={() => onToggleUnit("fahrenheit")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                unit === "fahrenheit"
                  ? "bg-white text-sky-700 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              °F
            </button>
          </div>

          {/* Refresh button */}
          <button
            id="btn-refresh-weather"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors disabled:opacity-50"
            title={lastUpdated ? `Last updated ${lastUpdated} - Click to refresh` : "Refresh data"}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-sky-600" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
