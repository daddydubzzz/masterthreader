'use client';

import { useState } from 'react';
import { RecursionButtonProps } from '../types';

export function RecursionButton({ visible, onClick, isLoading = false }: RecursionButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!visible) return null;

  const handleClick = async () => {
    setIsProcessing(true);
    try {
      await onClick();
    } finally {
      setIsProcessing(false);
    }
  };

  const showLoading = isLoading || isProcessing;

  return (
    <div className="flex flex-col items-center space-y-4 animate-scale-in">
      {/* Action Prompt */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold gradient-text">
          {showLoading ? 'Improving Your Threads' : 'Ready to Improve'}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-sm">
          {showLoading 
            ? 'AI is analyzing your edits to create better versions of these threads...'
            : 'Get improved versions of your current threads based on the edits you\'ve made.'
          }
        </p>
      </div>

      {/* Enhanced Button */}
      <div className="relative group">
        <button
          onClick={handleClick}
          disabled={showLoading}
          className={`relative px-10 py-5 text-lg font-semibold rounded-3xl transition-all duration-300 transform ${
            showLoading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-2 active:translate-y-0'
          } ${!showLoading ? 'group-hover:scale-105' : ''} min-w-[240px]`}
        >
          {/* Multiple background glow effects */}
          {!showLoading && (
            <>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl opacity-30 blur-xl group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl opacity-50 blur-lg group-hover:opacity-80 transition-opacity duration-300"></div>
            </>
          )}
          
          {/* Button content */}
          <div className="relative flex items-center justify-center gap-4">
            {showLoading ? (
              <>
                <div className="relative">
                  <div className="w-6 h-6 spinner"></div>
                  <div className="absolute inset-0 w-6 h-6 rounded-full bg-gradient-to-r from-white to-purple-200 opacity-30 animate-pulse"></div>
                </div>
                <span className="font-medium">Analyzing patterns...</span>
              </>
            ) : (
              <>
                <div className="relative">
                  <svg className="w-6 h-6 transition-transform duration-500 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div className="absolute -inset-1 rounded-full bg-white opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>
                <span className="font-medium">Improve Current Threads</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </>
            )}
          </div>
        </button>
        
        {/* Success indicators */}
        {!showLoading && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce"></div>
        )}
      </div>

      {/* Helper Text */}
      <div className="text-center max-w-lg mx-auto">
        <p className="text-xs text-gray-500 leading-relaxed">
          {showLoading 
            ? 'Processing your edits to generate better versions of these specific threads.'
            : 'Creates new versions of your current threads that incorporate your feedback.'
          }
        </p>
      </div>
    </div>
  );
} 