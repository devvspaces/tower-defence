import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpgradeTowerDto {
  @ApiProperty({ description: 'Tower type to upgrade' })
  @IsString()
  towerType: string;
}

export class UserProgressionResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  level: number;

  @ApiProperty()
  xp: number;

  @ApiProperty()
  xpForNextLevel: number;

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty()
  unlockedTowers: string[];

  @ApiProperty()
  towerUpgrades: Record<string, number>;

  @ApiProperty()
  totalGamesPlayed: number;

  @ApiProperty()
  totalEnemiesKilled: number;

  @ApiProperty()
  highestWaveReached: number;
}

export class TowerDefinitionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  towerType: string;

  @ApiProperty()
  baseName: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  unlockLevel: number;

  @ApiProperty()
  baseCost: number;

  @ApiProperty()
  baseDamage: number;

  @ApiProperty()
  baseRange: number;

  @ApiProperty()
  baseFireRate: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  lore: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  rarity: string;

  @ApiProperty()
  unlocked: boolean;

  @ApiProperty()
  canUnlock: boolean;

  @ApiProperty()
  currentUpgradeLevel: number;
}

export class TowerUpgradeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  towerType: string;

  @ApiProperty()
  upgradeLevel: number;

  @ApiProperty()
  costMultiplier: number;

  @ApiProperty()
  damageMultiplier: number;

  @ApiProperty()
  rangeMultiplier: number;

  @ApiProperty()
  fireRateMultiplier: number;

  @ApiProperty()
  specialBonusType: string | null;

  @ApiProperty()
  specialBonusValue: number | null;

  @ApiProperty()
  unlockPlayerLevel: number;

  @ApiProperty()
  upgradeCostCurrency: string;

  @ApiProperty()
  upgradeCostAmount: number;
}

export class UpgradeTowerResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  newLevel: number;

  @ApiProperty()
  xpCost: number;

  @ApiProperty()
  message: string;
}

export class RewardDto {
  @ApiProperty()
  type: 'tower_unlock' | 'upgrade_unlock' | 'bonus_xp' | 'achievement';

  @ApiProperty()
  value: string;

  @ApiProperty()
  level: number;
}
