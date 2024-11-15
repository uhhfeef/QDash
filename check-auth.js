const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth-status',
  method: 'GET',
  headers: {
    'Cookie': '' // The cookie will be sent automatically if you're logged in
  }
};

const req = http.request(options, res => {
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Auth Status:', JSON.parse(data));
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.end();
