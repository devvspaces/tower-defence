import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  jsonb,
  text,
  boolean,
  serial,
  real,
  unique,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull().unique(),
  username: varchar('username', { length: 50 }),
  profilePicture: text('profile_picture'),

  // Progression System Fields
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  totalGamesPlayed: integer('total_games_played').notNull().default(0),
  totalEnemiesKilled: integer('total_enemies_killed').notNull().default(0),
  highestWaveReached: integer('highest_wave_reached').notNull().default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  wavesCompleted: integer('waves_completed').notNull(),

  // Game state for replay
  gameState: jsonb('game_state').notNull().$type<GameStateRecord>(),

  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========== PROGRESSION SYSTEM TABLES ==========

export const towerDefinitions = pgTable('tower_definitions', {
  id: serial('id').primaryKey(),
  towerType: varchar('tower_type', { length: 50 }).notNull().unique(),
  baseName: varchar('base_name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  unlockLevel: integer('unlock_level').notNull(),
  baseCost: integer('base_cost').notNull(),
  baseDamage: real('base_damage').notNull(),
  baseRange: real('base_range').notNull(),
  baseFireRate: real('base_fire_rate').notNull(),
  description: text('description'),
  lore: text('lore'),
  icon: varchar('icon', { length: 10 }),
  rarity: varchar('rarity', { length: 20 }).notNull().default('common'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const towerUpgrades = pgTable(
  'tower_upgrades',
  {
    id: serial('id').primaryKey(),
    towerType: varchar('tower_type', { length: 50 })
      .notNull()
      .references(() => towerDefinitions.towerType, { onDelete: 'cascade' }),
    upgradeLevel: integer('upgrade_level').notNull(),
    costMultiplier: real('cost_multiplier').notNull(),
    damageMultiplier: real('damage_multiplier').notNull(),
    rangeMultiplier: real('range_multiplier').notNull(),
    fireRateMultiplier: real('fire_rate_multiplier').notNull(),
    specialBonusType: varchar('special_bonus_type', { length: 50 }),
    specialBonusValue: real('special_bonus_value'),
    unlockPlayerLevel: integer('unlock_player_level').notNull(),
    upgradeCostCurrency: varchar('upgrade_cost_currency', { length: 20 })
      .notNull()
      .default('xp'),
    upgradeCostAmount: integer('upgrade_cost_amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueTowerUpgrade: unique().on(table.towerType, table.upgradeLevel),
  })
);

export const userTowerUnlocks = pgTable(
  'user_tower_unlocks',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    towerType: varchar('tower_type', { length: 50 })
      .notNull()
      .references(() => towerDefinitions.towerType, { onDelete: 'cascade' }),
    unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserTower: unique().on(table.userId, table.towerType),
  })
);

export const userTowerUpgrades = pgTable(
  'user_tower_upgrades',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    towerType: varchar('tower_type', { length: 50 })
      .notNull()
      .references(() => towerDefinitions.towerType, { onDelete: 'cascade' }),
    currentLevel: integer('current_level').notNull().default(1),
    upgradedAt: timestamp('upgraded_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserTowerUpgrade: unique().on(table.userId, table.towerType),
  })
);

export const xpTransactions = pgTable('xp_transactions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  description: text('description'),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const levelRequirements = pgTable('level_requirements', {
  level: integer('level').primaryKey(),
  xpRequired: integer('xp_required').notNull(),
  rewardType: varchar('reward_type', { length: 50 }),
  rewardValue: varchar('reward_value', { length: 100 }),
});

// Type definitions for game state
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
