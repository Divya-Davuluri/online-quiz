const { db } = require('./src/models/db');
try {
    const tableInfo = db.prepare('PRAGMA table_info(users)').all();
    const hasCreatedAt = tableInfo.some(c => c.name === 'createdAt');
    
    if (!hasCreatedAt) {
        db.exec('ALTER TABLE users ADD COLUMN createdAt DATETIME');
        db.exec("UPDATE users SET createdAt = datetime('now') WHERE createdAt IS NULL");
        console.log('Migration SUCCESS: users.createdAt added.');
    } else {
        console.log('Migration SKIP: users.createdAt already exists.');
    }
} catch (err) {
    console.error('Migration FAILED:', err.message);
}
