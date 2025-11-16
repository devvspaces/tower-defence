import { Game, GameStateRecord } from './game.entity';

export interface CreateGameParams {
  userId: string;
  score: number;
  wavesCompleted: number;
  gameState: GameStateRecord;
  startedAt: Date;
  completedAt: Date;
}

export interface GameRepository {
  create(params: CreateGameParams): Promise<Game>;
  findById(id: string): Promise<Game | null>;
  findByUserId(userId: string, limit?: number): Promise<Game[]>;
  getLeaderboard(limit?: number): Promise<Array<{
    userId: string;
    username: string | null;
    walletAddress: string;
    score: number;
    wavesCompleted: number;
    completedAt: Date;
  }>>;
}

export const GAME_REPOSITORY = Symbol('GAME_REPOSITORY');
