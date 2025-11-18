'use client';

import React, { useState } from 'react';

interface TowerStats {
  damage: number;
  range: number;
  fireRate: number;
  special?: string;
}

interface UpgradeLevel {
  level: number;
  stats: TowerStats;
  cost: number;
  unlocked: boolean;
}

interface TowerUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tower: {
    id: string;
    name: string;
    type: string;
    description: string;
    icon: string;
    currentLevel: number;
    maxLevel: number;
  };
  upgrades: UpgradeLevel[];
  playerCurrency: number;
  onConfirmUpgrade: (targetLevel: number) => void;
}

export const TowerUpgradeModal: React.FC<TowerUpgradeModalProps> = ({
  isOpen,
  onClose,
  tower,
  upgrades,
  playerCurrency,
  onConfirmUpgrade
}) => {
  const [selectedLevel, setSelectedLevel] = useState(tower.currentLevel + 1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const currentUpgrade = upgrades.find(u => u.level === tower.currentLevel);
  const nextUpgrade = upgrades.find(u => u.level === selectedLevel);
  const isMaxLevel = tower.currentLevel >= tower.maxLevel;

  const canAfford = nextUpgrade ? playerCurrency >= nextUpgrade.cost : false;
  const totalCostToSelectedLevel = upgrades
    .filter(u => u.level > tower.currentLevel && u.level <= selectedLevel)
    .reduce((sum, u) => sum + u.cost, 0);

  const handleUpgradeClick = () => {
    if (canAfford && nextUpgrade) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    onConfirmUpgrade(selectedLevel);
    setShowConfirmation(false);
    onClose();
  };

  const calculateStatChange = (currentVal: number, nextVal: number) => {
    const change = nextVal - currentVal;
    const percentage = ((change / currentVal) * 100).toFixed(0);
    return { change, percentage };
  };

  if (!currentUpgrade || !nextUpgrade) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 bg-opacity-95 border-2 border-purple-500 rounded-lg p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {!showConfirmation ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{tower.icon}</div>
                <div>
                  <h1 className="text-3xl font-bold text-blue-400 mb-1">
                    {tower.name}
                  </h1>
                  <p className="text-gray-400 uppercase text-sm font-bold">{tower.type}</p>
                  <p className="text-sm text-gray-500 mt-1">{tower.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-3xl"
              >
                ✕
              </button>
            </div>

            {/* Current Level Badge */}
            <div className="bg-gray-800 border border-blue-500 rounded-lg p-3 mb-6 text-center">
              <span className="text-blue-400 font-bold">
                Current Level: {tower.currentLevel}
              </span>
              {isMaxLevel && (
                <span className="text-yellow-400 font-bold ml-3">⭐ MAX LEVEL</span>
              )}
            </div>

            {!isMaxLevel && (
              <>
                {/* Level Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Select Target Level</h3>
                  <div className="flex gap-2">
                    {upgrades
                      .filter(u => u.level > tower.currentLevel)
                      .map(upgrade => (
                        <button
                          key={upgrade.level}
                          onClick={() => setSelectedLevel(upgrade.level)}
                          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                            selectedLevel === upgrade.level
                              ? 'bg-blue-600 text-white border-2 border-blue-500'
                              : 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:border-purple-500'
                          }`}
                        >
                          Level {upgrade.level}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Stats Comparison */}
                <div className="bg-gray-800 border border-purple-500 rounded-lg p-4 mb-6">
                  <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">
                    📊 STATS UPGRADE PREVIEW
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Damage */}
                    <StatComparison
                      label="Damage"
                      icon="⚔️"
                      current={currentUpgrade.stats.damage}
                      next={nextUpgrade.stats.damage}
                      color="red"
                    />

                    {/* Range */}
                    <StatComparison
                      label="Range"
                      icon="🎯"
                      current={currentUpgrade.stats.range}
                      next={nextUpgrade.stats.range}
                      color="blue"
                    />

                    {/* Fire Rate */}
                    <StatComparison
                      label="Fire Rate"
                      icon="⚡"
                      current={currentUpgrade.stats.fireRate}
                      next={nextUpgrade.stats.fireRate}
                      color="yellow"
                    />

                    {/* Special Ability */}
                    {(currentUpgrade.stats.special || nextUpgrade.stats.special) && (
                      <div className="bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">✨</span>
                          <span className="text-gray-400 font-bold">Special Ability</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-gray-500">Current</span>
                            <p className="text-sm text-purple-400">
                              {currentUpgrade.stats.special || 'None'}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Upgraded</span>
                            <p className="text-sm text-purple-300 font-bold">
                              {nextUpgrade.stats.special || 'None'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cost Section */}
                <div className="bg-gray-800 border border-yellow-600 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">
                    💰 UPGRADE COST
                  </h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {selectedLevel > tower.currentLevel + 1 ? (
                          <span>Total: {totalCostToSelectedLevel}</span>
                        ) : (
                          <span>{nextUpgrade.cost}</span>
                        )}
                      </div>
                      {selectedLevel > tower.currentLevel + 1 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Upgrading from Level {tower.currentLevel} to {selectedLevel}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Your Balance</div>
                      <div className={`text-xl font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                        {playerCurrency.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {!canAfford && (
                    <div className="mt-3 bg-red-900 border border-red-500 rounded p-2 text-center">
                      <span className="text-red-400 text-sm font-bold">
                        ⚠️ Insufficient funds! Need {(selectedLevel > tower.currentLevel + 1 ? totalCostToSelectedLevel : nextUpgrade.cost) - playerCurrency} more.
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg border border-gray-600 transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleUpgradeClick}
                    disabled={!canAfford}
                    className="flex-1 bg-blue-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg border border-blue-500 transition-all"
                  >
                    ⬆️ UPGRADE TO LEVEL {selectedLevel}
                  </button>
                </div>
              </>
            )}

            {isMaxLevel && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                  Maximum Level Reached!
                </h3>
                <p className="text-gray-400 mb-6">
                  This tower has been upgraded to its maximum potential.
                </p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg border border-blue-500 transition-all"
                >
                  CLOSE
                </button>
              </div>
            )}
          </>
        ) : (
          /* Confirmation Dialog */
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Confirm Upgrade
            </h2>
            <p className="text-gray-300 mb-2">
              Upgrade <span className="text-blue-400 font-bold">{tower.name}</span> from Level{' '}
              <span className="text-white font-bold">{tower.currentLevel}</span> to Level{' '}
              <span className="text-white font-bold">{selectedLevel}</span>?
            </p>
            <p className="text-yellow-400 font-bold text-xl mb-6">
              Cost: 💰 {selectedLevel > tower.currentLevel + 1 ? totalCostToSelectedLevel : nextUpgrade.cost}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg border border-gray-600 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg border border-green-500 transition-all"
              >
                ✓ CONFIRM UPGRADE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for stat comparison
const StatComparison: React.FC<{
  label: string;
  icon: string;
  current: number;
  next: number;
  color: 'red' | 'blue' | 'yellow' | 'green';
}> = ({ label, icon, current, next, color }) => {
  const change = next - current;
  const percentage = ((change / current) * 100).toFixed(0);

  const colorClasses = {
    red: { bar: 'bg-red-500', text: 'text-red-400' },
    blue: { bar: 'bg-blue-500', text: 'text-blue-400' },
    yellow: { bar: 'bg-yellow-500', text: 'text-yellow-400' },
    green: { bar: 'bg-green-500', text: 'text-green-400' }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-white font-bold">{label}</span>
        </div>
        <div className="text-green-400 font-bold">
          +{change} ({percentage > '0' ? '+' : ''}{percentage}%)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs text-gray-500">Current</span>
          <div className="mt-1">
            <div className="text-lg font-bold text-white mb-1">{current}</div>
            <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className={`${colorClasses[color].bar} h-full opacity-50`}
                style={{ width: `${(current / Math.max(current, next)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-500">Upgraded</span>
          <div className="mt-1">
            <div className={`text-lg font-bold ${colorClasses[color].text} mb-1`}>
              {next}
            </div>
            <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className={`${colorClasses[color].bar} h-full`}
                style={{ width: `${(next / Math.max(current, next)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
