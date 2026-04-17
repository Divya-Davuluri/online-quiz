const express = require('express');
const router = express.Router();
const { db } = require('../models/db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const ExcelJS = require('exceljs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

// Download Excel Template (Public)
router.get('/template', async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Questions Template');
    
    sheet.columns = [
        { header: 'questionText', key: 'questionText', width: 40 },
        { header: 'type', key: 'type', width: 15 },
        { header: 'optionA', key: 'optionA', width: 20 },
        { header: 'optionB', key: 'optionB', width: 20 },
        { header: 'optionC', key: 'optionC', width: 20 },
        { header: 'optionD', key: 'optionD', width: 20 },
        { header: 'correctAnswer', key: 'correctAnswer', width: 15 },
        { header: 'marks', key: 'marks', width: 10 },
        { header: 'explanation', key: 'explanation', width: 30 }
    ];

    sheet.addRow(['What is the capital of France?', 'MCQ', 'Paris', 'London', 'Berlin', 'Madrid', 'A', 5, 'Paris is the capital.']);
    sheet.addRow(['Explain Big O notation.', 'Short Answer', '', '', '', '', 'It scales per input size.', 10, 'Efficiency measure.']);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=exam_template.xlsx');

    await workbook.xlsx.write(res);
    res.end();
});

router.use(authMiddleware);
router.use(adminMiddleware);

// Fetch all exams for admin
router.get('/all-exams', async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM exams ORDER BY startTime DESC');
        console.log(`Fetched ${result.rows.length} exams for admin`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all exams:', err);
        res.status(500).json({ message: err.message });
    }
});


// Exam Management
router.post('/exams', async (req, res) => {
    const { title, duration, passingScore, startTime, endTime } = req.body;
    
    if (!title || !duration || !passingScore) {
        return res.status(400).json({ message: 'Title, Duration and Passing Score are mandatory fields.' });
    }

    const id = uuidv4();
    try {
        await db.execute({
            sql: 'INSERT INTO exams (id, title, duration, passingScore, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?)',
            args: [id, title, parseInt(duration), parseInt(passingScore), startTime, endTime]
        });
        res.status(201).json({ id, title, message: 'Exam protocol established successfully' });
    } catch (err) {
        console.error('Database Error during exam creation:', err);
        res.status(500).json({ message: err.message });
    }
});

