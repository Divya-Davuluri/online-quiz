const { db } = require('./src/models/db');
console.log(db.prepare("SELECT id, name, createdAt FROM users WHERE role = 'student'").all());
