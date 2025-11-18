'use client';

import React, { useState } from 'react';
import { ProgressBar } from './ProgressBar';

interface CareerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalWavesCompleted: number;
  highestWaveReached: number;
  totalEnemiesKilled: number;
  totalTowersPlaced: number;
  totalScore: number;
  highestScore: number;
  favoriteMode?: string;
  totalPlaytime?: number; // in minutes
}

interface TowerInfo {
  id: string;
  name: string;
  type: string;
  unlocked: boolean;
  currentLevel: number;
  maxLevel: number;
  unlockLevel: number;
  icon: string;
}

interface UpcomingReward {
  level: number;
  type: 'tower' | 'upgrade' | 'currency' | 'bonus';
  name: string;
  description: string;
  icon?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  icon: string;
}

interface ProfileScreenProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: {
    username: string;
    currentLevel: number;
    currentXP: number;
    xpForNextLevel: number;
    totalXP: number;
  };
  stats: CareerStats;
  towers?: TowerInfo[];
  upcomingRewards?: UpcomingReward[];
  achievements?: Achievement[];
}

type TabType = 'stats' | 'towers' | 'achievements' | 'rewards';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  isOpen,
  onClose,
  userInfo,
  stats,
  towers = [],
  upcomingRewards = [],
  achievements = []
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
    : '0.0';

  const avgWavesPerGame = stats.gamesPlayed > 0
    ? (stats.totalWavesCompleted / stats.gamesPlayed).toFixed(1)
    : '0.0';

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'stats', label: 'Statistics', icon: '📊' },
    { key: 'towers', label: 'Towers', icon: '🏰' },
    { key: 'achievements', label: 'Achievements', icon: '🏆' },
    { key: 'rewards', label: 'Rewards', icon: '🎁' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 bg-opacity-95 border-2 border-purple-500 rounded-lg p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-400 mb-1">
                {userInfo.username}
              </h1>
              <p className="text-gray-400">Tower Defense Commander</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Level and XP */}
          <div className="bg-gray-800 border border-purple-500 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold text-yellow-400">
                Level {userInfo.currentLevel}
              </span>
              <span className="text-sm text-gray-400">
                Total XP: {userInfo.totalXP.toLocaleString()}
              </span>
            </div>
            <ProgressBar
              current={userInfo.currentXP}
              max={userInfo.xpForNextLevel}
              label={`Progress to Level ${userInfo.currentLevel + 1}`}
              showPercentage={true}
              showNumbers={true}
              height="lg"
              color="blue"
              animated={true}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-4 font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white border-t-2 border-x-2 border-blue-500 rounded-t-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white rounded-t-lg'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Career Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Games Played" value={stats.gamesPlayed.toLocaleString()} icon="🎮" />
                  <StatCard label="Games Won" value={stats.gamesWon.toLocaleString()} icon="🏆" />
                  <StatCard label="Win Rate" value={`${winRate}%`} icon="📈" />
                  <StatCard label="Avg Waves/Game" value={avgWavesPerGame} icon="🌊" />
                  <StatCard label="Total Waves" value={stats.totalWavesCompleted.toLocaleString()} icon="✅" />
                  <StatCard label="Highest Wave" value={stats.highestWaveReached.toString()} icon="⭐" />
                  <StatCard label="Enemies Killed" value={stats.totalEnemiesKilled.toLocaleString()} icon="💀" />
                  <StatCard label="Towers Placed" value={stats.totalTowersPlaced.toLocaleString()} icon="🏰" />
                  <StatCard label="Total Score" value={stats.totalScore.toLocaleString()} icon="🎯" />
                  <StatCard label="Highest Score" value={stats.highestScore.toLocaleString()} icon="🌟" />
                </div>
              </div>
            </div>
          )}

          {/* Towers Tab */}
          {activeTab === 'towers' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-blue-400">
                  Tower Collection ({towers.filter(t => t.unlocked).length}/{towers.length})
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {towers.map((tower) => (
                  <div
                    key={tower.id}
                    className={`border rounded-lg p-4 ${
                      tower.unlocked
                        ? 'bg-gray-800 border-purple-500'
                        : 'bg-gray-900 border-gray-700 opacity-50'
                    }`}
                  >
                    <div className="text-center mb-2">
                      <span className="text-4xl">{tower.icon}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white text-center mb-1">
                      {tower.name}
                    </h4>
                    <p className="text-xs text-gray-400 text-center mb-2">{tower.type}</p>
                    {tower.unlocked ? (
                      <div className="bg-gray-900 rounded p-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Upgrade Level</span>
                          <span className="text-blue-400 font-bold">
                            {tower.currentLevel}/{tower.maxLevel}
                          </span>
                        </div>
                        <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full"
                            style={{ width: `${(tower.currentLevel / tower.maxLevel) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-yellow-400 text-sm font-bold">
                          🔒 Unlocks at Level {tower.unlockLevel}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-blue-400">
                  Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
                </h3>
              </div>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border rounded-lg p-4 flex items-center gap-4 ${
                      achievement.unlocked
                        ? 'bg-gray-800 border-yellow-500'
                        : 'bg-gray-900 border-gray-700 opacity-70'
                    }`}
                  >
                    <div className="text-5xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1">
                        {achievement.name}
                        {achievement.unlocked && <span className="text-yellow-400 ml-2">✓</span>}
                      </h4>
                      <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                      {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-blue-400">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-full"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">Upcoming Rewards</h3>
              <div className="space-y-3">
                {upcomingRewards.map((reward) => (
                  <div
                    key={reward.level}
                    className="bg-gray-800 border border-purple-500 rounded-lg p-4 flex items-center gap-4"
                  >
                    <div className="bg-gray-900 rounded-full w-16 h-16 flex items-center justify-center text-3xl">
                      {reward.icon || (
                        <>
                          {reward.type === 'tower' && '🏰'}
                          {reward.type === 'upgrade' && '⬆️'}
                          {reward.type === 'currency' && '💰'}
                          {reward.type === 'bonus' && '🎁'}
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Level {reward.level}
                        </span>
                        <h4 className="text-lg font-bold text-white">{reward.name}</h4>
                      </div>
                      <p className="text-sm text-gray-400">{reward.description}</p>
                    </div>
                    {userInfo.currentLevel >= reward.level ? (
                      <div className="text-green-400 text-2xl">✓</div>
                    ) : (
                      <div className="text-gray-500 text-2xl">🔒</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg border border-blue-500 transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for stat cards
const StatCard: React.FC<{ label: string; value: string; icon: string }> = ({
  label,
  value,
  icon
}) => (
  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xl">{icon}</span>
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);
