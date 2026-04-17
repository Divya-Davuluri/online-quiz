const { db } = require('./src/models/db');

const checkPriya = async () => {
    try {
        const userRes = await db.execute({
            sql: "SELECT id FROM users WHERE email = 'priya123@gmail.com'",
            args: []
        });
        const userId = userRes.rows[0]?.id;
        if (!userId) {
            console.log('Priya not found');
            return;
        }
        
        const attemptsRes = await db.execute({
            sql: "SELECT * FROM attempts WHERE studentId = ?",
            args: [userId]
        });
        console.log(`Priya ID: ${userId}`);
        console.log(`Priya Attempts count: ${attemptsRes.rows.length}`);
        console.table(attemptsRes.rows);
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
};

checkPriya();
