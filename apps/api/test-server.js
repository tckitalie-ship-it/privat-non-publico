const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});

server.listen(3000, '127.0.0.1', () => {
  console.log('test server running on http://127.0.0.1:3000');
});

process.stdin.resume();