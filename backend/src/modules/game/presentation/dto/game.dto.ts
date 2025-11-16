import { GameStateRecord } from '../../domain/game.entity';

export class RecordGameDto {
  score: number;
  wavesCompleted: number;
  gameState: GameStateRecord;
  startedAt: string; // ISO string
  completedAt: string; // ISO string
}
