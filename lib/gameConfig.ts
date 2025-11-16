import { TowerType, Position } from '@/types/game';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GRID_SIZE = 40;
export const STARTING_MONEY = 600;
export const STARTING_LIVES = 20;
export const STARTING_NUKES = 3;
export const WAVE_DELAY = 15000;
export const INITIAL_GAME_START_DELAY = 15000;

// GAME LORE
export const GAME_LORE = {
  title: "Chronicles of the Eternal Citadel",
  intro: "In the year 2847, humanity's last bastion stands against the Void Corruption. You are the Guardian Commander, tasked with defending the Eternal Citadel from waves of corrupted entities seeking to breach our reality.",
  story: "The ancient prophecy spoke of the Great Convergence, when the barriers between dimensions would weaken. Now, the prophecy unfolds. Command the legendary defense systems of old and new, combining arcane magic with advanced technology to repel the endless hordes."
};

export const TOWER_TYPES: TowerType[] = [
  // PHYSICAL ATTACK TOWERS
  {
    type: 'basic',
    category: 'physical',
    name: 'Sentinel Crossbow',
    cost: 100,
    range: 120,
    damage: 10,
    fireRate: 1,
    description: 'Ancient automated defense, precise and reliable'
  },
  {
    type: 'sniper',
    category: 'physical',
    name: 'Void Piercer',
    cost: 200,
    range: 220,
    damage: 35,
    fireRate: 0.5,
    description: 'Experimental railgun that tears through dimensional fabric'
  },
  {
    type: 'cannon',
    category: 'physical',
    name: 'Thunder Howitzer',
    cost: 180,
    range: 100,
    damage: 25,
    fireRate: 1.5,
    description: 'Explosive artillery creating shockwaves of destruction',
    specialAbility: {
      type: 'aoe',
      value: 50,
      description: 'Shockwave damages all nearby entities'
    }
  },

  // MAGIC ATTACK TOWERS
  {
    type: 'fireMage',
    category: 'magic',
    name: 'Inferno Conduit',
    cost: 250,
    range: 140,
    damage: 20,
    fireRate: 0.8,
    description: 'Channels pure flame from the elemental plane',
    specialAbility: {
      type: 'aoe',
      value: 60,
      description: 'Immolates everything in blast radius'
    }
  },
  {
    type: 'lightning',
    category: 'magic',
    name: 'Storm Caller',
    cost: 300,
    range: 160,
    damage: 15,
    fireRate: 1.2,
    description: 'Summons chain lightning from the tempest realm',
    specialAbility: {
      type: 'chain',
      value: 3,
      description: 'Lightning arcs between corrupted souls'
    }
  },
  {
    type: 'arcane',
    category: 'magic',
    name: 'Aether Spire',
    cost: 350,
    range: 150,
    damage: 40,
    fireRate: 0.6,
    description: 'Harnesses raw reality-bending energy',
  },

  // SUPPORT/MAGIC DEFENSE TOWERS
  {
    type: 'iceTower',
    category: 'support',
    name: 'Cryo Stasis Matrix',
    cost: 200,
    range: 130,
    damage: 5,
    fireRate: 1,
    description: 'Freezes enemies in temporal suspension',
    specialAbility: {
      type: 'freeze',
      value: 2,
      description: 'Locks entities in frozen time'
    }
  },
  {
    type: 'slow',
    category: 'support',
    name: 'Gravity Well',
    cost: 150,
    range: 150,
    damage: 3,
    fireRate: 1.5,
    description: 'Warps spacetime to slow enemy movement',
    specialAbility: {
      type: 'slow',
      value: 0.5,
      description: 'Gravitational field reduces speed by 50%'
    }
  },
  {
    type: 'poison',
    category: 'support',
    name: 'Plague Spewer',
    cost: 180,
    range: 120,
    damage: 8,
    fireRate: 0.7,
    description: 'Spreads bio-engineered corruption toxin',
    specialAbility: {
      type: 'poison',
      value: 5,
      description: 'Toxin eats away at dimensional barriers'
    }
  }
];

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
    color: '#ef4444',
    name: 'Void Walker',
    description: 'Basic corrupted entity from the void'
  },
  fast: {
    health: 30,
    speed: 2,
    value: 30,
    color: '#f59e0b',
    name: 'Phase Shifter',
    description: 'Quick dimensional beings that flicker through space'
  },
  tank: {
    health: 150,
    speed: 0.5,
    value: 50,
    color: '#8b5cf6',
    name: 'Void Titan',
    description: 'Massive corrupted behemoth, slow but devastating'
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

export const LEADERBOARD_DATA = [
  { rank: 1, name: 'Commander_Nova', score: 125400, wave: 10 },
  { rank: 2, name: 'VoidSlayer_X', score: 98750, wave: 10 },
  { rank: 3, name: 'ArcaneDefender', score: 87230, wave: 9 },
  { rank: 4, name: 'CyberGuardian', score: 76500, wave: 9 },
  { rank: 5, name: 'PhaseHunter', score: 65890, wave: 8 },
  { rank: 6, name: 'StormBreaker', score: 54200, wave: 8 },
  { rank: 7, name: 'FrostWarden', score: 48900, wave: 7 },
  { rank: 8, name: 'ThunderStrike', score: 42100, wave: 7 },
  { rank: 9, name: 'ShadowReaper', score: 38450, wave: 6 },
  { rank: 10, name: 'ChaosKnight', score: 32800, wave: 6 }
];
