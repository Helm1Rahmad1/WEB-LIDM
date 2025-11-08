import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Connect to postgres database first
  user: 'postgres',
  password: 'postgres',
});

async function testConnection() {
  try {
    console.log('Connecting to postgres database...');
    const client = await pool.connect();
    console.log('✓ Connected!');
    
    // Check databases
    const result = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false;
    `);
    
    console.log('\nAvailable databases:');
    result.rows.forEach((row: any) => {
      console.log('  -', row.datname);
    });
    
    client.release();
    
    // Now try to connect to lidm database
    console.log('\nTrying to connect to lidm database...');
    const pool2 = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'lidm',
      user: 'postgres',
      password: 'postgres',
    });
    
    const client2 = await pool2.connect();
    console.log('✓ Connected to lidm database!');
    
    const tables = await client2.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\nTables in lidm:');
    tables.rows.forEach((row: any) => {
      console.log('  -', row.table_name);
    });
    
    client2.release();
    await pool2.end();
    await pool.end();
    
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

testConnection();
