import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { ProgressionService } from '../application/progression.service';
import {
  UserProgressionResponseDto,
  TowerDefinitionDto,
  TowerUpgradeDto,
  UpgradeTowerDto,
  UpgradeTowerResponseDto,
  RewardDto,
} from './dto/progression.dto';
import { eq, and } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { Database } from '../../../shared/database/connection';
import * as schema from '../../../shared/database/schema';

@ApiTags('progression')
@Controller('progression')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressionController {
  constructor(
    private readonly progressionService: ProgressionService,
    @Inject('DATABASE_CONNECTION') private db: Database,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user progression profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User progression data',
    type: UserProgressionResponseDto,
  })
  async getUserProfile(
    @CurrentUser() user: any,
  ): Promise<UserProgressionResponseDto> {
    const progression = await this.progressionService.getUserProgression(
      user.id,
    );

    const [userData] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    return {
      ...progression,
      totalGamesPlayed: userData.totalGamesPlayed,
      totalEnemiesKilled: userData.totalEnemiesKilled,
      highestWaveReached: userData.highestWaveReached,
    };
  }

  @Get('towers/all')
  @ApiOperation({ summary: 'Get all towers with unlock status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all towers',
    type: [TowerDefinitionDto],
  })
  async getAllTowers(@CurrentUser() user: any): Promise<TowerDefinitionDto[]> {
    return this.progressionService.getAllTowersForUser(user.id);
  }

  @Get('towers/available')
  @ApiOperation({ summary: 'Get user unlocked towers' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of unlocked towers',
    type: [TowerDefinitionDto],
  })
  async getAvailableTowers(
    @CurrentUser() user: any,
  ): Promise<TowerDefinitionDto[]> {
    const allTowers = await this.progressionService.getAllTowersForUser(
      user.id,
    );
    return allTowers.filter((tower) => tower.unlocked);
  }

  @Get('towers/:towerType/upgrades')
  @ApiOperation({ summary: 'Get upgrade path for a tower' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tower upgrade levels',
    type: [TowerUpgradeDto],
  })
  async getTowerUpgrades(
    @CurrentUser() user: any,
    @Body('towerType') towerType: string,
  ): Promise<TowerUpgradeDto[]> {
    const upgrades = await this.db
      .select()
      .from(schema.towerUpgrades)
      .where(eq(schema.towerUpgrades.towerType, towerType))
      .orderBy(schema.towerUpgrades.upgradeLevel);

    return upgrades;
  }

  @Post('towers/upgrade')
  @ApiOperation({ summary: 'Upgrade a tower' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tower upgraded successfully',
    type: UpgradeTowerResponseDto,
  })
  async upgradeTower(
    @CurrentUser() user: any,
    @Body() dto: UpgradeTowerDto,
  ): Promise<UpgradeTowerResponseDto> {
    return this.progressionService.upgradeTower(user.id, dto.towerType);
  }

  @Get('rewards/upcoming')
  @ApiOperation({ summary: 'Get upcoming unlock rewards' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of upcoming rewards',
    type: [RewardDto],
  })
  async getUpcomingRewards(@CurrentUser() user: any): Promise<RewardDto[]> {
    return this.progressionService.getUpcomingRewards(user.id, 10);
  }
}
