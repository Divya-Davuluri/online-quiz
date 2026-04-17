const { db } = require('./src/models/db');
const { v4: uuidv4 } = require('uuid');

const seedMissingQuestions = async () => {
    try {
        const examsRes = await db.execute("SELECT id, title FROM exams");
        const exams = examsRes.rows;

        for (const exam of exams) {
            const qCountRes = await db.execute({
                sql: "SELECT COUNT(*) as count FROM questions WHERE examId = ?",
                args: [exam.id]
            });
            
            if (qCountRes.rows[0].count === 0) {
                console.log(`Seeding questions for: ${exam.title}...`);
                const statements = [
                    {
                        sql: "INSERT INTO questions (id, examId, questionText, type, options, correctAnswer, marks) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        args: [uuidv4(), exam.id, `What is the primary study of ${exam.title}?`, 'MCQ', JSON.stringify({ A: 'Cells', B: 'Planets', C: 'Equations', D: 'History' }), 'A', 5]
                    },
                    {
                        sql: "INSERT INTO questions (id, examId, questionText, type, options, correctAnswer, marks) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        args: [uuidv4(), exam.id, `Explain the importance of ${exam.title} in modern science.`, 'Short Answer', null, 'It helps in understanding complex systems.', 10]
                    }
                ];
                await db.batch(statements, "write");
            }
        }
        console.log('All empty exams have been seeded with questions!');
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
};

seedMissingQuestions();
