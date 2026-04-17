const { createClient } = require('@libsql/client');
require('dotenv').config();

const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize tables
const initDb = async () => {
    try {
        await db.batch([
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin', 'student')) DEFAULT 'student',
                profilePhoto TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS exams (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                duration INTEGER NOT NULL,
                passingScore INTEGER NOT NULL,
                startTime DATETIME NOT NULL,
                endTime DATETIME NOT NULL,
                published BOOLEAN DEFAULT 0
            )`,
            `CREATE TABLE IF NOT EXISTS questions (
                id TEXT PRIMARY KEY,
                examId TEXT NOT NULL,
                questionText TEXT NOT NULL,
                type TEXT CHECK(type IN ('MCQ', 'Short Answer', 'Coding')) NOT NULL,
                options TEXT,
                correctAnswer TEXT,
                explanation TEXT,
                marks INTEGER NOT NULL,
                FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE
            )`,
            `CREATE TABLE IF NOT EXISTS attempts (
                id TEXT PRIMARY KEY,
                studentId TEXT NOT NULL,
                examId TEXT NOT NULL,
                startTime DATETIME NOT NULL,
                submitTime DATETIME,
                autoSubmitted BOOLEAN DEFAULT 0,
                FOREIGN KEY (studentId) REFERENCES users(id),
                FOREIGN KEY (examId) REFERENCES exams(id)
            )`,
            `CREATE TABLE IF NOT EXISTS answers (
                attemptId TEXT NOT NULL,
                questionId TEXT NOT NULL,
                studentAnswer TEXT,
                marksAwarded INTEGER DEFAULT 0,
                PRIMARY KEY (attemptId, questionId),
                FOREIGN KEY (attemptId) REFERENCES attempts(id) ON DELETE CASCADE,
                FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
            )`,
            `CREATE TABLE IF NOT EXISTS leaderboard (
                examId TEXT NOT NULL,
                studentId TEXT NOT NULL,
                score INTEGER NOT NULL,
                timeTaken INTEGER NOT NULL,
                rank INTEGER,
                PRIMARY KEY (examId, studentId),
                FOREIGN KEY (examId) REFERENCES exams(id),
                FOREIGN KEY (studentId) REFERENCES users(id)
            )`
        ], "write");
        console.log("Turso Database initialized successfully");
    } catch (err) {
        console.error("Error initializing Turso Database:", err);
    }
};

module.exports = { db, initDb };
