const { db } = require('./src/models/db');
console.log(db.prepare(`
    SELECT a.id, e.title as examTitle, a.submitTime,
    (SELECT SUM(marksAwarded) FROM answers WHERE attemptId = a.id) as score,
    (SELECT SUM(marks) FROM questions WHERE examId = e.id) as totalMarks
    FROM attempts a
    JOIN exams e ON a.examId = e.id
    WHERE a.studentId = ? AND a.submitTime IS NOT NULL
    ORDER BY a.submitTime DESC
`).all('f8b07a6c-7f0e-4d63-921f-6eb1957e6146'));
