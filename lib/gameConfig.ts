import { TowerType, Position } from '@/types/game';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GRID_SIZE = 40;
export const STARTING_MONEY = 500;
export const STARTING_LIVES = 20;

export const TOWER_TYPES: TowerType[] = [
  {
    type: 'basic',
    name: 'Basic Tower',
    cost: 100,
    range: 120,
    damage: 10,
    fireRate: 1, // 1 shot per second
    description: 'Balanced tower for general defense'
  },
  {
    type: 'sniper',
    name: 'Sniper Tower',
    cost: 200,
    range: 200,
    damage: 30,
    fireRate: 0.5, // 1 shot every 2 seconds
    description: 'Long range, high damage, slow fire rate'
  },
  {
    type: 'cannon',
    name: 'Cannon Tower',
    cost: 150,
    range: 100,
    damage: 20,
    fireRate: 1.5, // 1.5 shots per second
    description: 'Short range, high fire rate'
  }
];

// Define the path enemies will follow
export const ENEMY_PATH: Position[] = [
  { x: 0, y: 200 },
  { x: 200, y: 200 },
  { x: 200, y: 400 },
  { x: 400, y: 400 },
  { x: 400, y: 100 },
  { x: 600, y: 100 },
  { x: 600, y: 300 },
  { x: 800, y: 300 }
];

export const ENEMY_TYPES = {
  basic: {
    health: 50,
    speed: 1,
    value: 25,
    color: '#ef4444'
  },
  fast: {
    health: 30,
    speed: 2,
    value: 30,
    color: '#f59e0b'
  },
  tank: {
    health: 150,
    speed: 0.5,
    value: 50,
    color: '#8b5cf6'
  }
};

export const WAVE_CONFIG = [
  { type: 'basic' as const, count: 5, interval: 1000 },
  { type: 'basic' as const, count: 10, interval: 800 },
  { type: 'fast' as const, count: 8, interval: 600 },
  { type: 'basic' as const, count: 15, interval: 600 },
  { type: 'tank' as const, count: 5, interval: 1500 },
  { type: 'fast' as const, count: 12, interval: 500 },
  { type: 'basic' as const, count: 20, interval: 500 },
  { type: 'tank' as const, count: 8, interval: 1200 },
  { type: 'fast' as const, count: 15, interval: 400 },
  { type: 'basic' as const, count: 30, interval: 400 }
];
