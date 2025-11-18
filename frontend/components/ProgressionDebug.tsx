'use client';

import React from 'react';
import { useProgression } from '@/contexts/ProgressionContext';

export const ProgressionDebug: React.FC = () => {
  const { progression, towers, loading, error } = useProgression();

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-green-500 max-w-sm">
        <div className="text-green-400 font-bold mb-2">⏳ Progression Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-red-500 max-w-sm">
        <div className="text-red-400 font-bold mb-2">❌ Progression Error</div>
        <div className="text-xs text-gray-400">{error}</div>
      </div>
    );
  }

  if (!progression) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-yellow-500 max-w-sm">
        <div className="text-yellow-400 font-bold mb-2">⚠️ No Progression Data</div>
        <div className="text-xs text-gray-400">Please sign in to load progression</div>
      </div>
    );
  }

  const unlockedTowers = towers.filter(t => t.unlocked);

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-purple-500 max-w-sm">
      <div className="text-purple-400 font-bold mb-2">✅ Progression Loaded</div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Level:</span>
          <span className="text-blue-400 font-bold">{progression.level}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">XP:</span>
          <span className="text-blue-400">{progression.xp} / {progression.xpForNextLevel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Games Played:</span>
          <span className="text-blue-400">{progression.totalGamesPlayed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Enemies Killed:</span>
          <span className="text-blue-400">{progression.totalEnemiesKilled}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Highest Wave:</span>
          <span className="text-blue-400">{progression.highestWaveReached}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Unlocked Towers:</span>
          <span className="text-green-400 font-bold">{unlockedTowers.length} / {towers.length}</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-500">Debug: Progression system active</div>
      </div>
    </div>
  );
};
