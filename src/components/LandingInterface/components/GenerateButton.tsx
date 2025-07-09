'use client';

import { GenerateButtonProps } from '../types';

export function GenerateButton({
  onClick,
  isLoading = false,
  disabled = false
}: GenerateButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`relative px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 transform ${
          isDisabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0'
        } ${!isDisabled ? 'group-hover:scale-105' : ''} min-w-[200px]`}
      >
        {/* Background glow effect */}
        {!isDisabled && (
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-300"></div>
        )}
        
        {/* Button content */}
        <div className="relative flex items-center justify-center gap-3">
          {isLoading ? (
            <>
              <div className="relative">
                <div className="w-5 h-5 spinner"></div>
                <div className="absolute inset-0 w-5 h-5 rounded-full bg-gradient-to-r from-white to-blue-200 opacity-30 animate-pulse"></div>
              </div>
              <span className="font-medium">Generating Threads...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">Generate Threads</span>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            </>
          )}
        </div>
      </button>
      
      {/* Success indicator */}
      {!isDisabled && !isLoading && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
      )}
    </div>
  );
} 