import { Inject, Injectable } from '@nestjs/common';
import { eq, desc, sum, count, max, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/shared/database/database.module';
import { Database } from '@/shared/database/connection';
import { games, users } from '@/shared/database/schema';
import { GameRepository, CreateGameParams } from '../domain/game.repository';
import { Game } from '../domain/game.entity';

@Injectable()
export class GameRepositoryImpl implements GameRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async create(params: CreateGameParams): Promise<Game> {
    const [result] = await this.db
      .insert(games)
      .values({
        userId: params.userId,
        score: params.score,
        wavesCompleted: params.wavesCompleted,
        gameState: params.gameState,
        startedAt: params.startedAt,
        completedAt: params.completedAt,
      })
      .returning();

    return this.toDomain(result);
  }

  async findById(id: string): Promise<Game | null> {
    const [result] = await this.db
      .select()
      .from(games)
      .where(eq(games.id, id));

    return result ? this.toDomain(result) : null;
  }

  async findByUserId(userId: string, limit: number = 10): Promise<Game[]> {
    const results = await this.db
      .select()
      .from(games)
      .where(eq(games.userId, userId))
      .orderBy(desc(games.completedAt))
      .limit(limit);

    return results.map(r => this.toDomain(r));
  }

  async getLeaderboard(limit: number = 100): Promise<Array<{
    userId: string;
    username: string | null;
    walletAddress: string;
    score: number;
    wavesCompleted: number;
    completedAt: Date;
  }>> {
    const results = await this.db
      .select({
        userId: games.userId,
        username: users.username,
        walletAddress: users.walletAddress,
        score: games.score,
        wavesCompleted: games.wavesCompleted,
        completedAt: games.completedAt,
      })
      .from(games)
      .innerJoin(users, eq(games.userId, users.id))
      .orderBy(desc(games.score))
      .limit(limit);

    return results;
  }

  async getOverallLeaderboard(limit: number = 100): Promise<Array<{
    userId: string;
    username: string | null;
    walletAddress: string;
    totalScore: number;
    totalGames: number;
    bestScore: number;
    bestWaves: number;
  }>> {
    const results = await this.db
      .select({
        userId: games.userId,
        username: users.username,
        walletAddress: users.walletAddress,
        totalScore: sql<number>`cast(sum(${games.score}) as integer)`.as('total_score'),
        totalGames: sql<number>`cast(count(*) as integer)`.as('total_games'),
        bestScore: sql<number>`cast(max(${games.score}) as integer)`.as('best_score'),
        bestWaves: sql<number>`cast(max(${games.wavesCompleted}) as integer)`.as('best_waves'),
      })
      .from(games)
      .innerJoin(users, eq(games.userId, users.id))
      .groupBy(games.userId, users.username, users.walletAddress)
      .orderBy(desc(sql`sum(${games.score})`))
      .limit(limit);

    return results;
  }

  private toDomain(data: typeof games.$inferSelect): Game {
    return new Game(
      data.id,
      data.userId,
      data.score,
      data.wavesCompleted,
      data.gameState,
      data.startedAt,
      data.completedAt,
      data.createdAt,
    );
  }
}
