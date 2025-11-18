'use client';

import React, { useState } from 'react';
import { ProgressBar } from './ProgressBar';

export interface Reward {
  level: number;
  type: 'tower' | 'upgrade' | 'currency' | 'bonus' | 'achievement';
  name: string;
  description: string;
  icon?: string;
  unlocked: boolean;
}

interface UpcomingRewardsProps {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  rewards: Reward[];
  maxRewardsToShow?: number;
  compact?: boolean;
}

export const UpcomingRewards: React.FC<UpcomingRewardsProps> = ({
  currentLevel,
  currentXP,
  xpForNextLevel,
  rewards,
  maxRewardsToShow = 5,
  compact = false
}) => {
  const [showAll, setShowAll] = useState(false);

  // Filter to show only upcoming rewards (not yet unlocked)
  const upcomingRewards = rewards
    .filter(r => !r.unlocked && r.level > currentLevel)
    .sort((a, b) => a.level - b.level);

  const displayedRewards = showAll
    ? upcomingRewards
    : upcomingRewards.slice(0, maxRewardsToShow);

  const getRewardIcon = (reward: Reward) => {
    if (reward.icon) return reward.icon;

    switch (reward.type) {
      case 'tower':
        return '🏰';
      case 'upgrade':
        return '⬆️';
      case 'currency':
        return '💰';
      case 'achievement':
        return '🏆';
      case 'bonus':
        return '🎁';
      default:
        return '⭐';
    }
  };

  const getRewardColor = (reward: Reward) => {
    switch (reward.type) {
      case 'tower':
        return 'border-purple-500 bg-purple-900';
      case 'upgrade':
        return 'border-blue-500 bg-blue-900';
      case 'currency':
        return 'border-yellow-500 bg-yellow-900';
      case 'achievement':
        return 'border-green-500 bg-green-900';
      case 'bonus':
        return 'border-pink-500 bg-pink-900';
      default:
        return 'border-gray-500 bg-gray-900';
    }
  };

  const levelsToReward = (rewardLevel: number) => {
    return rewardLevel - currentLevel;
  };

  if (compact) {
    // Compact version for sidebar or small panels
    return (
      <div className="bg-gray-800 border border-purple-500 rounded-lg p-3">
        <h3 className="text-sm font-bold text-blue-400 mb-2">🎁 Next Rewards</h3>
        <div className="space-y-2">
          {displayedRewards.slice(0, 3).map((reward) => (
            <div
              key={`${reward.level}-${reward.name}`}
              className="bg-gray-900 border border-gray-700 rounded p-2 flex items-center gap-2"
            >
              <div className="text-2xl">{getRewardIcon(reward)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-blue-400 font-bold">
                  Level {reward.level}
                </div>
                <div className="text-xs text-white truncate">{reward.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-gray-800 border border-purple-500 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-400">🎁 Upcoming Rewards</h3>
        <div className="text-sm text-gray-400">
          Level {currentLevel}
        </div>
      </div>

      {/* Current Progress */}
      <div className="mb-4 bg-gray-900 rounded-lg p-3">
        <ProgressBar
          current={currentXP}
          max={xpForNextLevel}
          label={`Progress to Level ${currentLevel + 1}`}
          showPercentage={true}
          showNumbers={true}
          height="md"
          color="blue"
          animated={true}
        />
      </div>

      {/* Rewards List */}
      {upcomingRewards.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-gray-400">You've unlocked all available rewards!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {displayedRewards.map((reward) => {
              const levelsAway = levelsToReward(reward.level);
              const isNextLevel = reward.level === currentLevel + 1;

              return (
                <div
                  key={`${reward.level}-${reward.name}`}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isNextLevel
                      ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-blue-500 shadow-lg shadow-blue-500/30'
                      : `${getRewardColor(reward)} border-opacity-50`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="bg-gray-900 rounded-full w-16 h-16 flex items-center justify-center text-4xl flex-shrink-0">
                      {getRewardIcon(reward)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isNextLevel
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-gray-800 text-blue-400'
                        }`}>
                          {isNextLevel ? '📍 NEXT' : `Level ${reward.level}`}
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-bold">
                          {reward.type}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">
                        {reward.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {reward.description}
                      </p>
                    </div>

                    {/* Levels Away Badge */}
                    <div className="text-center flex-shrink-0">
                      {isNextLevel ? (
                        <div className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-sm">
                          Almost There!
                        </div>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-yellow-400">
                            {levelsAway}
                          </div>
                          <div className="text-xs text-gray-400">
                            level{levelsAway !== 1 ? 's' : ''} away
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More/Less Button */}
          {upcomingRewards.length > maxRewardsToShow && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg border border-gray-600 transition-all"
            >
              {showAll ? '▲ Show Less' : `▼ Show All (${upcomingRewards.length - maxRewardsToShow} more)`}
            </button>
          )}
        </>
      )}
    </div>
  );
};
