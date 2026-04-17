const express = require('express');
const router = express.Router();
const { db } = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Helper to seed students if none exist
const seedStudentsIfNeeded = async () => {
    const result = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const studentCount = result.rows[0].count;
    
    if (studentCount === 0) {
        console.log('Seeding sample student data...');
        const students = [
            { name: 'Rahul Sharma', email: 'rahul@gmail.com' },
            { name: 'Priya Reddy', email: 'priya@gmail.com' },
            { name: 'Arjun Kumar', email: 'arjun@gmail.com' },
            { name: 'Sneha Patel', email: 'sneha@gmail.com' },
            { name: 'Kiran Kumar', email: 'kiran@gmail.com' }
        ];

        const hashedPassword = await bcrypt.hash('123456', 10);
        const statements = students.map(student => ({
            sql: 'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            args: [uuidv4(), student.name, student.email, hashedPassword, 'student']
        }));
        
        await db.batch(statements, "write");
        console.log('Seeding complete.');
    }
};

router.get('/', async (req, res) => {
    try {
        await seedStudentsIfNeeded();
        
        const result = await db.execute(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.createdAt as joinedDate,
                (SELECT COUNT(*) FROM attempts WHERE studentId = u.id) as examsTaken
            FROM users u 
            WHERE u.role = 'student'
            ORDER BY joinedDate DESC
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
