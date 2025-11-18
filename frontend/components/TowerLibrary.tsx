'use client';

import React, { useState } from 'react';

export interface TowerDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  unlocked: boolean;
  unlockLevel: number;
  currentUpgradeLevel: number;
  maxUpgradeLevel: number;
  icon: string;
  baseStats: {
    damage: number;
    range: number;
    fireRate: number;
    cost: number;
  };
  currentStats?: {
    damage: number;
    range: number;
    fireRate: number;
  };
}

interface TowerLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  towers: TowerDefinition[];
  currentPlayerLevel: number;
  onUpgradeTower?: (towerId: string) => void;
  onViewDetails?: (tower: TowerDefinition) => void;
}

type FilterType = 'all' | 'unlocked' | 'locked';

export const TowerLibrary: React.FC<TowerLibraryProps> = ({
  isOpen,
  onClose,
  towers,
  currentPlayerLevel,
  onUpgradeTower,
  onViewDetails
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTower, setSelectedTower] = useState<TowerDefinition | null>(null);

  if (!isOpen) return null;

  const filteredTowers = towers.filter(tower => {
    if (filter === 'unlocked') return tower.unlocked;
    if (filter === 'locked') return !tower.unlocked;
    return true;
  });

  const unlockedCount = towers.filter(t => t.unlocked).length;

  const handleTowerClick = (tower: TowerDefinition) => {
    setSelectedTower(tower);
    if (onViewDetails) {
      onViewDetails(tower);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 bg-opacity-95 border-2 border-purple-500 rounded-lg p-6 max-w-6xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-blue-400 mb-2">
              🏰 Tower Library
            </h1>
            <p className="text-gray-400">
              Collected: {unlockedCount}/{towers.length} towers
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white border-2 border-blue-500'
                : 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:border-purple-500'
            }`}
          >
            All Towers ({towers.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              filter === 'unlocked'
                ? 'bg-blue-600 text-white border-2 border-blue-500'
                : 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:border-purple-500'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              filter === 'locked'
                ? 'bg-blue-600 text-white border-2 border-blue-500'
                : 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:border-purple-500'
            }`}
          >
            Locked ({towers.length - unlockedCount})
          </button>
        </div>

        {/* Tower Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredTowers.map((tower) => (
            <div
              key={tower.id}
              onClick={() => handleTowerClick(tower)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                tower.unlocked
                  ? 'bg-gray-800 border-purple-500 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/50'
                  : 'bg-gray-900 border-gray-700 opacity-60 hover:opacity-80'
              } ${selectedTower?.id === tower.id ? 'ring-2 ring-yellow-400' : ''}`}
            >
              {/* Tower Icon and Name */}
              <div className="text-center mb-3">
                <div className={`text-6xl mb-2 ${!tower.unlocked && 'grayscale'}`}>
                  {tower.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{tower.name}</h3>
                <span className="text-xs text-gray-400 uppercase">{tower.type}</span>
              </div>

              {/* Status Badge */}
              {tower.unlocked ? (
                <div className="bg-green-900 border border-green-500 rounded-lg p-2 mb-3 text-center">
                  <span className="text-green-400 font-bold text-sm">✓ UNLOCKED</span>
                </div>
              ) : (
                <div className="bg-gray-800 border border-yellow-600 rounded-lg p-2 mb-3 text-center">
                  <span className="text-yellow-400 font-bold text-sm">
                    🔒 Level {tower.unlockLevel} Required
                  </span>
                  {currentPlayerLevel < tower.unlockLevel && (
                    <div className="text-xs text-gray-400 mt-1">
                      ({tower.unlockLevel - currentPlayerLevel} levels to go)
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {tower.description}
              </p>

              {/* Base Stats */}
              <div className="bg-gray-900 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Damage:</span>
                    <span className="text-white font-bold ml-1">
                      {tower.currentStats?.damage || tower.baseStats.damage}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Range:</span>
                    <span className="text-white font-bold ml-1">
                      {tower.currentStats?.range || tower.baseStats.range}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fire Rate:</span>
                    <span className="text-white font-bold ml-1">
                      {tower.currentStats?.fireRate || tower.baseStats.fireRate}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-yellow-400 font-bold ml-1">
                      {tower.baseStats.cost}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upgrade Progress */}
              {tower.unlocked && (
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Upgrade Level</span>
                    <span className="text-blue-400 font-bold">
                      {tower.currentUpgradeLevel}/{tower.maxUpgradeLevel}
                    </span>
                  </div>
                  <div className="bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all"
                      style={{
                        width: `${(tower.currentUpgradeLevel / tower.maxUpgradeLevel) * 100}%`
                      }}
                    />
                  </div>
                  {tower.currentUpgradeLevel < tower.maxUpgradeLevel && onUpgradeTower && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpgradeTower(tower.id);
                      }}
                      className="w-full bg-blue-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded text-sm transition-all"
                    >
                      ⬆️ UPGRADE
                    </button>
                  )}
                  {tower.currentUpgradeLevel === tower.maxUpgradeLevel && (
                    <div className="text-center text-yellow-400 font-bold text-sm">
                      ⭐ MAX LEVEL
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTowers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-gray-400 text-lg">
              {filter === 'unlocked' && 'No towers unlocked yet. Keep playing to unlock towers!'}
              {filter === 'locked' && 'All towers unlocked! Great job!'}
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg border border-gray-600 transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
