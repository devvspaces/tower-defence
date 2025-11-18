import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import { towerDefinitionsSeed } from './001_tower_definitions.seed';
import { towerUpgradesSeed } from './002_tower_upgrades.seed';
import { levelRequirementsSeed } from './003_level_requirements.seed';

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  // Setup database connection
  const connectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'tower_defence'}`;

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    // 1. Seed Tower Definitions
    console.log('📦 Seeding tower definitions...');
    await db.insert(schema.towerDefinitions).values(towerDefinitionsSeed);
    console.log(`✅ Inserted ${towerDefinitionsSeed.length} tower definitions\n`);

    // 2. Seed Tower Upgrades
    console.log('⬆️  Seeding tower upgrades...');
    await db.insert(schema.towerUpgrades).values(towerUpgradesSeed);
    console.log(`✅ Inserted ${towerUpgradesSeed.length} tower upgrades\n`);

    // 3. Seed Level Requirements
    console.log('📊 Seeding level requirements...');
    await db.insert(schema.levelRequirements).values(levelRequirementsSeed);
    console.log(`✅ Inserted ${levelRequirementsSeed.length} level requirements\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`  - ${towerDefinitionsSeed.length} tower definitions`);
    console.log(`  - ${towerUpgradesSeed.length} tower upgrades`);
    console.log(`  - ${levelRequirementsSeed.length} level requirements`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeder
seed()
  .then(() => {
    console.log('\n✨ Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding process failed:', error);
    process.exit(1);
  });
