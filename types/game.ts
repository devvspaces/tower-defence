export interface Position {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  value: number; // Money earned when killed
  type: 'basic' | 'fast' | 'tank';
}

export interface Tower {
  id: string;
  position: Position;
  range: number;
  damage: number;
  fireRate: number; // Attacks per second
  lastFireTime: number;
  cost: number;
  type: 'basic' | 'sniper' | 'cannon';
  target: string | null; // Enemy ID
}

export interface Projectile {
  id: string;
  position: Position;
  targetId: string;
  damage: number;
  speed: number;
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
  gameStatus: 'playing' | 'paused' | 'gameOver' | 'won';
  selectedTowerType: Tower['type'] | null;
}

export interface TowerType {
  type: Tower['type'];
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  description: string;
}
