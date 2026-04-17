const { db } = require('./src/models/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log('--- Database Seeding Script ---');
    
    try {
        const students = [
            { name: 'Rahul Sharma', email: 'rahul@gmail.com' },
            { name: 'Priya Reddy', email: 'priya@gmail.com' },
            { name: 'Arjun Kumar', email: 'arjun@gmail.com' },
            { name: 'Sneha Patel', email: 'sneha@gmail.com' },
            { name: 'Kiran Kumar', email: 'kiran@gmail.com' }
        ];

        const hashedPassword = await bcrypt.hash('123456', 10);
        const insert = db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)');
        const check = db.prepare('SELECT id FROM users WHERE email = ?');
        
        let seededCount = 0;
        db.transaction(() => {
            for (const student of students) {
                const existing = check.get(student.email);
                if (!existing) {
                    insert.run(uuidv4(), student.name, student.email, hashedPassword, 'student');
                    seededCount++;
                }
            }
        })();

        console.log(`Seeding complete. Added ${seededCount} new students.`);
        process.exit(0);
    } catch (err) {
        console.error('Seeding faulty:', err);
        process.exit(1);
    }
}

seed();
