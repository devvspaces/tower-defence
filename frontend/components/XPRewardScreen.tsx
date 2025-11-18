'use client';

import React, { useEffect, useState } from 'react';
import { ProgressBar } from './ProgressBar';

interface XPBreakdown {
  wavesClearedXP: number;
  scoreXP: number;
  milestoneXP: number;
  perfectDefenseXP: number;
  firstWinBonusXP: number;
  difficultyMultiplier: number;
}

interface LevelUpInfo {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  reward?: {
    type: 'tower' | 'upgrade' | 'currency';
    name: string;
    description: string;
  };
}

interface XPRewardScreenProps {
  isOpen: boolean;
  onClose: () => void;
  gameResult: {
    wavesCompleted: number;
    score: number;
    enemiesKilled: number;
    livesRemaining: number;
    maxLives: number;
    difficulty: string;
  };
  xpBreakdown: XPBreakdown;
  totalXPEarned: number;
  levelInfo: {
    currentLevel: number;
    currentXP: number;
    xpForNextLevel: number;
    xpGainedThisGame: number;
  };
  levelUpInfo?: LevelUpInfo;
  onViewProfile?: () => void;
}

export const XPRewardScreen: React.FC<XPRewardScreenProps> = ({
  isOpen,
  onClose,
  gameResult,
  xpBreakdown,
  totalXPEarned,
  levelInfo,
  levelUpInfo,
  onViewProfile
}) => {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Animate XP counting up
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = totalXPEarned / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= totalXPEarned) {
          setAnimatedXP(totalXPEarned);
          clearInterval(timer);

          // Show level up after XP animation completes
          if (levelUpInfo?.leveledUp) {
            setTimeout(() => setShowLevelUp(true), 500);
          }
        } else {
          setAnimatedXP(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isOpen, totalXPEarned, levelUpInfo]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div className="bg-gray-900 bg-opacity-95 border-2 border-purple-500 rounded-lg p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-5xl font-bold text-blue-400 mb-2"
            style={{ textShadow: '0 0 20px rgba(96,165,250,0.6)' }}
          >
            🎉 MISSION COMPLETE!
          </h1>
        </div>

        {/* Game Results */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-bold text-blue-400 mb-3 text-center">FINAL RESULTS</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Waves Survived:</span>
              <span className="text-white font-bold ml-2">{gameResult.wavesCompleted}</span>
            </div>
            <div>
              <span className="text-gray-400">Final Score:</span>
              <span className="text-white font-bold ml-2">{gameResult.score.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Enemies Killed:</span>
              <span className="text-white font-bold ml-2">{gameResult.enemiesKilled}</span>
            </div>
            <div>
              <span className="text-gray-400">Lives Remaining:</span>
              <span className={`font-bold ml-2 ${gameResult.livesRemaining === gameResult.maxLives ? 'text-green-400' : 'text-white'}`}>
                {gameResult.livesRemaining} / {gameResult.maxLives}
                {gameResult.livesRemaining === gameResult.maxLives && ' ⭐ PERFECT!'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Difficulty:</span>
              <span className="text-white font-bold ml-2 capitalize">
                {gameResult.difficulty} ({xpBreakdown.difficultyMultiplier.toFixed(1)}x)
              </span>
            </div>
          </div>
        </div>

        {/* XP Breakdown */}
        <div className="bg-gray-800 border border-purple-500 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-3 text-center">💎 XP BREAKDOWN</h3>
          <div className="space-y-2 text-sm">
            {xpBreakdown.wavesClearedXP > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Waves Cleared ({gameResult.wavesCompleted} waves)</span>
                <span className="text-blue-400 font-bold">+{xpBreakdown.wavesClearedXP} XP</span>
              </div>
            )}
            {xpBreakdown.scoreXP > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Score Bonus ({gameResult.score} / 100)</span>
                <span className="text-blue-400 font-bold">+{xpBreakdown.scoreXP} XP</span>
              </div>
            )}
            {xpBreakdown.milestoneXP > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Wave Milestone Bonus</span>
                <span className="text-purple-400 font-bold">+{xpBreakdown.milestoneXP} XP</span>
              </div>
            )}
            {xpBreakdown.perfectDefenseXP > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Perfect Defense Bonus</span>
                <span className="text-green-400 font-bold">+{xpBreakdown.perfectDefenseXP} XP</span>
              </div>
            )}
            {xpBreakdown.firstWinBonusXP > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">First Win Today Bonus</span>
                <span className="text-yellow-400 font-bold">+{xpBreakdown.firstWinBonusXP} XP 🔥</span>
              </div>
            )}

            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between items-center text-lg">
                <span className="text-white font-bold">TOTAL XP EARNED:</span>
                <span className="text-yellow-400 font-bold text-2xl">
                  +{animatedXP.toLocaleString()} XP ✨
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Up Section */}
        {showLevelUp && levelUpInfo?.leveledUp && (
          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-2 border-yellow-500 rounded-lg p-6 mb-6 animate-pulse">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-yellow-400 mb-3">
                🎊 LEVEL UP! {levelUpInfo.oldLevel} → {levelUpInfo.newLevel}
              </h2>

              <div className="flex justify-center items-center gap-1 mb-4">
                {[...Array(levelUpInfo.newLevel)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>

              {levelUpInfo.reward && (
                <div className="bg-gray-900 bg-opacity-50 border border-yellow-600 rounded-lg p-4 mt-4">
                  <p className="text-yellow-400 font-bold text-lg mb-2">🎁 NEW REWARDS UNLOCKED:</p>
                  <div className="text-left">
                    <p className="text-white font-bold">
                      {levelUpInfo.reward.type === 'tower' && '🏰 NEW TOWER: '}
                      {levelUpInfo.reward.type === 'upgrade' && '⬆️ UPGRADE AVAILABLE: '}
                      {levelUpInfo.reward.type === 'currency' && '💰 BONUS: '}
                      {levelUpInfo.reward.name}
                    </p>
                    <p className="text-gray-300 text-sm mt-1">{levelUpInfo.reward.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar
            current={levelInfo.currentXP}
            max={levelInfo.xpForNextLevel}
            label={`Level ${levelInfo.currentLevel}`}
            showPercentage={true}
            showNumbers={true}
            height="lg"
            color="blue"
            animated={true}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg border border-gray-600 transition-all"
          >
            CONTINUE
          </button>
          {onViewProfile && (
            <button
              onClick={() => {
                onClose();
                onViewProfile();
              }}
              className="flex-1 bg-blue-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg border border-blue-500 transition-all"
            >
              VIEW PROFILE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
