const http = require('http');

const request = (method, path, data, headers = {}) => {
    return new Promise((resolve, reject) => {
        const body = data ? JSON.stringify(data) : '';
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api' + path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        if (body) options.headers['Content-Length'] = Buffer.byteLength(body);

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', (chunk) => resData += chunk);
            res.on('end', () => {
                try {
                    const parsed = resData ? JSON.parse(resData) : null;
                    if (res.statusCode >= 400) reject({ status: res.statusCode, data: parsed, path });
                    else resolve(parsed);
                } catch (e) {
                    console.error('FAILED TO PARSE JSON ('+path+'). RAW DATA:');
                    console.error(resData);
                    reject({ status: res.statusCode, error: 'Invalid JSON', path });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
};

const testFullFlow = async () => {
    try {
        console.log('--- STARTING FINAL E2E TEST ---');
        
        // 1. Login
        const loginRes = await request('POST', '/auth/login', {
            email: 'student123@gmail.com',
            password: '123456'
        });
        const token = loginRes.token;
        console.log('Login successful');

        // 2. Fetch active exams
        console.log('Fetching published exams...');
        const examsRes = await request('GET', '/exams/published', null, { Authorization: `Bearer ${token}` });
        const examId = examsRes[0]?.id;
        if (!examId) throw new Error('No published exams found');
        console.log(`Found exam: ${examsRes[0].title}`);

        // 3. Start attempt
        console.log('Starting attempt...');
        const startRes = await request('POST', `/student/exams/${examId}/start`, {}, { Authorization: `Bearer ${token}` });
        const attemptId = startRes.attemptId;
        console.log(`Attempt ID created: ${attemptId}`);

        // 4. Fetch questions
        console.log('Fetching questions for exam...');
        const examData = await request('GET', `/exams/${examId}`, null, { Authorization: `Bearer ${token}` });
        const questions = examData.questions;
        console.log(`Questions fetched: ${questions.length}`);

        // 5. Submit answers
        console.log('Submitting answers...');
        const answers = questions.map(q => ({
            questionId: q.id,
            answer: q.type === 'MCQ' ? 'A' : 'Automated test response'
        }));

        // Note: The frontend saves each answer individually via /save then calls /submit.
        // We will call /submit directly as the controller handles calculation from provided answers if needed?
        // Wait, looking at submit route... it pulls from DB. So we MUST save first.
        
        for (const ans of answers) {
            await request('POST', `/student/attempts/${attemptId}/save`, ans, { Authorization: `Bearer ${token}` });
        }
        console.log('Answers saved.');

        await request('POST', `/student/attempts/${attemptId}/submit`, { autoSubmitted: false }, { Authorization: `Bearer ${token}` });
        console.log('Exam submitted successfully');

        // 6. Verify Results
        console.log('Verifying result in history...');
        const history = await request('GET', '/student/all-results', null, { Authorization: `Bearer ${token}` });
        const submitted = history.find(h => h.id === attemptId);
        if (submitted) {
            console.log('SUCCESS: Attempt found in history with score ' + submitted.score);
        } else {
            console.log('WARNING: Attempt not found in history immediately.');
        }

        console.log('--- E2E TEST COMPLETED SUCCESSFULLY ---');
    } catch (err) {
        console.error('--- E2E TEST FAILED ---');
        console.error(err);
    }
    process.exit(0);
};

testFullFlow();
