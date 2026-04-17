const { db } = require('./src/models/db');

const showAttempts = async () => {
    try {
        const result = await db.execute(`
            SELECT a.id, u.name as studentName, e.title as examTitle, a.submitTime
            FROM attempts a
            JOIN users u ON a.studentId = u.id
            JOIN exams e ON a.examId = e.id
        `);
        console.log('--- ALL ATTEMPTS IN TURSO ---');
        console.table(result.rows);
    } catch (err) {
        console.error('Failed to fetch attempts:', err);
    }
    process.exit(0);
};

showAttempts();
