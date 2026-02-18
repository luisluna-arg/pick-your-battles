import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Running migrations...');

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sql });

  await migrate(db, { migrationsFolder: './lib/db/migrations' });

  console.log('Migrations completed successfully!');
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
