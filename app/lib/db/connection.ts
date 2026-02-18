import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Allow build to succeed without DATABASE_URL
// Runtime errors will occur if database is actually used without URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db?sslmode=require';

// Create Neon HTTP client
const sql = neon(DATABASE_URL);

// Create Drizzle instance with schema
export const db = drizzle({ client: sql, schema });
