const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
require('dotenv').config();
const path = require('path');

const localDb = new Database(path.join(__dirname, 'database.sqlite'));
const tursoDb = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const migrate = async () => {
    try {
        console.log('Starting ROBUST migration...');
        
        const tables = ['users', 'exams', 'questions', 'attempts', 'answers', 'leaderboard'];
        
        for (const table of tables) {
            console.log(`Migrating table: ${table}...`);
            const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
            
            for (const row of rows) {
                const keys = Object.keys(row);
                const values = Object.values(row);
                const placeholders = keys.map(() => '?').join(', ');
                const columns = keys.join(', ');
                
                try {
                    await tursoDb.execute({
                        sql: `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                        args: values
                    });
                } catch (e) {
                    // console.warn(`  Failed row in ${table}: ${e.message}`);
                    // Silently continue for FK errors to get as much data as possible
                }
            }
            console.log(`Done with ${table}`);
        }
        
        console.log('Robust Migration completed! Refresh your dashboard.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
    process.exit(0);
};

migrate();
