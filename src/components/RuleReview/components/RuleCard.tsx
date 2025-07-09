'use client';

import { RuleCardProps } from '@/types';

export function RuleCard({ rule, onAccept, onSkip, isAccepted = false }: RuleCardProps) {
  if (isAccepted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-green-900 font-medium mb-1">
              {rule.content}
            </p>
            <div className="flex items-center space-x-2 text-xs text-green-700">
              <span className="font-medium">{rule.category}</span>
              <span>•</span>
              <span>✅ Added to Mega Prompt</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <p className="text-sm text-gray-900 font-medium mb-1">
            {rule.content}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span className="font-medium">{rule.category}</span>
            <span>•</span>
            <span>Suggested improvement</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onAccept}
            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1"
          >
            <span>✅</span>
            <span>Accept</span>
          </button>
          <button
            onClick={onSkip}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-1"
          >
            <span>❌</span>
            <span>Skip</span>
          </button>
        </div>
      </div>
    </div>
  );
} 