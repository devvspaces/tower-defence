import { Injectable } from '@nestjs/common';

export interface GameResult {
  wavesCompleted: number;
  score: number;
  lives: number;
  maxLives: number;
  difficulty?: 'easy' | 'normal' | 'hard' | 'extreme' | 'nightmare';
  isFirstWinToday?: boolean;
  enemiesKilled?: number;
}

export interface XPBreakdown {
  baseXP: number;
  waveBonus: number;
  scoreBonus: number;
  perfectDefenseBonus: number;
  milestoneBonus: number;
  difficultyMultiplier: number;
  firstWinBonus: number;
  totalXP: number;
  breakdown: Array<{
    source: string;
    amount: number;
    description: string;
  }>;
}

@Injectable()
export class XPCalculationService {
  /**
   * Calculate XP reward for a completed game
   */
  calculateXP(gameResult: GameResult): XPBreakdown {
    let baseXP = 0;
    const breakdown: Array<{ source: string; amount: number; description: string }> = [];

    // 1. Base XP from waves (50 XP per wave)
    const waveXP = gameResult.wavesCompleted * 50;
    baseXP += waveXP;
    breakdown.push({
      source: 'waves',
      amount: waveXP,
      description: `${gameResult.wavesCompleted} waves completed`,
    });

    // 2. Wave milestone bonuses
    let milestoneBonus = 0;
    if (gameResult.wavesCompleted >= 10) {
      milestoneBonus += 500;
      breakdown.push({
        source: 'milestone',
        amount: 500,
        description: 'Wave 10 milestone',
      });
    }
    if (gameResult.wavesCompleted >= 20) {
      milestoneBonus += 1000;
      breakdown.push({
        source: 'milestone',
        amount: 1000,
        description: 'Wave 20 milestone',
      });
    }
    if (gameResult.wavesCompleted >= 30) {
      milestoneBonus += 2000;
      breakdown.push({
        source: 'milestone',
        amount: 2000,
        description: 'Wave 30 milestone',
      });
    }
    baseXP += milestoneBonus;

    // 3. Score bonus (1 XP per 100 score)
    const scoreBonus = Math.floor(gameResult.score / 100);
    baseXP += scoreBonus;
    breakdown.push({
      source: 'score',
      amount: scoreBonus,
      description: `Score: ${gameResult.score}`,
    });

    // 4. Perfect defense bonus (no lives lost)
    let perfectDefenseBonus = 0;
    if (gameResult.lives === gameResult.maxLives) {
      perfectDefenseBonus = gameResult.wavesCompleted * 20;
      baseXP += perfectDefenseBonus;
      breakdown.push({
        source: 'perfect_defense',
        amount: perfectDefenseBonus,
        description: 'Perfect defense - no lives lost',
      });
    }

    // 5. Apply difficulty multiplier
    const difficultyMultipliers: Record<string, number> = {
      easy: 0.5,
      normal: 1.0,
      hard: 1.5,
      extreme: 2.0,
      nightmare: 3.0,
    };
    const difficulty = gameResult.difficulty || 'normal';
    const multiplier = difficultyMultipliers[difficulty];

    const preMultiplierXP = baseXP;
    baseXP = Math.floor(baseXP * multiplier);

    if (multiplier !== 1.0) {
      breakdown.push({
        source: 'difficulty_multiplier',
        amount: baseXP - preMultiplierXP,
        description: `${difficulty} difficulty (${multiplier}x)`,
      });
    }

    // 6. First win of the day bonus
    let firstWinBonus = 0;
    if (gameResult.isFirstWinToday) {
      const bonusAmount = Math.floor(baseXP * 0.5);
      firstWinBonus = bonusAmount;
      baseXP += bonusAmount;
      breakdown.push({
        source: 'first_win',
        amount: bonusAmount,
        description: 'First win of the day bonus (1.5x)',
      });
    }

    return {
      baseXP: preMultiplierXP,
      waveBonus: waveXP + milestoneBonus,
      scoreBonus,
      perfectDefenseBonus,
      milestoneBonus,
      difficultyMultiplier: multiplier,
      firstWinBonus,
      totalXP: baseXP,
      breakdown,
    };
  }

  /**
   * Calculate XP required for a specific level
   */
  calculateXPForLevel(level: number): number {
    if (level <= 1) return 0;

    if (level <= 10) {
      // Fast early levels: 100 * 1.5^(level-1)
      return Math.floor(100 * Math.pow(1.5, level - 1));
    } else if (level <= 30) {
      // Moderate mid levels: 1000 * 1.3^(level-10)
      return Math.floor(1000 * Math.pow(1.3, level - 10));
    } else if (level <= 50) {
      // Slower late levels: 10000 * 1.2^(level-30)
      return Math.floor(10000 * Math.pow(1.2, level - 30));
    } else {
      // Cap at level 50
      return Math.floor(10000 * Math.pow(1.2, 20));
    }
  }

  /**
   * Calculate what level a user should be at for given XP
   */
  calculateLevelFromXP(currentXP: number): {
    level: number;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    progressToNextLevel: number;
  } {
    let level = 1;
    let totalXPRequired = 0;

    // Find the appropriate level
    while (level <= 50) {
      const xpForNextLevel = this.calculateXPForLevel(level + 1);
      if (totalXPRequired + xpForNextLevel > currentXP) {
        break;
      }
      totalXPRequired += xpForNextLevel;
      level++;
    }

    const xpForCurrentLevel = currentXP - totalXPRequired;
    const xpForNextLevel = this.calculateXPForLevel(level + 1);
    const progressToNextLevel = xpForNextLevel > 0
      ? xpForCurrentLevel / xpForNextLevel
      : 1;

    return {
      level,
      xpForCurrentLevel,
      xpForNextLevel,
      progressToNextLevel,
    };
  }

  /**
   * Check if user will level up with additional XP
   */
  willLevelUp(currentXP: number, additionalXP: number, currentLevel: number): {
    willLevelUp: boolean;
    newLevel: number;
    levelsGained: number;
  } {
    const newXP = currentXP + additionalXP;
    const newLevelData = this.calculateLevelFromXP(newXP);

    return {
      willLevelUp: newLevelData.level > currentLevel,
      newLevel: newLevelData.level,
      levelsGained: newLevelData.level - currentLevel,
    };
  }
}
