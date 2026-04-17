const { db } = require('./src/models/db');

const checkUsers = async () => {
    try {
        const result = await db.execute("SELECT name, email, role FROM users");
        console.log('Current Users in Turso:', result.rows);
    } catch (err) {
        console.error('Check failed:', err);
    }
    process.exit(0);
};

checkUsers();
