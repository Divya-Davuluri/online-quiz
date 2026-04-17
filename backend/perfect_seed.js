const { createClient } = require('@libsql/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const turso = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const seed = async () => {
    try {
        console.log('--- STARTING PERFECT SEED ---');
        const password = await bcrypt.hash('123456', 10);

        // 1. Clear everything
        console.log('Wiping existing data...');
        for (const table of ['answers', 'leaderboard', 'questions', 'attempts', 'exams', 'users']) {
            await turso.execute(`DELETE FROM ${table}`);
        }

        // 2. Create Users
        console.log('Creating users...');
        const adminId = 'f64030b1-6b89-4549-bf0d-4615298e932c'; // Keep the ID for 'janu'
        const studentId = uuidv4();
        
        await turso.batch([
            {
                sql: 'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                args: [adminId, 'Janu Admin', 'janu123@gmail.com', password, 'admin']
            },
            {
                sql: 'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                args: [studentId, 'Priya Student', 'student@gmail.com', password, 'student']
            }
        ], "write");

        // 3. Create Exams
        console.log('Creating exams...');
        const exam1 = uuidv4();
        const exam2 = uuidv4();
        
        await turso.batch([
            {
                sql: 'INSERT INTO exams (id, title, duration, passingScore, published, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [exam1, 'Full Stack Final Exam', 60, 70, 1, '2026-04-10 09:00:00', '2026-04-20 18:00:00']
            },
            {
                sql: 'INSERT INTO exams (id, title, duration, passingScore, published, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [exam2, 'System Design Interview', 45, 60, 1, '2026-04-12 09:00:00', '2026-04-22 18:00:00']
            }
        ], "write");

        // 4. Create Questions
        console.log('Creating questions...');
        await turso.batch([
            {
                sql: 'INSERT INTO questions (id, examId, questionText, type, marks, options, correctAnswer) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [uuidv4(), exam1, 'What is React?', 'MCQ', 10, JSON.stringify({A:'Library', B:'Framework', C:'Native', D:'Style'}), 'A']
            },
            {
                sql: 'INSERT INTO questions (id, examId, questionText, type, marks, options, correctAnswer) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [uuidv4(), exam1, 'What is Node.js?', 'MCQ', 10, JSON.stringify({A:'Runtime', B:'Language', C:'Library', D:'Tool'}), 'A']
            }
        ], "write");

        // 5. Create Attempts & Results
        console.log('Creating attempts...');
        const attempt1 = uuidv4();
        await turso.execute({
            sql: 'INSERT INTO attempts (id, examId, studentId, startTime, submitTime) VALUES (?, ?, ?, ?, ?)',
            args: [attempt1, exam1, studentId, '2026-04-15 10:00:00', '2026-04-15 10:45:00']
        });

        await turso.execute({
            sql: 'INSERT INTO leaderboard (id, examId, studentId, score, attemptDate) VALUES (?, ?, ?, ?, ?)',
            args: [uuidv4(), exam1, studentId, 20, '2026-04-15 10:45:00']
        });

        console.log('--- PERFECT SEED COMPLETE ---');
    } catch (err) {
        console.error('Seed failed:', err);
    }
};

seed();
