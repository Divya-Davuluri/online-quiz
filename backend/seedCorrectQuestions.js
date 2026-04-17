const { db } = require('./src/models/db');
const { v4: uuidv4 } = require('uuid');

const reSeedQuestions = () => {
    // Delete existing incorrect questions for Physics and English
    const examsToFix = db.prepare("SELECT id, title FROM exams WHERE title IN ('physics exam', 'english exam')").all();
    
    for (const exam of examsToFix) {
        db.prepare('DELETE FROM questions WHERE examId = ?').run(exam.id);
        console.log(`Cleared incorrect questions for: ${exam.title}`);
    }

    const insert = db.prepare('INSERT INTO questions (id, examId, questionText, type, options, correctAnswer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    const physicsQuestions = [
        { text: 'What is the formula for calculating force?', options: { A: 'F = m/a', B: 'F = ma', C: 'F = m - a', D: 'F = m+a' }, correct: 'B', type: 'MCQ', marks: 10 },
        { text: 'What is the unit of electrical resistance?', options: { A: 'Volt', B: 'Ampere', C: 'Ohm', D: 'Watt' }, correct: 'C', type: 'MCQ', marks: 10 },
        { text: 'Explain Newton’s Third Law of Motion.', type: 'Short Answer', correct: 'For every action, there is an equal and opposite reaction.', options: null, marks: 15 },
        { text: 'Write a python function to calculate kinetic energy (KE = 0.5 * m * v^2) given m and v.', type: 'Coding', correct: 'def kinetic_energy(m, v):\n    return 0.5 * m * v**2', options: null, marks: 20 }
    ];

    const englishQuestions = [
        { text: 'Which of the following is a synonym for "Abundant"?', options: { A: 'Scarce', B: 'Plentiful', C: 'Rare', D: 'Minimal' }, correct: 'B', type: 'MCQ', marks: 10 },
        { text: 'Identify the verb in the sentence: "The quick brown fox jumps over the lazy dog."', options: { A: 'quick', B: 'brown', C: 'jumps', D: 'dog' }, correct: 'C', type: 'MCQ', marks: 10 },
        { text: 'Write a brief paragraph describing your favorite season.', type: 'Short Answer', correct: 'Subjective answer.', options: null, marks: 15 }
    ];

    for (const exam of examsToFix) {
        let qsToInsert = [];
        if (exam.title === 'physics exam') qsToInsert = physicsQuestions;
        if (exam.title === 'english exam') qsToInsert = englishQuestions;

        for (const q of qsToInsert) {
            insert.run(
                uuidv4(), 
                exam.id, 
                q.text, 
                q.type, 
                q.type === 'MCQ' ? JSON.stringify(q.options) : null, 
                q.correct, 
                `Standard ${exam.title} knowledge.`, 
                q.marks
            );
        }
        console.log(`Seeded correct ${qsToInsert.length} questions for: ${exam.title}`);
    }
};

reSeedQuestions();
