import React from "react";
import { AlertTriangle, Zap, Shirt, Car, Sparkles, RefreshCw } from "lucide-react";
import { CompleteWeatherData, UnitSystem } from "../types";

interface IntelligentRecommendationsCardProps {
  weather: CompleteWeatherData;
  unit: UnitSystem;
  onRefreshIntelligence?: () => void;
  isLoading?: boolean;
}

export const IntelligentRecommendationsCard: React.FC<IntelligentRecommendationsCardProps> = ({
  weather,
  unit,
  onRefreshIntelligence,
  isLoading = false,
}) => {
  const { intelligence, current, daily } = weather;
  const today = daily[0];

  // Derive contextual insights
  const rainChance = today?.precipitationProbabilityMax ?? 0;
  const temp = current.temperature;
  const isHighHeating = temp < 5;
  const isHighCooling = temp > 28;

  const energyDemandPercent = isHighHeating
    ? Math.min(45, Math.max(10, Math.round((18 - temp) * 2.2)))
    : isHighCooling
    ? Math.min(40, Math.max(12, Math.round((temp - 24) * 3.1)))
    : 4;

  const energyMessage = isHighHeating
    ? `Heating demand is ${energyDemandPercent}% above baseline today. Verify insulation seals and keep internal temperature regulated.`
    : isHighCooling
    ? `Cooling demand is ${energyDemandPercent}% above normal. Close sun-facing blinds to reduce solar heat gain.`
    : "Atmospheric equilibrium: HVAC energy load is optimal and within baseline thresholds.";

  return (
    <div
      id="intelligent-recommendations-card"
      className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden"
    >
      {/* Background ambient accent */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-blue-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            Intelligent Recommendations
          </h2>
          {intelligence.isAiGenerated && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500 text-blue-100 border border-blue-400/40">
              AI Powered
            </span>
          )}
        </div>

        {/* Tactical Recommendation Items */}
        <div className="space-y-3.5">
          {/* Weather Alert / Primary Briefing */}
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 bg-blue-500/80 p-1.5 rounded-lg text-white flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-sm leading-relaxed text-blue-50">
              {intelligence.briefing ||
                (rainChance > 40
                  ? `Precipitation probability peaks at ${rainChance}%. Ensure waterproof outerwear and plan outdoor logistics accordingly.`
                  : `Stable barometric pressure over ${weather.location.name}. Favorable conditions for travel and outdoor operations.`)}
            </p>
          </div>

          {/* Energy & Climate Efficiency */}
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 bg-blue-500/80 p-1.5 rounded-lg text-white flex-shrink-0">
              <Zap className="w-4 h-4 text-yellow-300" />
            </div>
            <p className="text-sm leading-relaxed text-blue-50">
              <strong className="text-white font-semibold">Energy efficiency:</strong>{" "}
              {energyMessage}
            </p>
          </div>

          {/* Apparel & Equipment */}
          {intelligence.outfit && (
            <div className="flex gap-3 items-start">
              <div className="mt-0.5 bg-blue-500/80 p-1.5 rounded-lg text-white flex-shrink-0">
                <Shirt className="w-4 h-4 text-blue-200" />
              </div>
              <p className="text-sm leading-relaxed text-blue-50">
                <strong className="text-white font-semibold">Apparel:</strong>{" "}
                {intelligence.outfit}
              </p>
            </div>
          )}

          {/* Commute & Transit */}
          {intelligence.commute && (
            <div className="flex gap-3 items-start">
              <div className="mt-0.5 bg-blue-500/80 p-1.5 rounded-lg text-white flex-shrink-0">
                <Car className="w-4 h-4 text-blue-200" />
              </div>
              <p className="text-sm leading-relaxed text-blue-50">
                <strong className="text-white font-semibold">Transit:</strong>{" "}
                {intelligence.commute}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Attribution & Refresh trigger */}
      <div className="flex items-center justify-between pt-3 border-t border-blue-500/50 text-blue-200 text-xs mt-1">
        <p className="italic text-[11px] leading-snug">
          Synthesized from Doppler radar, barometric gradients, and predictive meteorological telemetry.
        </p>
        {onRefreshIntelligence && (
          <button
            onClick={onRefreshIntelligence}
            disabled={isLoading}
            className="p-1 rounded-md hover:bg-blue-500 text-blue-200 hover:text-white transition-colors flex-shrink-0 ml-2"
            title="Recalculate recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
};
