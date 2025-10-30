import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

async function applyMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    const sql = fs.readFileSync('./migrations/0000_organic_dagger.sql', 'utf8');

    // Remove statement breakpoints
    const cleanSql = sql.replace(/-->\s*statement-breakpoint\s*/g, '');

    console.log('Applying migration...');
    await pool.query(cleanSql);
    console.log('Migration applied successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
