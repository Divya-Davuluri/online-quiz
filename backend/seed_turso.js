const { db } = require('./src/models/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedInitialData = async () => {
    try {
        console.log('Seeding comprehensive test accounts...');
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        const accounts = [
            { name: 'Admin One', email: 'admin@gmail.com', role: 'admin' },
            { name: 'Admin Two', email: 'admin123@gmail.com', role: 'admin' },
            { name: 'Student One', email: 'student@gmail.com', role: 'student' },
            { name: 'Student Two', email: 'student123@gmail.com', role: 'student' },
            { name: 'Ajay Admin', email: 'ajay@gmail.com', role: 'admin' },
            { name: 'Ajay Student', email: 'ajay.student@gmail.com', role: 'student' }
        ];

        const statements = accounts.map(acc => ({
            sql: 'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING',
            args: [uuidv4(), acc.name, acc.email, hashedPassword, acc.role]
        }));
        
        await db.batch(statements, "write");
        console.log('Seed successful! All accounts updated with password: 123456');
    } catch (err) {
        console.error('Seed failed:', err);
    }
    process.exit(0);
};

seedInitialData();
