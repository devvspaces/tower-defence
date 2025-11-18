import { Inject, Injectable } from '@nestjs/common';
import { GAME_REPOSITORY, GameRepository } from '../domain/game.repository';
import { Game, GameStateRecord } from '../domain/game.entity';
import { ProgressionService } from '../../progression/application/progression.service';

@Injectable()
export class GameService {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    private readonly progressionService: ProgressionService,
  ) {}

  async recordGame(
    userId: string,
    score: number,
    wavesCompleted: number,
    gameState: GameStateRecord,
    startedAt: Date,
    completedAt: Date,
  ): Promise<{
    game: Game;
    progression: {
      xpAwarded: number;
      leveledUp: boolean;
      oldLevel: number;
      newLevel: number;
      newUnlocks: any[];
      breakdown: any;
    };
  }> {
    // Record the game
    const game = await this.gameRepository.create({
      userId,
      score,
      wavesCompleted,
      gameState,
      startedAt,
      completedAt,
    });

    // Calculate enemy kills from game state
    const enemiesKilled = gameState.finalStats?.nukesUsed
      ? 0 // We need to properly calculate this from game state
      : 0;

    // Award XP and handle progression
    const progression = await this.progressionService.awardXP(
      userId,
      {
        wavesCompleted,
        score,
        lives: gameState.finalStats?.lives || 0,
        maxLives: 20, // Default max lives, should come from game config
        difficulty: 'normal', // Should come from game state
        isFirstWinToday: false, // TODO: Implement first win detection
        enemiesKilled,
      },
      game.id,
    );

    return {
      game,
      progression,
    };
  }

  async getGameById(gameId: string): Promise<Game | null> {
    return this.gameRepository.findById(gameId);
  }

  async getUserGames(userId: string, limit: number = 10): Promise<Game[]> {
    return this.gameRepository.findByUserId(userId, limit);
  }

  async getLeaderboard(limit: number = 100) {
    return this.gameRepository.getLeaderboard(limit);
  }

  async getOverallLeaderboard(limit: number = 100) {
    return this.gameRepository.getOverallLeaderboard(limit);
  }
}
