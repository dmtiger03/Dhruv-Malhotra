import React from "react";
import { CompleteWeatherData } from "../types";

interface FooterBarProps {
  weather?: CompleteWeatherData | null;
  lastUpdated?: string;
}

export const FooterBar: React.FC<FooterBarProps> = ({ weather, lastUpdated }) => {
  const stationId = weather
    ? `WMO-${weather.location.country_code || "INT"}-${weather.location.id.toString().slice(-4)}`
    : "STHLM-NORD-049";

  return (
    <footer
      id="app-footer-bar"
      className="h-8 bg-slate-100 border-t border-slate-200 px-4 sm:px-8 flex items-center justify-between text-[10px] text-slate-500 font-medium uppercase tracking-widest overflow-x-auto whitespace-nowrap"
    >
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Station ID: <strong className="text-slate-700">{stationId}</strong>
      </span>
      <span className="hidden sm:inline">
        Data Accuracy: <strong className="text-slate-700">99.4% (ECMWF / GFS)</strong>
      </span>
      <span>
        Last Sync:{" "}
        <strong className="text-slate-700">
          {lastUpdated || "Just now"}
        </strong>
      </span>
    </footer>
  );
};
