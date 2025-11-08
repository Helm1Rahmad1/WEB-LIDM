import pool from './config/database';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DB Config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    });

    const client = await pool.connect();
    console.log('✓ Successfully connected to database!');

    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✓ Database time:', result.rows[0].now);

    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n✓ Available tables:');
    tables.rows.forEach((row: any) => {
      console.log('  -', row.table_name);
    });

    client.release();
    console.log('\n✓ All database checks passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
