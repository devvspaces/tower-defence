'use client';

import React, { useState } from 'react';

export interface GameTower {
  id: string;
  name: string;
  type: string;
  icon: string;
  cost: number;
  unlocked: boolean;
  unlockLevel?: number;
  currentUpgradeLevel: number;
  stats: {
    damage: number;
    range: number;
    fireRate: number;
  };
}

interface TowerSelectionUpdatedProps {
  towers: GameTower[];
  selectedTowerId: string | null;
  onSelectTower: (towerId: string) => void;
  playerCurrency: number;
  playerLevel: number;
  showLockedTowers?: boolean;
}

export const TowerSelectionUpdated: React.FC<TowerSelectionUpdatedProps> = ({
  towers,
  selectedTowerId,
  onSelectTower,
  playerCurrency,
  playerLevel,
  showLockedTowers = true
}) => {
  const [filterType, setFilterType] = useState<'all' | 'affordable' | 'unlocked'>('unlocked');

  const filteredTowers = towers.filter(tower => {
    // Always filter out locked towers if showLockedTowers is false
    if (!showLockedTowers && !tower.unlocked) return false;

    switch (filterType) {
      case 'affordable':
        return tower.unlocked && tower.cost <= playerCurrency;
      case 'unlocked':
        return tower.unlocked;
      case 'all':
      default:
        return true;
    }
  });

  const unlockedTowers = towers.filter(t => t.unlocked);
  const affordableTowers = unlockedTowers.filter(t => t.cost <= playerCurrency);

  const handleTowerClick = (tower: GameTower) => {
    if (tower.unlocked) {
      onSelectTower(tower.id);
    }
  };

  const canAfford = (tower: GameTower) => {
    return tower.cost <= playerCurrency;
  };

  return (
    <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-blue-400 mb-2">🏰 Select Tower</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Available: {unlockedTowers.length}/{towers.length}
          </span>
          <span className="text-yellow-400 font-bold">
            💰 {playerCurrency}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-2 px-3 rounded text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All ({towers.length})
        </button>
        <button
          onClick={() => setFilterType('unlocked')}
          className={`flex-1 py-2 px-3 rounded text-xs font-bold transition-all ${
            filterType === 'unlocked'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Unlocked ({unlockedTowers.length})
        </button>
        <button
          onClick={() => setFilterType('affordable')}
          className={`flex-1 py-2 px-3 rounded text-xs font-bold transition-all ${
            filterType === 'affordable'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Can Buy ({affordableTowers.length})
        </button>
      </div>

      {/* Tower List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {filteredTowers.map((tower) => {
          const isSelected = selectedTowerId === tower.id;
          const isAffordable = canAfford(tower);
          const isLocked = !tower.unlocked;

          return (
            <div
              key={tower.id}
              onClick={() => handleTowerClick(tower)}
              className={`border-2 rounded-lg p-3 transition-all ${
                isLocked
                  ? 'bg-gray-900 border-gray-700 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-blue-900 border-blue-500 cursor-pointer shadow-lg shadow-blue-500/50'
                  : isAffordable
                  ? 'bg-gray-800 border-purple-500 cursor-pointer hover:border-blue-500 hover:shadow-md'
                  : 'bg-gray-800 border-gray-600 cursor-pointer hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Tower Icon */}
                <div className={`text-4xl ${isLocked && 'grayscale'}`}>
                  {tower.icon}
                </div>

                {/* Tower Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white truncate">
                      {tower.name}
                    </h4>
                    {!isLocked && tower.currentUpgradeLevel > 1 && (
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        Lv.{tower.currentUpgradeLevel}
                      </span>
                    )}
                  </div>

                  {/* Cost and Status */}
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <span className="text-yellow-400 text-xs font-bold">
                        🔒 Level {tower.unlockLevel}
                      </span>
                    ) : (
                      <>
                        <span
                          className={`text-xs font-bold ${
                            isAffordable ? 'text-yellow-400' : 'text-red-400'
                          }`}
                        >
                          💰 {tower.cost}
                        </span>
                        {!isAffordable && (
                          <span className="text-red-400 text-xs">
                            (Need {tower.cost - playerCurrency})
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Quick Stats */}
                  {!isLocked && (
                    <div className="flex gap-3 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-red-400">⚔️</span>
                        <span className="text-gray-300">{tower.stats.damage}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-400">🎯</span>
                        <span className="text-gray-300">{tower.stats.range}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⚡</span>
                        <span className="text-gray-300">{tower.stats.fireRate}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selection Indicator */}
                <div className="flex-shrink-0">
                  {isLocked ? (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500">🔒</span>
                    </div>
                  ) : isSelected ? (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                  ) : isAffordable ? (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <span className="text-gray-400">○</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-red-400">✗</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTowers.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔒</div>
          <p className="text-gray-400 text-sm">
            {filterType === 'affordable' && 'No towers you can afford right now'}
            {filterType === 'unlocked' && 'No towers unlocked yet'}
            {filterType === 'all' && 'No towers available'}
          </p>
        </div>
      )}

      {/* Selected Tower Details */}
      {selectedTowerId && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          {(() => {
            const selectedTower = towers.find(t => t.id === selectedTowerId);
            if (!selectedTower || !selectedTower.unlocked) return null;

            return (
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{selectedTower.icon}</div>
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {selectedTower.name}
                    </h4>
                    <span className="text-xs text-gray-400 uppercase">
                      {selectedTower.type}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900 rounded p-2 mb-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-red-400 font-bold">⚔️ {selectedTower.stats.damage}</div>
                      <div className="text-gray-500">Damage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">🎯 {selectedTower.stats.range}</div>
                      <div className="text-gray-500">Range</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold">⚡ {selectedTower.stats.fireRate}</div>
                      <div className="text-gray-500">Speed</div>
                    </div>
                  </div>
                </div>

                {canAfford(selectedTower) ? (
                  <div className="bg-green-900 border border-green-500 rounded p-2 text-center">
                    <span className="text-green-400 font-bold text-sm">
                      ✓ Ready to build
                    </span>
                  </div>
                ) : (
                  <div className="bg-red-900 border border-red-500 rounded p-2 text-center">
                    <span className="text-red-400 font-bold text-sm">
                      Need {selectedTower.cost - playerCurrency} more currency
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
