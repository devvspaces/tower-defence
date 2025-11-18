'use client';

import React from 'react';

export interface TowerCardData {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockLevel?: number;
  currentUpgradeLevel?: number;
  maxUpgradeLevel?: number;
  cost: number;
  stats: {
    damage: number;
    range: number;
    fireRate: number;
    special?: string;
  };
  upgradeCost?: number;
}

interface TowerCardProps {
  tower: TowerCardData;
  onClick?: () => void;
  onUpgrade?: () => void;
  onSelect?: () => void;
  showUpgradeButton?: boolean;
  showSelectButton?: boolean;
  compact?: boolean;
  selected?: boolean;
  disabled?: boolean;
  playerLevel?: number;
}

export const TowerCard: React.FC<TowerCardProps> = ({
  tower,
  onClick,
  onUpgrade,
  onSelect,
  showUpgradeButton = false,
  showSelectButton = false,
  compact = false,
  selected = false,
  disabled = false,
  playerLevel
}) => {
  const isLocked = !tower.unlocked;
  const canUpgrade = tower.currentUpgradeLevel !== undefined &&
                     tower.maxUpgradeLevel !== undefined &&
                     tower.currentUpgradeLevel < tower.maxUpgradeLevel;
  const isMaxLevel = tower.currentUpgradeLevel === tower.maxUpgradeLevel;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpgrade && !disabled) {
      onUpgrade();
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect && !disabled) {
      onSelect();
    }
  };

  if (compact) {
    // Compact version for in-game selection panel
    return (
      <div
        onClick={handleClick}
        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
          disabled || isLocked
            ? 'bg-gray-900 border-gray-700 opacity-50 cursor-not-allowed'
            : selected
            ? 'bg-blue-900 border-blue-500 shadow-lg shadow-blue-500/50'
            : 'bg-gray-800 border-purple-500 hover:border-blue-500 hover:shadow-lg hover:shadow-purple-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`text-4xl ${isLocked && 'grayscale'}`}>
            {tower.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{tower.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-400 text-xs font-bold">💰 {tower.cost}</span>
              {tower.currentUpgradeLevel !== undefined && (
                <span className="text-blue-400 text-xs">
                  Lv.{tower.currentUpgradeLevel}
                </span>
              )}
            </div>
          </div>

          {/* Lock/Select Indicator */}
          {isLocked ? (
            <div className="text-yellow-400 text-xl">🔒</div>
          ) : selected ? (
            <div className="text-green-400 text-xl">✓</div>
          ) : null}
        </div>
      </div>
    );
  }

  // Full version for library/details
  return (
    <div
      onClick={handleClick}
      className={`border-2 rounded-lg p-4 transition-all ${
        disabled || isLocked
          ? 'bg-gray-900 border-gray-700 opacity-60'
          : 'bg-gray-800 border-purple-500 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/50 cursor-pointer'
      } ${selected ? 'ring-2 ring-yellow-400' : ''}`}
    >
      {/* Header */}
      <div className="text-center mb-3">
        <div className={`text-6xl mb-2 ${isLocked && 'grayscale'}`}>
          {tower.icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{tower.name}</h3>
        <span className="text-xs text-gray-400 uppercase font-bold">{tower.type}</span>
      </div>

      {/* Status Badge */}
      {isLocked && tower.unlockLevel !== undefined ? (
        <div className="bg-gray-800 border border-yellow-600 rounded-lg p-2 mb-3 text-center">
          <span className="text-yellow-400 font-bold text-sm">
            🔒 Level {tower.unlockLevel} Required
          </span>
          {playerLevel !== undefined && playerLevel < tower.unlockLevel && (
            <div className="text-xs text-gray-400 mt-1">
              ({tower.unlockLevel - playerLevel} levels to go)
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-900 border border-green-500 rounded-lg p-2 mb-3 text-center">
          <span className="text-green-400 font-bold text-sm">✓ UNLOCKED</span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-gray-400 mb-3 text-center">
        {tower.description}
      </p>

      {/* Stats */}
      <div className="bg-gray-900 rounded-lg p-3 mb-3">
        <h4 className="text-xs text-gray-400 uppercase font-bold mb-2 text-center">
          Tower Stats
        </h4>
        <div className="space-y-2">
          <StatBar label="Damage" value={tower.stats.damage} max={100} color="red" />
          <StatBar label="Range" value={tower.stats.range} max={100} color="blue" />
          <StatBar label="Fire Rate" value={tower.stats.fireRate} max={100} color="green" />
        </div>
        {tower.stats.special && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className="text-xs text-purple-400">⚡ {tower.stats.special}</span>
          </div>
        )}
      </div>

      {/* Cost */}
      <div className="bg-gray-900 rounded-lg p-2 mb-3 text-center">
        <span className="text-gray-400 text-xs">Build Cost: </span>
        <span className="text-yellow-400 font-bold">💰 {tower.cost}</span>
      </div>

      {/* Upgrade Info */}
      {!isLocked && tower.currentUpgradeLevel !== undefined && tower.maxUpgradeLevel !== undefined && (
        <div className="bg-gray-900 rounded-lg p-3 mb-3">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Upgrade Level</span>
            <span className="text-blue-400 font-bold">
              {tower.currentUpgradeLevel}/{tower.maxUpgradeLevel}
            </span>
          </div>
          <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all"
              style={{
                width: `${(tower.currentUpgradeLevel / tower.maxUpgradeLevel) * 100}%`
              }}
            />
          </div>
          {isMaxLevel && (
            <div className="text-center text-yellow-400 font-bold text-sm mt-2">
              ⭐ MAX LEVEL
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {showSelectButton && !isLocked && (
          <button
            onClick={handleSelect}
            disabled={disabled}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-all"
          >
            {selected ? '✓ SELECTED' : 'SELECT'}
          </button>
        )}
        {showUpgradeButton && !isLocked && canUpgrade && (
          <button
            onClick={handleUpgrade}
            disabled={disabled}
            className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-all"
          >
            ⬆️ UPGRADE
            {tower.upgradeCost && (
              <span className="ml-1 text-yellow-400">💰{tower.upgradeCost}</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Helper component for stat bars
const StatBar: React.FC<{
  label: string;
  value: number;
  max: number;
  color: 'red' | 'blue' | 'green' | 'yellow';
}> = ({ label, value, max, color }) => {
  const percentage = Math.min(100, (value / max) * 100);

  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      <div className="bg-gray-700 h-1.5 rounded-full overflow-hidden">
        <div
          className={`${colorClasses[color]} h-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
