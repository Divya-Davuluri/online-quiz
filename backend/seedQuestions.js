const { db } = require('./src/models/db');
const { v4: uuidv4 } = require('uuid');

const seedQuestions = () => {
    const exams = db.prepare('SELECT id, title FROM exams').all();
    const insert = db.prepare('INSERT INTO questions (id, examId, questionText, type, options, correctAnswer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    const mathQuestions = [
        { text: 'Calculate: 15 * 4 + 7', options: { A: '67', B: '60', C: '73', D: '54' }, correct: 'A', marks: 10 },
        { text: 'What is the square root of 144?', options: { A: '10', B: '12', C: '14', D: '16' }, correct: 'B', marks: 10 },
        { text: 'If x + 5 = 12, what is x?', options: { A: '5', B: '7', C: '8', D: '17' }, correct: 'B', marks: 10 }
    ];

    const generalQuestions = [
        { text: 'Explain the concept of inheritance in programming.', type: 'Short Answer', correct: 'Inheritance allows a class to inherit properties from another class.', marks: 15 },
        { text: 'Define the term "Algorithm".', type: 'Short Answer', correct: 'A step-by-step procedure for solving a problem.', marks: 15 }
    ];

    const codingQuestions = [
        { text: 'Write a Javascript function to reverse a string.', type: 'Coding', correct: 'function rev(s) { return s.split("").reverse().join(""); }', marks: 20 }
    ];

    let totalAdded = 0;
    for (const exam of exams) {
        // Check if exam already has questions
        const count = db.prepare('SELECT COUNT(*) as count FROM questions WHERE examId = ?').get(exam.id).count;
        if (count > 0) continue;

        console.log(`Seeding questions for: ${exam.title} (${exam.id})`);
        
        // Add 2 MCQs and 1 Short Answer
        for (let i = 0; i < 2; i++) {
            const q = mathQuestions[i];
            insert.run(uuidv4(), exam.id, q.text, 'MCQ', JSON.stringify(q.options), q.correct, 'Basic math knowledge.', q.marks);
        }
        
        const sq = generalQuestions[0];
        insert.run(uuidv4(), exam.id, sq.text, sq.type, null, sq.correct, 'Concepts.', sq.marks);

        const cq = codingQuestions[0];
        insert.run(uuidv4(), exam.id, cq.text, cq.type, null, cq.correct, 'Javascript.', cq.marks);

        totalAdded += 4;
    }

    console.log(`Total questions seeded: ${totalAdded}`);
};

seedQuestions();
