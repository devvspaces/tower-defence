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
    icon: '🏹',
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
    icon: '🎯',
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
    icon: '💥',
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
    icon: '🔥',
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
    icon: '⚡',
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
    icon: '✨',
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
    icon: '❄️',
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
    icon: '🌀',
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
    icon: '☠️',
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
    icon: '👾',
    name: 'Void Walker',
    description: 'Basic corrupted entity from the void'
  },
  fast: {
    health: 30,
    speed: 2,
    value: 30,
    color: '#f59e0b',
    icon: '⚡',
    name: 'Phase Shifter',
    description: 'Quick dimensional beings that flicker through space'
  },
  tank: {
    health: 150,
    speed: 0.5,
    value: 50,
    color: '#8b5cf6',
    icon: '🛡️',
    name: 'Void Titan',
    description: 'Massive corrupted behemoth, slow but devastating'
  },
  swarm: {
    health: 20,
    speed: 1.5,
    value: 15,
    color: '#22c55e',
    icon: '🦟',
    name: 'Swarm Drone',
    description: 'Weak but numerous, overwhelms through numbers'
  },
  elite: {
    health: 200,
    speed: 0.8,
    value: 75,
    color: '#ec4899',
    icon: '👹',
    name: 'Void Champion',
    description: 'Elite warrior from the corrupted realm'
  },
  boss: {
    health: 500,
    speed: 0.3,
    value: 150,
    color: '#dc2626',
    icon: '💀',
    name: 'Corruption Lord',
    description: 'Powerful entity that leads the void armies'
  },
  healer: {
    health: 80,
    speed: 0.7,
    value: 60,
    color: '#14b8a6',
    icon: '🔮',
    name: 'Void Mender',
    description: 'Regenerates nearby corrupted entities'
  },
  flying: {
    health: 40,
    speed: 2.5,
    value: 40,
    color: '#a855f7',
    icon: '🦇',
    name: 'Sky Terror',
    description: 'Aerial threat that moves rapidly'
  }
};

// Base wave configurations for first 10 waves
export const BASE_WAVE_CONFIG = [
  { type: 'basic' as const, count: 5, interval: 1000 },
  { type: 'basic' as const, count: 10, interval: 800 },
  { type: 'fast' as const, count: 8, interval: 600 },
  { type: 'basic' as const, count: 15, interval: 600 },
  { type: 'tank' as const, count: 5, interval: 1500 },
  { type: 'fast' as const, count: 12, interval: 500 },
  { type: 'swarm' as const, count: 20, interval: 400 },
  { type: 'elite' as const, count: 6, interval: 1200 },
  { type: 'flying' as const, count: 15, interval: 500 },
  { type: 'boss' as const, count: 3, interval: 2000 }
];

// Generate endless waves with increasing difficulty
export function generateWave(waveNumber: number): { type: keyof typeof ENEMY_TYPES; count: number; interval: number } {
  if (waveNumber <= BASE_WAVE_CONFIG.length) {
    return BASE_WAVE_CONFIG[waveNumber - 1];
  }

  // For waves beyond 10, generate dynamic waves with scaling difficulty
  const cycle = (waveNumber - 1) % 8;
  const difficultyMultiplier = 1 + Math.floor((waveNumber - 1) / 8) * 0.3;

  const wavePatterns = [
    { type: 'swarm' as const, count: Math.floor(25 * difficultyMultiplier), interval: 350 },
    { type: 'basic' as const, count: Math.floor(20 * difficultyMultiplier), interval: 500 },
    { type: 'fast' as const, count: Math.floor(15 * difficultyMultiplier), interval: 450 },
    { type: 'tank' as const, count: Math.floor(8 * difficultyMultiplier), interval: 1000 },
    { type: 'elite' as const, count: Math.floor(10 * difficultyMultiplier), interval: 900 },
    { type: 'flying' as const, count: Math.floor(18 * difficultyMultiplier), interval: 400 },
    { type: 'healer' as const, count: Math.floor(12 * difficultyMultiplier), interval: 700 },
    { type: 'boss' as const, count: Math.floor(4 * difficultyMultiplier), interval: 1800 }
  ];

  // Every 5 waves after 10, add a mixed wave
  if (waveNumber > 10 && waveNumber % 5 === 0) {
    const randomTypes: Array<keyof typeof ENEMY_TYPES> = ['basic', 'fast', 'tank', 'elite', 'boss', 'swarm', 'flying', 'healer'];
    const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
    return {
      type: randomType,
      count: Math.floor(15 * difficultyMultiplier),
      interval: 600
    };
  }

  return wavePatterns[cycle];
}

export const LEADERBOARD_DATA = [
  { rank: 1, name: 'Commander_Nova', score: 125400, wave: 47 },
  { rank: 2, name: 'VoidSlayer_X', score: 98750, wave: 38 },
  { rank: 3, name: 'ArcaneDefender', score: 87230, wave: 35 },
  { rank: 4, name: 'CyberGuardian', score: 76500, wave: 29 },
  { rank: 5, name: 'PhaseHunter', score: 65890, wave: 27 },
  { rank: 6, name: 'StormBreaker', score: 54200, wave: 24 },
  { rank: 7, name: 'FrostWarden', score: 48900, wave: 22 },
  { rank: 8, name: 'ThunderStrike', score: 42100, wave: 19 },
  { rank: 9, name: 'ShadowReaper', score: 38450, wave: 18 },
  { rank: 10, name: 'ChaosKnight', score: 32800, wave: 15 }
];
