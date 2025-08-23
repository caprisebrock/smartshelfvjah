import React from 'react';
import { X, Lightbulb, Target, Zap } from 'lucide-react';
import { SmartSuggestion } from '../types/smartSuggestions';

interface SmartAssistantBannerProps {
  suggestion: SmartSuggestion;
  onDismiss: () => void;
}

export default function SmartAssistantBanner({ suggestion, onDismiss }: SmartAssistantBannerProps) {
  // Get the appropriate icon and styling based on suggestion type
  const getBannerConfig = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'milestone':
        return {
          icon: Target,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-900 dark:text-blue-100'
        };
      case 'nudge':
        return {
          icon: Zap,
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-800',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          textColor: 'text-emerald-900 dark:text-emerald-100'
        };
      case 'tip':
        return {
          icon: Lightbulb,
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
          textColor: 'text-amber-900 dark:text-amber-100'
        };
      default:
        return {
          icon: Lightbulb,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          textColor: 'text-gray-900 dark:text-gray-100'
        };
    }
  };

  const config = getBannerConfig(suggestion.type);
  const IconComponent = config.icon;

  return (
    <div className={`w-full ${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-6 animate-fade-in`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-sm font-medium ${config.textColor} leading-relaxed`}>
                {suggestion.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                Smart {suggestion.type}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              aria-label="Dismiss suggestion"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
