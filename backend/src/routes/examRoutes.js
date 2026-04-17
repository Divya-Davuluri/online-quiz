const express = require('express');
const router = express.Router();
const { db } = require('../models/db');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get all published exams
router.get('/published', authMiddleware, async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM exams WHERE published = 1');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific exam details (without answers for students)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const examResult = await db.execute({
            sql: 'SELECT * FROM exams WHERE id = ?',
            args: [req.params.id]
        });
        const exam = examResult.rows[0];
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        const questionsResult = await db.execute({
            sql: 'SELECT id, questionText, type, options, marks FROM questions WHERE examId = ?',
            args: [req.params.id]
        });
        const questions = questionsResult.rows;
        
        // Parse options for MCQ
        questions.forEach(q => {
            if (q.type === 'MCQ' && q.options) {
                try {
                    q.options = JSON.parse(q.options);
                } catch (e) {
                    console.error("Failed to parse options for question", q.id);
                }
            }
        });

        res.json({ ...exam, questions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
