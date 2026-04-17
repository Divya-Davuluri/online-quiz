const { db } = require('./src/models/db');
console.log(db.prepare("SELECT * FROM users WHERE name='ajay'").get());
