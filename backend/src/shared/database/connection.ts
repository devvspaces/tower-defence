import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Use dynamic import or require for postgres to handle CJS/ESM issues
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'tower_defence'}`;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export type Database = typeof db;
