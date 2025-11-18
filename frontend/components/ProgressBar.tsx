'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  showNumbers?: boolean;
  height?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'green' | 'yellow';
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  label,
  showPercentage = true,
  showNumbers = true,
  height = 'md',
  color = 'blue',
  animated = true
}) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600'
  };

  const glowColors = {
    blue: 'shadow-blue-500',
    purple: 'shadow-purple-500',
    green: 'shadow-green-500',
    yellow: 'shadow-yellow-500'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-blue-400">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700 ${heightClasses[height]}`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[height]} rounded-full transition-all duration-500 ease-out ${
            animated ? 'shadow-lg' : ''
          } ${glowColors[color]}/50`}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
          )}
        </div>
      </div>

      {showNumbers && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">
            {current.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};
