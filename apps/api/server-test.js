const http = require('http');

const server = http.createServer((req, res) => {
  res.end('ok');
});

server.listen(4000, '127.0.0.1', () => {
  console.log('plain node server listening on http://127.0.0.1:4000');
});