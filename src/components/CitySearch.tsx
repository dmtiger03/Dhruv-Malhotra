import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";
import { GeoLocation } from "../types";
import { searchCities } from "../services/weatherService";
import { PRESET_CITIES } from "../utils/weatherUtils";

interface CitySearchProps {
  onSelectCity: (city: GeoLocation) => void;
  selectedCity?: GeoLocation;
  onErrorTrigger?: (type: "city_not_found" | "search_empty") => void;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  onSelectCity,
  selectedCity,
  onErrorTrigger,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<GeoLocation[]>(() => {
    try {
      const saved = localStorage.getItem("weather_recent_cities");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save recent search
  const saveToRecent = (city: GeoLocation) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.id !== city.id);
      const updated = [city, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("weather_recent_cities", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchCities(trimmed);
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: GeoLocation) => {
    saveToRecent(city);
    onSelectCity(city);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query.trim().length > 0) {
        if (results.length === 0 && !isLoading) {
          // Trigger city not found error
          onErrorTrigger?.("city_not_found");
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      } else {
        onErrorTrigger?.("city_not_found");
      }
    }
  };

  const clearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("weather_recent_cities");
  };

  return (
    <div className="w-full space-y-3" ref={wrapperRef}>
      {/* Search Input Container */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <input
            id="input-city-search"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search by city, region, or capital (e.g. Stockholm, Tokyo, New York)..."
            className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2.5 pl-10 pr-20 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
            autoComplete="off"
            spellCheck="false"
          />

          <div className="absolute right-3 flex items-center gap-1">
            {query && (
              <button
                id="btn-clear-search"
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-100 border border-slate-200 rounded">
              Esc
            </span>
          </div>
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div
            id="dropdown-city-results"
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in duration-150"
          >
            {results.length > 0 ? (
              <div className="max-h-72 overflow-y-auto py-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Locations Found ({results.length})
                </div>
                {results.map((city, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isCurrent = selectedCity?.id === city.id;
                  return (
                    <button
                      key={`${city.id}-${idx}`}
                      type="button"
                      id={`search-item-${city.id}`}
                      onClick={() => handleSelect(city)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors ${
                        isSelected
                          ? "bg-sky-50 text-sky-900"
                          : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin
                          className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? "text-sky-600" : "text-slate-400"
                          }`}
                        />
                        <div>
                          <span className="text-sm font-semibold text-slate-900">
                            {city.name}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            {[city.admin1, city.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {city.country_code && (
                          <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {city.country_code}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : hasSearched && !isLoading ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  No cities found for "{query}"
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try checking spelling or searching for a major capital or province name.
                </p>
                <button
                  id="btn-trigger-city-not-found-error"
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onErrorTrigger?.("city_not_found");
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium underline underline-offset-2"
                >
                  View Error State Screen
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Searches
                  </span>
                  <button
                    onClick={clearRecent}
                    className="text-slate-400 hover:text-slate-600 hover:underline"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((city) => (
                  <button
                    key={`recent-${city.id}`}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-slate-50 text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-800">
                        {city.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {city.country}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {city.country_code}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                Type at least 2 characters to search global locations...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preset Quick-Select Cities Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 text-[11px] font-medium whitespace-nowrap mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Popular:
        </span>
        {PRESET_CITIES.map((city) => {
          const isActive = selectedCity?.name.toLowerCase() === city.name.toLowerCase();
          return (
            <button
              key={city.id}
              id={`preset-city-${city.name.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => handleSelect(city)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-500/20"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
