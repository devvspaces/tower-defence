import { TowerType, Position } from '@/types/game';

interface EnemyConfig {
  health: number;
  speed: number;
  value: number;
  damage: number;
  color: string;
  icon: string;
  name: string;
  description: string;
  physicalResist: number;
  magicResist: number;
  attacksTowers?: boolean;
  towerDamage?: number;
  attackRange?: number;
  regeneration?: number;
  speedBoost?: boolean;
  stealsGold?: number;
}

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GRID_SIZE = 40;
export const STARTING_MONEY = 600;
export const STARTING_LIVES = 20;
export const STARTING_NUKES = 3;
export const WAVE_DELAY = 5000; // 5 seconds between waves
export const INITIAL_GAME_START_DELAY = 5000; // 5 seconds before first wave

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
  },

  // UTILITY TOWERS
  {
    type: 'amplifier',
    category: 'utility',
    name: 'Damage Amplifier',
    icon: '📡',
    cost: 250,
    range: 150,
    damage: 0,
    fireRate: 0,
    description: 'Increases damage of nearby towers by 40%',
    specialAbility: {
      type: 'buff',
      value: 0.4,
      description: 'Boosts nearby tower damage'
    }
  },

  // ECONOMIC TOWERS
  {
    type: 'goldmine',
    category: 'economic',
    name: 'Resource Collector',
    icon: '💰',
    cost: 300,
    range: 0,
    damage: 0,
    fireRate: 0,
    description: 'Generates $8 per second passively',
    specialAbility: {
      type: 'income',
      value: 8,
      description: 'Passive income generation'
    }
  },

  // HYBRID TOWERS
  {
    type: 'hybrid',
    category: 'hybrid',
    name: 'Dual Element Core',
    icon: '🌟',
    cost: 400,
    range: 140,
    damage: 25,
    fireRate: 1,
    description: 'Deals both physical and magic damage',
    specialAbility: {
      type: 'hybrid',
      value: 1,
      description: 'Bypasses all resistances'
    }
  }
];

// Predefined map paths
export const MAP_PATHS: Position[][] = [
  // Map 1: Classic zigzag
  [
    { x: 0, y: 200 },
    { x: 200, y: 200 },
    { x: 200, y: 400 },
    { x: 400, y: 400 },
    { x: 400, y: 100 },
    { x: 600, y: 100 },
    { x: 600, y: 300 },
    { x: 800, y: 300 }
  ],
  // Map 2: Snake pattern
  [
    { x: 0, y: 500 },
    { x: 300, y: 500 },
    { x: 300, y: 200 },
    { x: 600, y: 200 },
    { x: 600, y: 500 },
    { x: 800, y: 500 }
  ],
  // Map 3: Stairs
  [
    { x: 0, y: 450 },
    { x: 200, y: 450 },
    { x: 200, y: 350 },
    { x: 400, y: 350 },
    { x: 400, y: 250 },
    { x: 600, y: 250 },
    { x: 600, y: 150 },
    { x: 800, y: 150 }
  ],
  // Map 4: Wide arc
  [
    { x: 0, y: 300 },
    { x: 150, y: 450 },
    { x: 350, y: 500 },
    { x: 550, y: 450 },
    { x: 700, y: 300 },
    { x: 800, y: 300 }
  ],
  // Map 5: Tight zigzag
  [
    { x: 0, y: 150 },
    { x: 150, y: 150 },
    { x: 150, y: 400 },
    { x: 350, y: 400 },
    { x: 350, y: 200 },
    { x: 550, y: 200 },
    { x: 550, y: 450 },
    { x: 800, y: 450 }
  ]
];

// Default path for compatibility
export const ENEMY_PATH: Position[] = MAP_PATHS[0];

// Get a random map path
export function getRandomMapPath(): Position[] {
  const randomIndex = Math.floor(Math.random() * MAP_PATHS.length);
  return MAP_PATHS[randomIndex];
}

