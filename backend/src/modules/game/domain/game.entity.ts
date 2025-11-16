export interface WaveRecord {
  waveNumber: number;
  enemiesSpawned: {
    type: string;
    count: number;
  }[];
  timestamp: number;
}

export interface TowerPlacementRecord {
  type: string;
  position: { x: number; y: number };
  timestamp: number;
}

export interface GameActionRecord {
  type: 'tower_place' | 'tower_sell' | 'nuke' | 'wave_start' | 'wave_complete';
  timestamp: number;
  data?: any;
}

export interface GameStateRecord {
  mapId: number;
  seed: string;
  waves: WaveRecord[];
  towers: TowerPlacementRecord[];
  actions: GameActionRecord[];
  finalStats: {
    money: number;
    lives: number;
    nukesUsed: number;
  };
}

export class Game {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly score: number,
    public readonly wavesCompleted: number,
    public readonly gameState: GameStateRecord,
    public readonly startedAt: Date,
    public readonly completedAt: Date,
    public readonly createdAt: Date,
  ) {}
}
