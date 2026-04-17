const { createClient } = require('@libsql/client');
const sqlite3 = require('better-sqlite3');
const dotenv = require('dotenv');

dotenv.config();

const localDb = new sqlite3('database.sqlite');
const turso = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const migrateAll = async () => {
    try {
        console.log('--- STARTING CLEAN MIGRATION ---');

        // 1. Wipe current tables to ensure a clean start
        const tables = ['answers', 'leaderboard', 'questions', 'attempts', 'exams', 'users'];
        console.log('Cleaning existing tables...');
        for (const table of tables) {
            try {
                await turso.execute(`DELETE FROM ${table}`);
            } catch (e) {
                console.log(`Table ${table} might not exist or already clean.`);
            }
        }

        // 2. Migrate in order to respect Foreign Key constraints (though we handle them by row)
        // Order: users -> exams -> questions -> attempts -> leaderboard -> answers
        const order = ['users', 'exams', 'questions', 'attempts', 'leaderboard', 'answers'];

        for (const table of order) {
            console.log(`Migrating ${table}...`);
            const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
            
            if (rows.length === 0) {
                console.log(`No data in ${table}, skipping.`);
                continue;
            }

            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(', ');
            const insertSql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

            // Batch them in chunks to avoid large request limits
            const CHUNK_SIZE = 50;
            for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
                const chunk = rows.slice(i, i + CHUNK_SIZE);
                const batch = chunk.map(row => ({
                    sql: insertSql,
                    args: Object.values(row)
                }));
                await turso.batch(batch, "write");
            }
            console.log(`Done migrating ${rows.length} rows to ${table}.`);
        }

        console.log('--- MIGRATION COMPLETE ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        localDb.close();
    }
};

migrateAll();
