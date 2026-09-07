import React from "react";
import { AlertCircle, RefreshCw, X, CheckCircle2, WifiOff, MapPinOff, ServerCrash } from "lucide-react";
import { AppError } from "../types";

interface ErrorStateModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeError: AppError | null;
  onSimulateError: (type: AppError["type"]) => void;
  onClearError: () => void;
  onRetry: () => void;
}

export const ErrorStateModal: React.FC<ErrorStateModalProps> = ({
  isOpen,
  onClose,
  activeError,
  onSimulateError,
  onClearError,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="error-states-qa-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Error State Verification & QA Hub
              </h3>
              <p className="text-xs text-slate-500">
                Confirm and test all application error states and recovery flows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Error Banner */}
        {activeError ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                Active Error: {activeError.title}
              </span>
              <button
                onClick={onClearError}
                className="text-xs text-red-700 font-semibold hover:underline"
              >
                Clear / Restore
              </button>
            </div>
            <p className="text-xs text-red-700">{activeError.message}</p>
            {activeError.suggestion && (
              <p className="text-[11px] text-red-600/90 italic">
                Suggestion: {activeError.suggestion}
              </p>
            )}
            {activeError.details && (
              <pre className="text-[10px] font-mono bg-red-100/70 p-2 rounded text-red-800 overflow-x-auto">
                {activeError.details}
              </pre>
            )}
            {activeError.canRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Execute Retry Action
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>All systems nominal. Select any scenario below to trigger and test that error state.</span>
          </div>
        )}

        {/* Error Simulation Scenarios */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Test Scenarios (User Prompt Requirements)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 1. City not found */}
            <button
              onClick={() => onSimulateError("city_not_found")}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all group"
            >
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 block">
                1. City Not Found
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Simulates invalid search query e.g. "Location 'Oslo' not found"
              </span>
            </button>

            {/* 2. Network timeout */}
            <button
              onClick={() => onSimulateError("network_error")}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all group"
            >
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                2. Network Timeout
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Simulates 504 gateway or offline internet connection
              </span>
            </button>

            {/* 3. API 500 error */}
            <button
              onClick={() => onSimulateError("api_error")}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all group"
            >
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                <ServerCrash className="w-3.5 h-3.5 text-slate-400" />
                3. Weather API (500)
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Simulates upstream meteorological model server error
              </span>
            </button>

            {/* 4. Geolocation denied */}
            <button
              onClick={() => onSimulateError("geo_denied")}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all group"
            >
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                <MapPinOff className="w-3.5 h-3.5 text-slate-400" />
                4. Location Denied
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Simulates browser GPS permission rejected
              </span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={onClearError}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            Reset All Errors
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
