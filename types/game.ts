export interface Position {
  x: number;
  y: number;
}

export interface StatusEffect {
  type: 'slow' | 'freeze' | 'poison';
  duration: number; // seconds
  strength: number; // multiplier for slow (0.5 = 50% speed), damage for poison
  appliedAt: number; // timestamp
}

export type EnemyTypeId = 'basic' | 'fast' | 'tank' | 'swarm' | 'elite' | 'boss' | 'healer' | 'flying';

export interface Enemy {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  speed: number;
  baseSpeed: number; // Original speed before effects
  pathIndex: number;
  value: number; // Money earned when killed
  type: EnemyTypeId;
  statusEffects: StatusEffect[];
}

export type TowerCategory = 'physical' | 'magic' | 'support';

export type TowerTypeId =
  | 'basic' | 'sniper' | 'cannon' // Physical
  | 'fireMage' | 'lightning' | 'arcane' // Magic Attack
  | 'iceTower' | 'poison' | 'slow'; // Support/Magic Defense

export interface Tower {
  id: string;
  position: Position;
  range: number;
  damage: number;
  fireRate: number; // Attacks per second
  lastFireTime: number;
  cost: number;
  type: TowerTypeId;
  category: TowerCategory;
  target: string | null; // Enemy ID
  specialAbility?: {
    type: 'aoe' | 'chain' | 'slow' | 'freeze' | 'poison';
    value: number; // AOE radius, chain count, slow %, etc.
  };
}

export interface Projectile {
  id: string;
  position: Position;
  targetId: string;
  damage: number;
  speed: number;
  towerType: TowerTypeId;
  specialEffect?: {
    type: 'aoe' | 'chain' | 'slow' | 'freeze' | 'poison';
    value: number;
  };
}

export interface GameState {
  money: number;
  lives: number;
  wave: number;
  score: number;
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  path: Position[];
  gameStatus: 'playing' | 'paused' | 'gameOver' | 'won' | 'waiting';
  selectedTowerType: TowerTypeId | null;
  nukeCharges: number;
  waveStartTime: number | null; // When next wave will auto-start
  gameStartTime: number | null; // Initial game start timer
}

export interface TowerType {
  type: TowerTypeId;
  category: TowerCategory;
  name: string;
  icon: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  description: string;
  specialAbility?: {
    type: 'aoe' | 'chain' | 'slow' | 'freeze' | 'poison';
    value: number;
    description: string;
  };
}
