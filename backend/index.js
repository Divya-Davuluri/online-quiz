require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDb } = require('./src/models/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Initialize DB
(async () => {
    try {
        await initDb();
        console.log('--- DATABASE STATUS ---');
        console.log('Mode:', process.env.TURSO_URL ? 'Cloud (Turso)' : 'Local (SQLite)');
        console.log('URL:', process.env.TURSO_URL || 'Local File');
        console.log('-----------------------');
    } catch (err) {
        console.error('Database failed to initialize:', err);
    }
})();

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/student', require('./src/routes/studentRoutes'));
app.use('/api/students', require('./src/routes/students')); // New route
app.use('/api/exams', require('./src/routes/examRoutes'));

app.get('/api/debug-db', async (req, res) => {
    try {
        const exams = await db.execute('SELECT COUNT(*) as c FROM exams');
        const users = await db.execute('SELECT COUNT(*) as c FROM users');
        res.json({
            status: 'connected',
            exams: exams.rows[0].c,
            users: users.rows[0].c,
            db_type: 'Turso/LibSQL'
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Online Quiz & Exam Platform API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => { process.exit(0); });
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
