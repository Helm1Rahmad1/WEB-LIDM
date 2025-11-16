import { Pool } from 'pg';

console.log('[Database] Initializing database connection...');
console.log('[Database] Using DATABASE_URL:', !!process.env.DATABASE_URL);
console.log('[Database] DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('[Database] DB_NAME:', process.env.DB_NAME || 'lidm');
console.log('[Database] DB_USER:', process.env.DB_USER || 'postgres');

// Support DATABASE_URL or individual connection params
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' 
          ? { rejectUnauthorized: false } 
          : false
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'lidm',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      }
);

// Test connection on startup
pool.on('connect', () => {
  console.log('[Database] ✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('[Database] ❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Test query on startup
(async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('[Database] ✅ Connection test successful');
    console.log('[Database] Current time:', res.rows[0].current_time);
    console.log('[Database] Database name:', res.rows[0].db_name);
  } catch (err) {
    console.error('[Database] ❌ Connection test failed:', err);
    console.error('[Database] Please check your database configuration');
  }
})();

export default pool;
