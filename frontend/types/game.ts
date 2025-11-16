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

export type EnemyTypeId = 'basic' | 'fast' | 'tank' | 'swarm' | 'elite' | 'boss' | 'healer' | 'flying'
  | 'armored' | 'ethereal' | 'crystal' | 'demolisher' | 'regenerator' | 'speedDemon' | 'goldThief' | 'juggernaut';

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
  damage: number; // Damage dealt to home when reaching end
  physicalResist: number; // 0-1, 1 = 100% resist
  magicResist: number; // 0-1, 1 = 100% resist
  attacksTowers?: boolean; // Can this enemy attack towers
  towerDamage?: number; // Damage dealt to towers
  attackRange?: number; // Range to attack towers
  regeneration?: number; // HP regen per second (percentage of max HP)
  speedBoost?: boolean; // Speed increases as health decreases
  stealsGold?: number; // Amount of gold stolen if reaches end
}

export type TowerCategory = 'physical' | 'magic' | 'support' | 'utility' | 'economic' | 'hybrid';

export type TowerTypeId =
  | 'basic' | 'sniper' | 'cannon' // Physical
  | 'fireMage' | 'lightning' | 'arcane' // Magic Attack
  | 'iceTower' | 'poison' | 'slow' // Support/Magic Defense
  | 'amplifier' | 'goldmine' | 'hybrid'; // Utility, Economic, Hybrid

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
  health?: number; // Tower health (for tower-attacking enemies)
  maxHealth?: number;
  specialAbility?: {
    type: 'aoe' | 'chain' | 'slow' | 'freeze' | 'poison' | 'buff' | 'income' | 'hybrid';
    value: number; // AOE radius, chain count, slow %, buff %, income rate, etc.
  };
}

export interface Projectile {
  id: string;
  position: Position;
  targetId: string;
  damage: number;
  speed: number;
  towerType: TowerTypeId;
  towerCategory: TowerCategory; // For resistance calculation
  specialEffect?: {
    type: 'aoe' | 'chain' | 'slow' | 'freeze' | 'poison' | 'buff' | 'income' | 'hybrid';
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
    type: 'aoe' | 'chain' | 'slow' | 'freeze' | 'poison' | 'buff' | 'income' | 'hybrid';
    value: number;
    description: string;
  };
}
