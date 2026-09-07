import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { CitySearch } from "./components/CitySearch";
import { CurrentConditionsCard } from "./components/CurrentConditionsCard";
import { IntelligentRecommendationsCard } from "./components/IntelligentRecommendationsCard";
import { StrategicForecast } from "./components/StrategicForecast";
import { WeatherCharts } from "./components/WeatherCharts";
import { FooterBar } from "./components/FooterBar";
import { ErrorStateModal } from "./components/ErrorStateModal";
import { CompleteWeatherData, GeoLocation, UnitSystem, AppError } from "./types";
import { PRESET_CITIES } from "./utils/weatherUtils";
import { fetchWeatherForLocation, createSimulatedError } from "./services/weatherService";
import { AlertCircle, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";

export default function App() {
  // Default to Stockholm, Sweden as in the Professional Polish design
  const [selectedCity, setSelectedCity] = useState<GeoLocation>(PRESET_CITIES[0]);
  const [weather, setWeather] = useState<CompleteWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unit, setUnit] = useState<UnitSystem>("celsius");
  const [activeError, setActiveError] = useState<AppError | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Load weather for location
  const loadWeather = useCallback(async (city: GeoLocation) => {
    setIsLoading(true);
    setActiveError(null);
    setSearchNotice(null);
    try {
      const data = await fetchWeatherForLocation(city);
      setWeather(data);
    } catch (err: any) {
      console.error("Failed to load weather:", err);
      setActiveError({
        type: "api_error",
        title: "Weather Telemetry Unavailable",
        message: err.message || "Failed to contact weather radar telemetry servers.",
        suggestion: "Verify network status or select one of the preset global capitals.",
        details: err.stack,
        canRetry: true,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity, loadWeather]);

  // Handle City Select
  const handleSelectCity = (city: GeoLocation) => {
    setSelectedCity(city);
    setActiveError(null);
    setSearchNotice(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadWeather(selectedCity);
  };

  // Handle Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setActiveError({
        type: "geo_denied",
        title: "Geolocation Unsupported",
        message: "Your browser does not support HTML5 geolocation services.",
        suggestion: "Use the city search field to select any global location.",
        canRetry: false,
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const currentLoc: GeoLocation = {
          id: Math.round(latitude * 1000 + longitude),
          name: "Current Location",
          latitude,
          longitude,
          country_code: "GPS",
          country: "Detected Location",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "auto",
        };
        setSelectedCity(currentLoc);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setActiveError({
          type: "geo_denied",
          title: "Location Permission Denied",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Browser location access was declined by the user."
              : "Location detection timed out or is temporarily unavailable.",
          suggestion:
            "Enable location permissions in browser site settings or search by city name.",
          canRetry: true,
        });
      },
      { timeout: 8000 }
    );
  };

  // Error simulation for verification
  const handleSimulateError = (type: AppError["type"]) => {
    const errorObj = createSimulatedError(type);
    setActiveError(errorObj);
    if (type === "city_not_found") {
      setSearchNotice(`Location 'Oslo' not found. Reverting to ${selectedCity.name}.`);
    } else {
      setSearchNotice(null);
    }
  };

  const handleClearError = () => {
    setActiveError(null);
    setSearchNotice(null);
    loadWeather(selectedCity);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header with Professional Polish theme branding and controls */}
      <Header
        unit={unit}
        onToggleUnit={setUnit}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={weather?.lastUpdated}
        onOpenErrorPlayground={() => setIsErrorModalOpen(true)}
        hasActiveError={activeError !== null}
      />

      {/* 2. Main content container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Search Bar Section with theme styling */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-2xl relative">
            <CitySearch
              onSelectCity={handleSelectCity}
              selectedCity={selectedCity}
              onErrorTrigger={(type) => handleSimulateError(type)}
            />

            {/* Notification under search as in Design HTML: Location 'Oslo' not found. Reverting to Stockholm */}
            {searchNotice && (
              <div
                id="search-error-notice"
                className="absolute -bottom-5 right-0 text-[10px] text-red-500 font-medium flex items-center gap-1 animate-in fade-in duration-200"
              >
                <span>{searchNotice}</span>
                <button
                  onClick={() => setSearchNotice(null)}
                  className="underline ml-1 text-slate-500 hover:text-slate-800"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>

        {/* In-Page Error Banner if active */}
        {activeError && (
          <div
            id="active-error-banner"
            className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-800 shadow-xs animate-in fade-in duration-200"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-900">{activeError.title}</h4>
                <p className="text-xs text-red-700 mt-0.5">{activeError.message}</p>
                {activeError.suggestion && (
                  <p className="text-[11px] text-red-600/90 italic mt-0.5">
                    {activeError.suggestion}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              {activeError.canRetry && (
                <button
                  onClick={() => loadWeather(selectedCity)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              )}
              <button
                onClick={handleClearError}
                className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-100 text-red-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Restore Default
              </button>
            </div>
          </div>
        )}

        {/* Loading State Skeleton or Active Weather Dashboard */}
        {isLoading && !weather ? (
          <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Contacting meteorological radar arrays...
            </p>
            <p className="text-xs text-slate-400">
              Retrieving high-resolution forecasts for {selectedCity.name}
            </p>
          </div>
        ) : weather ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column (4 cols): Current Conditions & Intelligent Recommendations */}
            <section className="lg:col-span-4 flex flex-col gap-6">
              <CurrentConditionsCard weather={weather} unit={unit} />
              <IntelligentRecommendationsCard
                weather={weather}
                unit={unit}
                onRefreshIntelligence={() => loadWeather(selectedCity)}
                isLoading={isLoading}
              />
            </section>

            {/* Right Column (8 cols): 7-Day Strategic Forecast & 24h Variance / Probability Charts */}
            <section className="lg:col-span-8 flex flex-col gap-6">
              <StrategicForecast forecasts={weather.daily} unit={unit} />
              <WeatherCharts
                hourly={weather.hourly}
                unit={unit}
                currentWindSpeed={weather.current.windSpeed}
                currentWindDirection={weather.current.windDirection}
              />
            </section>
          </div>
        ) : null}
      </main>

      {/* 3. Footer Bar matching the Professional Polish theme */}
      <FooterBar weather={weather} lastUpdated={weather?.lastUpdated} />

      {/* 4. Error State QA and Verification Modal */}
      <ErrorStateModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        activeError={activeError}
        onSimulateError={handleSimulateError}
        onClearError={handleClearError}
        onRetry={() => loadWeather(selectedCity)}
      />
    </div>
  );
}
