const { db } = require('./src/models/db');

const testStats = async () => {
    try {
        const now = new Date().toISOString();
        const examsCount = (await db.execute('SELECT COUNT(*) as count FROM exams')).rows[0].count;
        const studentsCount = (await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'")).rows[0].count;
        const submissionsCount = (await db.execute('SELECT COUNT(*) as count FROM attempts WHERE submitTime IS NOT NULL')).rows[0].count;
        const ongoingCount = (await db.execute({
            sql: 'SELECT COUNT(*) as count FROM exams WHERE startTime <= ? AND endTime >= ?',
            args: [now, now]
        })).rows[0].count;
        
        console.log('--- DB STATS DIAGNOSTIC ---');
        console.log('Exams:', examsCount);
        console.log('Students:', studentsCount);
        console.log('Submissions:', submissionsCount);
        console.log('Ongoing:', ongoingCount);
    } catch (err) {
        console.error('Stats failed:', err);
    }
    process.exit(0);
};

testStats();
