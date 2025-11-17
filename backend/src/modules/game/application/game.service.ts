import { Inject, Injectable } from '@nestjs/common';
import { GAME_REPOSITORY, GameRepository } from '../domain/game.repository';
import { Game, GameStateRecord } from '../domain/game.entity';

@Injectable()
export class GameService {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
  ) {}

  async recordGame(
    userId: string,
    score: number,
    wavesCompleted: number,
    gameState: GameStateRecord,
    startedAt: Date,
    completedAt: Date,
  ): Promise<Game> {
    return this.gameRepository.create({
      userId,
      score,
      wavesCompleted,
      gameState,
      startedAt,
      completedAt,
    });
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
