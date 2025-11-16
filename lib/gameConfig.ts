import { TowerType, Position } from '@/types/game';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GRID_SIZE = 40;
export const STARTING_MONEY = 600;
export const STARTING_LIVES = 20;
export const STARTING_NUKES = 3;
export const WAVE_DELAY = 15000; // 15 seconds between waves
export const INITIAL_GAME_START_DELAY = 15000; // 15 seconds before first wave

export const TOWER_TYPES: TowerType[] = [
  // PHYSICAL ATTACK TOWERS
  {
    type: 'basic',
    category: 'physical',
    name: 'Archer Tower',
    cost: 100,
    range: 120,
    damage: 10,
    fireRate: 1,
    description: 'Basic physical damage tower'
  },
  {
    type: 'sniper',
    category: 'physical',
    name: 'Sniper Tower',
    cost: 200,
    range: 220,
    damage: 35,
    fireRate: 0.5,
    description: 'Long range, high damage, slow fire rate'
  },
  {
    type: 'cannon',
    category: 'physical',
    name: 'Cannon',
    cost: 180,
    range: 100,
    damage: 25,
    fireRate: 1.5,
    description: 'Short range artillery with splash damage',
    specialAbility: {
      type: 'aoe',
      value: 50, // AOE radius
      description: 'Deals splash damage in 50px radius'
    }
  },

  // MAGIC ATTACK TOWERS
  {
    type: 'fireMage',
    category: 'magic',
    name: 'Fire Mage',
    cost: 250,
    range: 140,
    damage: 20,
    fireRate: 0.8,
    description: 'Launches fireballs with area damage',
    specialAbility: {
      type: 'aoe',
      value: 60,
      description: 'Burns enemies in 60px radius'
    }
  },
  {
    type: 'lightning',
    category: 'magic',
    name: 'Lightning Tower',
    cost: 300,
    range: 160,
    damage: 15,
    fireRate: 1.2,
    description: 'Chain lightning hits multiple enemies',
    specialAbility: {
      type: 'chain',
      value: 3, // Number of chains
      description: 'Chains to 3 additional enemies'
    }
  },
  {
    type: 'arcane',
    category: 'magic',
    name: 'Arcane Tower',
    cost: 350,
    range: 150,
    damage: 40,
    fireRate: 0.6,
    description: 'Pure magic damage, ignores armor',
  },

  // SUPPORT/MAGIC DEFENSE TOWERS
  {
    type: 'iceTower',
    category: 'support',
    name: 'Ice Tower',
    cost: 200,
    range: 130,
    damage: 5,
    fireRate: 1,
    description: 'Freezes enemies, stopping them briefly',
    specialAbility: {
      type: 'freeze',
      value: 2, // Freeze duration in seconds
      description: 'Freezes enemies for 2 seconds'
    }
  },
  {
    type: 'slow',
    category: 'support',
    name: 'Slow Tower',
    cost: 150,
    range: 150,
    damage: 3,
    fireRate: 1.5,
    description: 'Slows enemy movement speed',
    specialAbility: {
      type: 'slow',
      value: 0.5, // 50% speed reduction
      description: 'Reduces speed by 50% for 3s'
    }
  },
  {
    type: 'poison',
    category: 'support',
    name: 'Poison Tower',
    cost: 180,
    range: 120,
    damage: 8,
    fireRate: 0.7,
    description: 'Applies poison damage over time',
    specialAbility: {
      type: 'poison',
      value: 5, // Damage per second
      description: 'Deals 5 poison damage/sec for 4s'
    }
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
