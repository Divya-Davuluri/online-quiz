const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        const body = JSON.parse(data);
        const token = body.token;
        console.log('Got token:', token);
        
        http.get('http://localhost:5000/api/student/all-results', { headers: { 'Authorization': 'Bearer ' + token } }, (res2) => {
            let data2 = '';
            res2.on('data', d => data2 += d);
            res2.on('end', () => console.log('all-results status:', res2.statusCode, 'body:', data2));
        });
    });
});
req.write(JSON.stringify({ email: 'ajay@gmail.com', password: '123456' }));
req.end();
