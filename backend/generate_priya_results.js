const { db } = require('./src/models/db');
const { v4: uuidv4 } = require('uuid');

const generatePriyaHistory = async () => {
    try {
        const userRes = await db.execute("SELECT id FROM users WHERE email = 'priya123@gmail.com'");
        const userId = userRes.rows[0].id;
        
        const exams = [
            { id: 'cd8b4fd1-2e41-4e2b-84dd-b2dca1256cd3', title: 'lab exam', score: 45, total: 50 },
            { id: 'c3010b65-72c1-47a4-aa59-72f3326460a7', title: 'biology', score: 25, total: 50 },
            { id: '7d191f8f-0312-4ca0-97a2-47c089ba22e2', title: 'quiz exam', score: 18, total: 20 }
        ];

        for (const ex of exams) {
            const attemptId = uuidv4();
            const now = new Date();
            const startTime = new Date(now.getTime() - 3600000).toISOString();
            const submitTime = now.toISOString();

            console.log(`Generating result for ${ex.title}...`);
            await db.execute({
                sql: "INSERT INTO attempts (id, studentId, examId, startTime, submitTime) VALUES (?, ?, ?, ?, ?)",
                args: [attemptId, userId, ex.id, startTime, submitTime]
            });

            // Add to leaderboard
            await db.execute({
                sql: "INSERT INTO leaderboard (examId, studentId, score, timeTaken) VALUES (?, ?, ?, ?)",
                args: [ex.id, userId, ex.score, 3600]
            });
            
            // Add a placeholder answer so score stays aggregated
            // First find a question for this exam
            const qRes = await db.execute({
                sql: "SELECT id FROM questions WHERE examId = ? LIMIT 1",
                args: [ex.id]
            });
            if (qRes.rows.length > 0) {
                await db.execute({
                    sql: "INSERT INTO answers (attemptId, questionId, studentAnswer, marksAwarded) VALUES (?, ?, ?, ?)",
                    args: [attemptId, qRes.rows[0].id, 'Seeded Answer', ex.score]
                });
            }
        }
        
        console.log('Successfully generated completed results for Priya!');
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
};

generatePriyaHistory();
