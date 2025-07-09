'use client';

import { RuleReviewProps } from '@/types';
import { RuleCard } from './components/RuleCard';

export function RuleReview({
  suggestedRules,
  onAcceptRule,
  onSkipRule,
  acceptedRules,
  currentVersion
}: RuleReviewProps) {
  const pendingRules = suggestedRules.filter(rule => 
    !acceptedRules.some(accepted => accepted.id === rule.id)
  );

  const hasAnyRules = suggestedRules.length > 0;
  const hasAcceptedRules = acceptedRules.length > 0;
  const hasPendingRules = pendingRules.length > 0;

  if (!hasAnyRules) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          AI Suggested Improvements
        </h3>
        <p className="text-gray-600">
          Based on your edits and feedback, here are some rule improvements for the Mega Prompt.
        </p>
      </div>

      {/* Accepted Rules Section */}
      {hasAcceptedRules && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>✅ Accepted Rules</span>
            <span className="text-sm font-normal text-green-700 bg-green-100 px-2 py-1 rounded-full">
              Added to Mega Prompt {currentVersion}
            </span>
          </h4>
          <div className="space-y-3">
            {acceptedRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onAccept={() => {}}
                onSkip={() => {}}
                isAccepted={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Rules Section */}
      {hasPendingRules && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900">
            🔄 Review Suggestions
          </h4>
          <div className="space-y-3">
            {pendingRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onAccept={() => onAcceptRule(rule)}
                onSkip={() => onSkipRule(rule)}
                isAccepted={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {hasAnyRules && (
        <div className="text-center text-sm text-gray-500">
          {acceptedRules.length} of {suggestedRules.length} suggestions reviewed
          {acceptedRules.length > 0 && (
            <span className="ml-2 text-green-600 font-medium">
              • Mega Prompt evolving to {currentVersion}
            </span>
          )}
        </div>
      )}
    </div>
  );
} 