export const ENEMY_TYPES: Record<string, EnemyConfig> = {
  // BASIC ENEMIES
  basic: {
    health: 50,
    speed: 1,
    value: 25,
    damage: 1, // Damage dealt to home
    color: '#ef4444',
    icon: '👾',
    name: 'Void Walker',
    description: 'Basic corrupted entity from the void',
    physicalResist: 0,
    magicResist: 0
  },
  fast: {
    health: 30,
    speed: 2,
    value: 30,
    damage: 1,
    color: '#f59e0b',
    icon: '⚡',
    name: 'Phase Shifter',
    description: 'Quick dimensional beings that flicker through space',
    physicalResist: 0,
    magicResist: 0
  },
  tank: {
    health: 150,
    speed: 0.5,
    value: 50,
    damage: 2,
    color: '#8b5cf6',
    icon: '🛡️',
    name: 'Void Titan',
    description: 'Massive corrupted behemoth, slow but devastating',
    physicalResist: 0,
    magicResist: 0
  },
  swarm: {
    health: 20,
    speed: 1.5,
    value: 15,
    damage: 1,
    color: '#22c55e',
    icon: '🦟',
    name: 'Swarm Drone',
    description: 'Weak but numerous, overwhelms through numbers',
    physicalResist: 0,
    magicResist: 0
  },
  elite: {
    health: 200,
    speed: 0.8,
    value: 75,
    damage: 3,
    color: '#ec4899',
    icon: '👹',
    name: 'Void Champion',
    description: 'Elite warrior from the corrupted realm',
    physicalResist: 0,
    magicResist: 0
  },
  boss: {
    health: 500,
    speed: 0.3,
    value: 150,
    damage: 5,
    color: '#dc2626',
    icon: '💀',
    name: 'Corruption Lord',
    description: 'Powerful entity that leads the void armies',
    physicalResist: 0,
    magicResist: 0
  },
  healer: {
    health: 80,
    speed: 0.7,
    value: 60,
    damage: 1,
    color: '#14b8a6',
    icon: '🔮',
    name: 'Void Mender',
    description: 'Regenerates nearby corrupted entities',
    physicalResist: 0,
    magicResist: 0
  },
  flying: {
    health: 40,
    speed: 2.5,
    value: 40,
    damage: 1,
    color: '#a855f7',
    icon: '🦇',
    name: 'Sky Terror',
    description: 'Aerial threat that moves rapidly',
    physicalResist: 0,
    magicResist: 0
  },

  // NEW RESISTANT ENEMIES
  armored: {
    health: 180,
    speed: 0.6,
    value: 80,
    damage: 2,
    color: '#78716c',
    icon: '🛡️',
    name: 'Armored Knight',
    description: '75% physical resistance, normal magic damage',
    physicalResist: 0.75,
    magicResist: 0
  },
  ethereal: {
    health: 120,
    speed: 1,
    value: 90,
    damage: 2,
    color: '#c4b5fd',
    icon: '👻',
    name: 'Ethereal Wraith',
    description: 'Immune to magic, takes full physical damage',
    physicalResist: 0,
    magicResist: 1 // 100% magic resist
  },
  crystal: {
    health: 300,
    speed: 0.4,
    value: 120,
    damage: 3,
    color: '#67e8f9',
    icon: '💎',
    name: 'Crystal Golem',
    description: '50% resistance to both damage types',
    physicalResist: 0.5,
    magicResist: 0.5
  },

  // SPECIAL ABILITY ENEMIES
  demolisher: {
    health: 250,
    speed: 0.5,
    value: 100,
    damage: 4,
    color: '#f97316',
    icon: '🔨',
    name: 'Demolisher',
    description: 'Attacks and destroys towers in range',
    physicalResist: 0.3,
    magicResist: 0,
    attacksTowers: true,
    towerDamage: 50,
    attackRange: 80
  },
  regenerator: {
    health: 150,
    speed: 0.8,
    value: 85,
    damage: 2,
    color: '#4ade80',
    icon: '🩸',
    name: 'Regenerator',
    description: 'Heals 3% max HP per second',
    physicalResist: 0,
    magicResist: 0,
    regeneration: 0.03
  },
  speedDemon: {
    health: 100,
    speed: 1.2,
    value: 70,
    damage: 2,
    color: '#fb7185',
    icon: '🌪️',
    name: 'Speed Demon',
    description: 'Accelerates as HP drops',
    physicalResist: 0,
    magicResist: 0,
    speedBoost: true // Speed increases as health decreases
  },
  goldThief: {
    health: 60,
    speed: 2,
    value: 0, // Gives no money on death
    damage: 1,
    color: '#fde047',
    icon: '💰',
    name: 'Gold Thief',
    description: 'Steals $100 if it reaches the end',
    physicalResist: 0,
    magicResist: 0,
    stealsGold: 100
  },
  juggernaut: {
    health: 800,
    speed: 0.2,
    value: 200,
    damage: 8,
    color: '#991b1b',
    icon: '🐉',
    name: 'Void Juggernaut',
    description: 'Massive HP, devastating damage, 40% all resist',
    physicalResist: 0.4,
    magicResist: 0.4
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
  { type: 'armored' as const, count: 8, interval: 1000 },
  { type: 'flying' as const, count: 15, interval: 500 },
  { type: 'demolisher' as const, count: 5, interval: 1500 }
];

// Generate endless waves with FASTER increasing difficulty
export function generateWave(waveNumber: number): { type: keyof typeof ENEMY_TYPES; count: number; interval: number } {
  if (waveNumber <= BASE_WAVE_CONFIG.length) {
    return BASE_WAVE_CONFIG[waveNumber - 1];
  }

  // FASTER difficulty scaling: increases every 5 waves instead of 8
  const cycle = (waveNumber - 1) % 15;
  const difficultyMultiplier = 1 + Math.floor((waveNumber - 1) / 5) * 0.5; // 50% increase every 5 waves

  const wavePatterns = [
    { type: 'swarm' as const, count: Math.floor(30 * difficultyMultiplier), interval: 300 },
    { type: 'fast' as const, count: Math.floor(18 * difficultyMultiplier), interval: 400 },
    { type: 'armored' as const, count: Math.floor(10 * difficultyMultiplier), interval: 800 },
    { type: 'ethereal' as const, count: Math.floor(12 * difficultyMultiplier), interval: 700 },
    { type: 'tank' as const, count: Math.floor(8 * difficultyMultiplier), interval: 1000 },
    { type: 'elite' as const, count: Math.floor(10 * difficultyMultiplier), interval: 900 },
    { type: 'demolisher' as const, count: Math.floor(6 * difficultyMultiplier), interval: 1200 },
    { type: 'flying' as const, count: Math.floor(20 * difficultyMultiplier), interval: 350 },
    { type: 'regenerator' as const, count: Math.floor(8 * difficultyMultiplier), interval: 800 },
    { type: 'crystal' as const, count: Math.floor(7 * difficultyMultiplier), interval: 1100 },
    { type: 'speedDemon' as const, count: Math.floor(15 * difficultyMultiplier), interval: 500 },
    { type: 'goldThief' as const, count: Math.floor(10 * difficultyMultiplier), interval: 400 },
    { type: 'healer' as const, count: Math.floor(12 * difficultyMultiplier), interval: 700 },
    { type: 'boss' as const, count: Math.floor(4 * difficultyMultiplier), interval: 1800 },
    { type: 'juggernaut' as const, count: Math.floor(3 * difficultyMultiplier), interval: 2000 }
  ];

  // Every 3 waves after 10, add a mixed wave
  if (waveNumber > 10 && waveNumber % 3 === 0) {
    const allTypes: Array<keyof typeof ENEMY_TYPES> = Object.keys(ENEMY_TYPES) as Array<keyof typeof ENEMY_TYPES>;
    const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
    return {
      type: randomType,
      count: Math.floor(12 * difficultyMultiplier),
      interval: 500
    };
  }

  return wavePatterns[cycle];
}

export const LEADERBOARD_DATA = [
  { rank: 1, name: 'Commander_Nova', score: 325400, wave: 87 },
  { rank: 2, name: 'VoidSlayer_X', score: 298750, wave: 72 },
  { rank: 3, name: 'ArcaneDefender', score: 187230, wave: 65 },
  { rank: 4, name: 'CyberGuardian', score: 156500, wave: 58 },
  { rank: 5, name: 'PhaseHunter', score: 125890, wave: 51 },
  { rank: 6, name: 'StormBreaker', score: 104200, wave: 45 },
  { rank: 7, name: 'FrostWarden', score: 88900, wave: 39 },
  { rank: 8, name: 'ThunderStrike', score: 72100, wave: 34 },
  { rank: 9, name: 'ShadowReaper', score: 58450, wave: 29 },
  { rank: 10, name: 'ChaosKnight', score: 42800, wave: 24 }
];
