const { db } = require('./src/models/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function seedAlive() {
    console.log("Seeding an 'alive' environment for reports...");
    
    try {
        // 1. Ensure a modern exam exists
        const examId = uuidv4();
        const now = new Date();
        const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // Yesterday
        const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
        
        db.prepare('INSERT INTO exams (id, title, duration, passingScore, startTime, endTime, published) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            examId, 'React & Node.js Architecture', 60, 70, startTime, endTime, 1
        );

        // 2. Add Questions
        const q1Id = uuidv4();
        const q2Id = uuidv4();
        db.prepare('INSERT INTO questions (id, examId, questionText, type, options, correctAnswer, marks) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            q1Id, examId, 'What is the virtual DOM?', 'MCQ', JSON.stringify({A: 'A real DOM', B: 'A lightweight copy of the real DOM', C: 'A browser plugin', D: 'A CSS property'}), 'B', 5
        );
        db.prepare('INSERT INTO questions (id, examId, questionText, type, options, correctAnswer, marks) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            q2Id, examId, 'Which of these is a Node.js framework?', 'MCQ', JSON.stringify({A: 'Django', B: 'Laravel', C: 'Express', D: 'Flask'}), 'C', 5
        );

        // 3. Get Students (from previous seed)
        const students = db.prepare("SELECT id, name FROM users WHERE role = 'student' LIMIT 2").all();
        if (students.length < 2) {
            console.log("Not enough students. Please run the original seed first.");
            return;
        }

        // 4. Seed Attempts & Answers
        const seedAttempt = (studentId, studentName, q1Ans, q2Ans, q1Marks, q2Marks) => {
            const attemptId = uuidv4();
            const submitTime = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
            
            db.prepare('INSERT INTO attempts (id, studentId, examId, startTime, submitTime) VALUES (?, ?, ?, ?, ?)').run(
                attemptId, studentId, examId, startTime, submitTime
            );

            db.prepare('INSERT INTO answers (attemptId, questionId, studentAnswer, marksAwarded) VALUES (?, ?, ?, ?)').run(
                attemptId, q1Id, q1Ans, q1Marks
            );
            db.prepare('INSERT INTO answers (attemptId, questionId, studentAnswer, marksAwarded) VALUES (?, ?, ?, ?)').run(
                attemptId, q2Id, q2Ans, q2Marks
            );

            // Update Leaderboard
            db.prepare('INSERT INTO leaderboard (examId, studentId, score, timeTaken) VALUES (?, ?, ?, ?)').run(
                examId, studentId, q1Marks + q2Marks, 1800
            );
            console.log(`Generated report for ${studentName}`);
        };

        // Rahul: Perfect score
        seedAttempt(students[0].id, students[0].name, 'B', 'C', 5, 5);
        // Priya: Half score
        seedAttempt(students[1].id, students[1].name, 'B', 'D', 5, 0);

        console.log("Success: Reports/Attempts seeded.");
    } catch (err) {
        console.error("Seeding Error:", err.message);
    }
}

seedAlive();
