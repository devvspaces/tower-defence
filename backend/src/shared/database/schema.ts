import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  jsonb,
  text,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull().unique(),
  username: varchar('username', { length: 50 }),
  profilePicture: text('profile_picture'),
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