router.put('/exams/:id/publish', async (req, res) => {
    try {
        await db.execute({
            sql: 'UPDATE exams SET published = 1 WHERE id = ?',
            args: [req.params.id]
        });
        res.json({ message: 'Exam published successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/exams/:id', async (req, res) => {
    try {
        await db.execute({
            sql: 'DELETE FROM exams WHERE id = ? AND published = 0',
            args: [req.params.id]
        });
        res.json({ message: 'Exam deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Question Management
router.post('/exams/:id/questions', async (req, res) => {
    const { questionText, type, options, correctAnswer, explanation, marks } = req.body;
    const questionId = uuidv4();
    try {
        await db.execute({
            sql: 'INSERT INTO questions (id, examId, questionText, type, options, correctAnswer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            args: [questionId, req.params.id, questionText, type, type === 'MCQ' ? JSON.stringify(options) : options, correctAnswer, explanation, marks]
        });
        res.status(201).json({ id: questionId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Student Management
router.get('/students', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT u.id, u.name, u.email, u.createdAt,
            (SELECT COUNT(*) FROM attempts WHERE studentId = u.id) as examsTaken
            FROM users u WHERE role = 'student'
            ORDER BY u.createdAt DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/students/:id', async (req, res) => {
    try {
        const studentResult = await db.execute({
            sql: 'SELECT id, name, email, createdAt, profilePhoto FROM users WHERE id = ?',
            args: [req.params.id]
        });
        const student = studentResult.rows[0];
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const attemptsResult = await db.execute({
            sql: `
                SELECT a.id, e.title as examTitle, a.startTime, a.submitTime,
                (SELECT SUM(marksAwarded) FROM answers WHERE attemptId = a.id) as score
                FROM attempts a
                JOIN exams e ON a.examId = e.id
                WHERE a.studentId = ?
                ORDER BY a.startTime DESC
            `,
            args: [req.params.id]
        });

        res.json({ ...student, attempts: attemptsResult.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/students/:id', async (req, res) => {
    try {
        await db.execute({
            sql: 'DELETE FROM users WHERE id = ? AND role = "student"',
            args: [req.params.id]
        });
        res.json({ success: true, message: 'Student account terminated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Manual Grading
router.post('/attempts/:id/grade', async (req, res) => {
    const grades = req.body; // { questionId: marks }
    const attemptId = req.params.id;

    try {
        const statements = Object.entries(grades).map(([qId, marks]) => ({
            sql: 'UPDATE answers SET marksAwarded = ? WHERE attemptId = ? AND questionId = ?',
            args: [marks, attemptId, qId]
        }));
        
        await db.batch(statements, "write");
        
        // Recalculate leaderboard score
        const totalResult = await db.execute({
            sql: 'SELECT SUM(marksAwarded) as total FROM answers WHERE attemptId = ?',
            args: [attemptId]
        });
        const score = totalResult.rows[0].total;

        const attemptResult = await db.execute({
            sql: 'SELECT studentId, examId FROM attempts WHERE id = ?',
            args: [attemptId]
        });
        const attempt = attemptResult.rows[0];
        
        await db.execute({
            sql: 'UPDATE leaderboard SET score = ? WHERE examId = ? AND studentId = ?',
            args: [score, attempt.examId, attempt.studentId]
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Dashboard Stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        const now = new Date().toISOString();
        const examsCount = (await db.execute('SELECT COUNT(*) as count FROM exams')).rows[0].count;
        const studentsCount = (await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'")).rows[0].count;
        const submissionsCount = (await db.execute('SELECT COUNT(*) as count FROM attempts WHERE submitTime IS NOT NULL')).rows[0].count;
        const ongoingCount = (await db.execute({
            sql: 'SELECT COUNT(*) as count FROM exams WHERE startTime <= ? AND endTime >= ?',
            args: [now, now]
        })).rows[0].count;
        
        const recentSubmissions = (await db.execute(`
            SELECT a.id, u.name as studentName, e.title as examTitle, a.submitTime
            FROM attempts a
            JOIN users u ON a.studentId = u.id
            JOIN exams e ON a.examId = e.id
            WHERE a.submitTime IS NOT NULL
            ORDER BY a.submitTime DESC LIMIT 5
        `)).rows;

        const monthlyStats = (await db.execute(`
            SELECT strftime('%m', startTime) as month, COUNT(*) as count 
            FROM exams 
            GROUP BY month 
            ORDER BY month ASC
        `)).rows;

        res.json({ 
            totalExams: examsCount, 
            totalStudents: studentsCount, 
            totalSubmissions: submissionsCount, 
            ongoingExams: ongoingCount, 
            recentSubmissions, 
            monthlyStats 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Detailed Exam Stats
router.get('/exams/:id/stats', async (req, res) => {
    try {
        const statsResult = await db.execute({
            sql: `
                SELECT 
                    COUNT(*) as totalAttempts,
                    AVG(score) as avgScore,
                    MAX(score) as highLevel
                FROM leaderboard
                WHERE examId = ?
            `,
            args: [req.params.id]
        });
        const stats = statsResult.rows[0];

        const activeResult = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM attempts WHERE examId = ? AND submitTime IS NULL',
            args: [req.params.id]
        });
        const activeStudents = activeResult.rows[0].count;

        const scoreDistribution = (await db.execute({
            sql: `
                SELECT CAST(score AS INT) / 10 * 10 as bucket, COUNT(*) as count
                FROM leaderboard
                WHERE examId = ?
                GROUP BY bucket
            `,
            args: [req.params.id]
        })).rows;

        res.json({ ...stats, activeStudents, scoreDistribution });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Export Exam Questions as PDF
router.get('/exams/:id/export-pdf', async (req, res) => {
    try {
        const examResult = await db.execute({
            sql: 'SELECT * FROM exams WHERE id = ?',
            args: [req.params.id]
        });
        const exam = examResult.rows[0];

        const questionsResult = await db.execute({
            sql: 'SELECT * FROM questions WHERE examId = ?',
            args: [req.params.id]
        });
        const questions = questionsResult.rows;

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${exam.title.replace(/\s+/g, '_')}_Questions.pdf`);

        doc.pipe(res);
        doc.fontSize(25).text(exam.title, { align: 'center' });
        doc.fontSize(12).text(`Duration: ${exam.duration} mins | Passing Score: ${exam.passingScore}%`, { align: 'center' });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        questions.forEach((q, index) => {
            doc.fontSize(14).font('Helvetica-Bold').text(`Question ${index + 1} (${q.marks} Marks)`);
            doc.fontSize(12).font('Helvetica').text(q.questionText);
            
            if (q.type === 'MCQ') {
                const options = JSON.parse(q.options);
                Object.entries(options).forEach(([key, val]) => {
                    doc.text(`${key}) ${val}`, { indent: 20 });
                });
            }
            doc.moveDown();
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Import Questions from Excel
router.post('/exams/:id/import', upload.single('file'), async (req, res) => {
    const examId = req.params.id;
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const sheet = workbook.getWorksheet(1);
        
        const questions = [];
        sheet.eachRow((row, index) => {
            if (index === 1) return;
            const values = row.values;
            const text = values[1];
            const type = values[2];
            const a = values[3];
            const b = values[4];
            const c = values[5];
            const d = values[6];
            const correct = values[7];
            const marks = values[8];
            const explanation = values[9];

            questions.push({
                id: uuidv4(),
                examId,
                questionText: text,
                type: type || 'MCQ',
                marks: parseInt(marks) || 5,
                options: JSON.stringify({ A: a, B: b, C: c, D: d }),
                correctAnswer: correct,
                explanation: explanation
            });
        });

        const statements = questions.map(q => ({
            sql: `INSERT INTO questions (id, examId, questionText, type, marks, options, correctAnswer, explanation)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [q.id, q.examId, q.questionText, q.type, q.marks, q.options, q.correctAnswer, q.explanation]
        }));

        await db.batch(statements, "write");
        res.json({ message: `${questions.length} questions imported successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reports
router.get('/reports', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT 
                a.id as attemptId, 
                u.name as studentName, 
                u.email as studentEmail, 
                e.title as examTitle, 
                e.passingScore,
                (SELECT SUM(marksAwarded) FROM answers WHERE attemptId = a.id) as score,
                (SELECT SUM(marks) FROM questions WHERE examId = e.id) as totalMarks,
                a.submitTime
            FROM attempts a
            JOIN users u ON a.studentId = u.id
            JOIN exams e ON a.examId = e.id
            WHERE a.submitTime IS NOT NULL
            ORDER BY a.submitTime DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
