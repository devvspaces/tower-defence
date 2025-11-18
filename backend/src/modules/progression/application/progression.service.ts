import { Inject, Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../shared/database/schema';
import { XPCalculationService, GameResult } from './xp-calculation.service';

export interface UserProgression {
  userId: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  progressPercentage: number;
  unlockedTowers: string[];
  towerUpgrades: Record<string, number>;
}

export interface LevelUpReward {
  type: 'tower_unlock' | 'upgrade_unlock' | 'bonus_xp' | 'achievement';
  value: string;
  level: number;
}

@Injectable()
export class ProgressionService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private xpCalculationService: XPCalculationService,
  ) {}

  /**
   * Award XP to a user and handle level-ups
   */
  async awardXP(
    userId: string,
    gameResult: GameResult,
    gameId?: string,
  ): Promise<{
    xpAwarded: number;
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    newUnlocks: LevelUpReward[];
    breakdown: any;
  }> {
    // Calculate XP earned
    const xpData = this.xpCalculationService.calculateXP(gameResult);

    // Get user's current progression
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    const oldLevel = user.level;
    const oldXP = user.xp;
    const newXP = oldXP + xpData.totalXP;

    // Calculate new level
    const levelData = this.xpCalculationService.calculateLevelFromXP(newXP);
    const newLevel = levelData.level;

    // Update user with new XP and level
    await this.db
      .update(schema.users)
      .set({
        xp: newXP,
        level: newLevel,
        totalGamesPlayed: sql`${schema.users.totalGamesPlayed} + 1`,
        totalEnemiesKilled: sql`${schema.users.totalEnemiesKilled} + ${gameResult.enemiesKilled || 0}`,
        highestWaveReached: sql`GREATEST(${schema.users.highestWaveReached}, ${gameResult.wavesCompleted})`,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    // Record XP transaction
    await this.db.insert(schema.xpTransactions).values({
      userId,
      amount: xpData.totalXP,
      source: 'game_complete',
      description: `Game completed: ${gameResult.wavesCompleted} waves, ${gameResult.score} score`,
      gameId: gameId || null,
    });

    // Check for new unlocks if leveled up
    const newUnlocks: LevelUpReward[] = [];
    if (newLevel > oldLevel) {
      // Get rewards for levels gained
      const levelRewards = await this.db
        .select()
        .from(schema.levelRequirements)
        .where(
          and(
            sql`${schema.levelRequirements.level} > ${oldLevel}`,
            sql`${schema.levelRequirements.level} <= ${newLevel}`,
          ),
        );

      for (const reward of levelRewards) {
        if (reward.rewardType && reward.rewardValue) {
          newUnlocks.push({
            type: reward.rewardType as any,
            value: reward.rewardValue,
            level: reward.level,
          });

          // If it's a tower unlock, add it to user's unlocks
          if (reward.rewardType === 'tower_unlock') {
            await this.unlockTowerForUser(userId, reward.rewardValue);
          }
        }
      }
    }

    return {
      xpAwarded: xpData.totalXP,
      leveledUp: newLevel > oldLevel,
      oldLevel,
      newLevel,
      newUnlocks,
      breakdown: xpData.breakdown,
    };
  }

  /**
   * Unlock a tower for a user
   */
  async unlockTowerForUser(userId: string, towerType: string): Promise<void> {
    try {
      await this.db.insert(schema.userTowerUnlocks).values({
        userId,
        towerType,
      });
    } catch (error) {
      // Ignore if already unlocked (unique constraint)
      if (!error.message?.includes('unique')) {
        throw error;
      }
    }
  }

  /**
   * Get user's unlocked towers
   */
  async getUserUnlockedTowers(userId: string): Promise<string[]> {
    const unlocks = await this.db
      .select({ towerType: schema.userTowerUnlocks.towerType })
      .from(schema.userTowerUnlocks)
      .where(eq(schema.userTowerUnlocks.userId, userId));

    return unlocks.map((u) => u.towerType);
  }

  /**
   * Get all towers available at user's level (both unlocked and locked)
   */
  async getAllTowersForUser(userId: string): Promise<any[]> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Get all tower definitions
    const towers = await this.db
      .select()
      .from(schema.towerDefinitions)
      .orderBy(schema.towerDefinitions.unlockLevel);

    // Get user's unlocked towers
    const unlockedTowers = await this.getUserUnlockedTowers(userId);

    // Get user's tower upgrade levels
    const userUpgrades = await this.db
      .select()
      .from(schema.userTowerUpgrades)
      .where(eq(schema.userTowerUpgrades.userId, userId));

    const upgradeMap = new Map(
      userUpgrades.map((u) => [u.towerType, u.currentLevel]),
    );

    // Combine data
    return towers.map((tower) => ({
      ...tower,
      unlocked: unlockedTowers.includes(tower.towerType),
      canUnlock: user.level >= tower.unlockLevel,
      currentUpgradeLevel: upgradeMap.get(tower.towerType) || 1,
    }));
  }

  /**
   * Upgrade a tower for a user
   */
  async upgradeTower(
    userId: string,
    towerType: string,
  ): Promise<{
    success: boolean;
    newLevel: number;
    xpCost: number;
    message: string;
  }> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Get current upgrade level
    const [currentUpgrade] = await this.db
      .select()
      .from(schema.userTowerUpgrades)
      .where(
        and(
          eq(schema.userTowerUpgrades.userId, userId),
          eq(schema.userTowerUpgrades.towerType, towerType),
        ),
      )
      .limit(1);

    const currentLevel = currentUpgrade?.currentLevel || 1;
    const nextLevel = currentLevel + 1;

    if (nextLevel > 5) {
      return {
        success: false,
        newLevel: currentLevel,
        xpCost: 0,
        message: 'Tower already at max level',
      };
    }

    // Get upgrade requirements
    const [upgradeData] = await this.db
      .select()
      .from(schema.towerUpgrades)
      .where(
        and(
          eq(schema.towerUpgrades.towerType, towerType),
          eq(schema.towerUpgrades.upgradeLevel, nextLevel),
        ),
      )
      .limit(1);

    if (!upgradeData) {
      return {
        success: false,
        newLevel: currentLevel,
        xpCost: 0,
        message: 'Upgrade data not found',
      };
    }

    // Check level requirement
    if (user.level < upgradeData.unlockPlayerLevel) {
      return {
        success: false,
        newLevel: currentLevel,
        xpCost: upgradeData.upgradeCostAmount,
        message: `Player level ${upgradeData.unlockPlayerLevel} required`,
      };
    }

    // Check XP cost
    if (user.xp < upgradeData.upgradeCostAmount) {
      return {
        success: false,
        newLevel: currentLevel,
        xpCost: upgradeData.upgradeCostAmount,
        message: 'Insufficient XP',
      };
    }

    // Deduct XP
    await this.db
      .update(schema.users)
      .set({
        xp: user.xp - upgradeData.upgradeCostAmount,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    // Record XP transaction
    await this.db.insert(schema.xpTransactions).values({
      userId,
      amount: -upgradeData.upgradeCostAmount,
      source: 'tower_upgrade',
      description: `Upgraded ${towerType} to level ${nextLevel}`,
      gameId: null,
    });

    // Update or create tower upgrade record
    if (currentUpgrade) {
      await this.db
        .update(schema.userTowerUpgrades)
        .set({
          currentLevel: nextLevel,
          upgradedAt: new Date(),
        })
        .where(
          and(
            eq(schema.userTowerUpgrades.userId, userId),
            eq(schema.userTowerUpgrades.towerType, towerType),
          ),
        );
    } else {
      await this.db.insert(schema.userTowerUpgrades).values({
        userId,
        towerType,
        currentLevel: nextLevel,
      });
    }

    return {
      success: true,
      newLevel: nextLevel,
      xpCost: upgradeData.upgradeCostAmount,
      message: 'Tower upgraded successfully',
    };
  }

  /**
   * Get upcoming rewards for a user
   */
  async getUpcomingRewards(
    userId: string,
    count: number = 5,
  ): Promise<LevelUpReward[]> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    const rewards = await this.db
      .select()
      .from(schema.levelRequirements)
      .where(sql`${schema.levelRequirements.level} > ${user.level}`)
      .orderBy(schema.levelRequirements.level)
      .limit(count);

    return rewards
      .filter((r) => r.rewardType && r.rewardValue)
      .map((r) => ({
        type: r.rewardType as any,
        value: r.rewardValue!,
        level: r.level,
      }));
  }

  /**
   * Get user's complete progression data
   */
  async getUserProgression(userId: string): Promise<UserProgression> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    const levelData = this.xpCalculationService.calculateLevelFromXP(user.xp);
    const unlockedTowers = await this.getUserUnlockedTowers(userId);

    const userUpgrades = await this.db
      .select()
      .from(schema.userTowerUpgrades)
      .where(eq(schema.userTowerUpgrades.userId, userId));

    const towerUpgrades = Object.fromEntries(
      userUpgrades.map((u) => [u.towerType, u.currentLevel]),
    );

    return {
      userId,
      level: user.level,
      xp: user.xp,
      xpForNextLevel: levelData.xpForNextLevel,
      progressPercentage: levelData.progressToNextLevel * 100,
      unlockedTowers,
      towerUpgrades,
    };
  }
}
