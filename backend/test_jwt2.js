const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: 'f8b07a6c-7f0e-4d63-921f-6eb1957e6146', role: 'student' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

const http = require('http');
http.get('http://localhost:5000/api/student/global-leaderboard', { headers: { 'Authorization': 'Bearer ' + token } }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});
