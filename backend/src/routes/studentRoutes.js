const express = require('express');
const router = express.Router();
const { db } = require('../models/db');
const { authMiddleware } = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

router.use(authMiddleware);

// Start Exam
router.post('/exams/:id/start', async (req, res) => {
    const studentId = req.user.id;
    const examId = req.params.id;

    try {
        // Check if already attempted
        const result = await db.execute({
            sql: 'SELECT * FROM attempts WHERE studentId = ? AND examId = ?',
            args: [studentId, examId]
        });
        const existingAttempt = result.rows[0];
        
        if (existingAttempt && existingAttempt.submitTime) {
            return res.status(400).json({ message: 'Exam already submitted' });
        }

        if (existingAttempt) {
            return res.json({ attemptId: existingAttempt.id, resume: true });
        }

        const id = uuidv4();
        const startTime = new Date().toISOString();
        await db.execute({
            sql: 'INSERT INTO attempts (id, studentId, examId, startTime) VALUES (?, ?, ?, ?)',
            args: [id, studentId, examId, startTime]
        });

        res.status(201).json({ attemptId: id, resume: false });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save Answer (Auto-save)
router.post('/attempts/:id/save', async (req, res) => {
    const { questionId, answer } = req.body;
    const attemptId = req.params.id;

    try {
        await db.execute({
            sql: `
                INSERT INTO answers (attemptId, questionId, studentAnswer)
                VALUES (?, ?, ?)
                ON CONFLICT(attemptId, questionId) DO UPDATE SET studentAnswer = excluded.studentAnswer
            `,
            args: [attemptId, questionId, typeof answer === 'object' ? JSON.stringify(answer) : answer]
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit Exam
router.post('/attempts/:id/submit', async (req, res) => {
    const attemptId = req.params.id;
    const { autoSubmitted } = req.body;

    try {
        const attemptResult = await db.execute({
            sql: 'SELECT * FROM attempts WHERE id = ?',
            args: [attemptId]
        });
        const attempt = attemptResult.rows[0];
        if (attempt.submitTime) return res.status(400).json({ message: 'Already submitted' });

        const submitTime = new Date().toISOString();
        
        // Calculate score
        const questionsResult = await db.execute({
            sql: 'SELECT id, correctAnswer, marks, type FROM questions WHERE examId = ?',
            args: [attempt.examId]
        });
        const questions = questionsResult.rows;

        const answersResult = await db.execute({
            sql: 'SELECT * FROM answers WHERE attemptId = ?',
            args: [attemptId]
        });
        const answers = answersResult.rows;

        let totalScore = 0;
        const statements = [];

        answers.forEach(ans => {
            const q = questions.find(question => question.id === ans.questionId);
            if (q) {
                let isCorrect = false;
                if (q.type === 'MCQ' || q.type === 'Short Answer') {
                    isCorrect = ans.studentAnswer === q.correctAnswer;
                }
                
                if (isCorrect) {
                  statements.push({
                    sql: 'UPDATE answers SET marksAwarded = ? WHERE attemptId = ? AND questionId = ?',
                    args: [q.marks, attemptId, ans.questionId]
                  });
                  totalScore += q.marks;
                }
            }
        });

        const timeTaken = Math.floor((new Date(submitTime) - new Date(attempt.startTime)) / 1000);

        statements.push({
            sql: 'UPDATE attempts SET submitTime = ?, autoSubmitted = ? WHERE id = ?',
            args: [submitTime, autoSubmitted ? 1 : 0, attemptId]
        });

        // Update Leaderboard
        statements.push({
            sql: `
                INSERT INTO leaderboard (examId, studentId, score, timeTaken)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(examId, studentId) DO UPDATE SET score = excluded.score, timeTaken = excluded.timeTaken
            `,
            args: [attempt.examId, attempt.studentId, totalScore, timeTaken]
        });

        await db.batch(statements, "write");
        res.json({ message: 'Exam submitted', score: totalScore });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Result
router.get('/attempts/:id/result', async (req, res) => {
    try {
        const attemptResult = await db.execute({
            sql: `
                SELECT a.*, e.title, e.passingScore, 
                (SELECT SUM(marksAwarded) FROM answers WHERE attemptId = a.id) as score,
                (SELECT SUM(marks) FROM questions WHERE examId = e.id) as totalMarks
                FROM attempts a
                JOIN exams e ON a.examId = e.id
                WHERE a.id = ?
            `,
            args: [req.params.id]
        });
        const attempt = attemptResult.rows[0];

        const detailsResult = await db.execute({
            sql: `
                SELECT q.questionText, q.type, q.options, q.correctAnswer, q.explanation, q.marks,
                ans.studentAnswer, ans.marksAwarded
                FROM questions q
                LEFT JOIN answers ans ON q.id = ans.questionId AND ans.attemptId = ?
                WHERE q.examId = ?
            `,
            args: [req.params.id, attempt.examId]
        });

        res.json({ attempt, details: detailsResult.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Global Leaderboard
router.get('/global-leaderboard', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT u.id, u.name, SUM(l.score) as totalScore, SUM(l.timeTaken) as totalTime, COUNT(l.examId) as examsTaken
            FROM leaderboard l
            JOIN users u ON l.studentId = u.id
            GROUP BY u.id
            ORDER BY totalScore DESC, totalTime ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Specific Exam Leaderboard
router.get('/exams/:id/leaderboard', async (req, res) => {
    try {
        const result = await db.execute({
            sql: `
                SELECT u.name, l.score, l.timeTaken
                FROM leaderboard l
                JOIN users u ON l.studentId = u.id
                WHERE l.examId = ?
                ORDER BY l.score DESC, l.timeTaken ASC
            `,
            args: [req.params.id]
        });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Download Result as PDF
router.get('/attempts/:id/pdf', async (req, res) => {
    const PDFDocument = require('pdfkit');
    try {
        const attemptResult = await db.execute({
            sql: `
                SELECT a.*, e.title, e.passingScore, u.name as studentName,
                (SELECT SUM(marksAwarded) FROM answers WHERE attemptId = a.id) as score,
                (SELECT SUM(marks) FROM questions WHERE examId = e.id) as totalMarks
                FROM attempts a
                JOIN exams e ON a.examId = e.id
                JOIN users u ON a.studentId = u.id
                WHERE a.id = ?
            `,
            args: [req.params.id]
        });
        const attempt = attemptResult.rows[0];

        if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=result_${attempt.id}.pdf`);
        doc.pipe(res);

        doc.fontSize(25).text('Exam Result Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Student Name: ${attempt.studentName}`);
        doc.text(`Exam Title: ${attempt.title}`);
        doc.text(`Score: ${attempt.score} / ${attempt.totalMarks}`);
        doc.text(`Percentage: ${Math.round((attempt.score / (attempt.totalMarks || 1)) * 100)}%`);
        doc.text(`Status: ${attempt.score >= (attempt.totalMarks * attempt.passingScore / 100) ? 'PASSED' : 'FAILED'}`);
        doc.moveDown();

        doc.fontSize(16).text('Question Details:', { underline: true });
        doc.moveDown();

        const detailsResult = await db.execute({
            sql: `
                SELECT q.questionText, ans.studentAnswer, q.correctAnswer, ans.marksAwarded, q.marks
                FROM questions q
                LEFT JOIN answers ans ON q.id = ans.questionId AND ans.attemptId = ?
                WHERE q.examId = ?
            `,
            args: [req.params.id, attempt.examId]
        });

        detailsResult.rows.forEach((q, i) => {
            doc.fontSize(12).text(`${i + 1}. ${q.questionText}`);
            doc.fontSize(10).text(`   Your Answer: ${q.studentAnswer || 'N/A'}`);
            doc.text(`   Correct Answer: ${q.correctAnswer}`);
            doc.text(`   Marks: ${q.marksAwarded} / ${q.marks}`);
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Dashboard Stats
router.get('/dashboard-stats', async (req, res) => {
    const studentId = req.user.id;
    try {
        const examsTakenCountResult = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM attempts WHERE studentId = ? AND submitTime IS NOT NULL',
            args: [studentId]
        });
        const examsTaken = examsTakenCountResult.rows[0].count;
        
        const resultsResult = await db.execute({
            sql: `
                SELECT a.id, e.title as examTitle, a.submitTime,
                (SELECT SUM(marksAwarded) FROM answers WHERE attemptId = a.id) as score,
                (SELECT SUM(marks) FROM questions WHERE examId = e.id) as totalMarks
                FROM attempts a
                JOIN exams e ON a.examId = e.id
                WHERE a.studentId = ? AND a.submitTime IS NOT NULL
                ORDER BY a.submitTime DESC
            `,
            args: [studentId]
        });
        const results = resultsResult.rows;

        let averageScore = 0;
        if (results.length > 0) {
            const totalPercent = results.reduce((acc, r) => acc + (r.score / (r.totalMarks || 1)), 0);
            averageScore = Math.round((totalPercent / results.length) * 100);
        }

        const ranksResult = await db.execute(`
            SELECT examId, studentId, score, 
            RANK() OVER (PARTITION BY examId ORDER BY score DESC) as rank
            FROM leaderboard
        `);
        const ranks = ranksResult.rows;
        
        const studentRanks = ranks.filter(r => r.studentId === studentId);
        const rank = studentRanks.length > 0 
            ? Math.round(studentRanks.reduce((acc, r) => acc + r.rank, 0) / studentRanks.length) 
            : 0;

        res.json({ averageScore, examsTaken, rank, pastResults: results.slice(0, 5) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// All Past Results
router.get('/all-results', async (req, res) => {
    const studentId = req.user.id;
    try {
        const result = await db.execute({
            sql: `
                SELECT a.id, e.title as examTitle, a.submitTime,
                (SELECT SUM(marksAwarded) FROM answers WHERE attemptId = a.id) as score,
                (SELECT SUM(marks) FROM questions WHERE examId = e.id) as totalMarks
                FROM attempts a
                JOIN exams e ON a.examId = e.id
                WHERE a.studentId = ? AND a.submitTime IS NOT NULL
                ORDER BY a.submitTime DESC
            `,
            args: [studentId]
        });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
