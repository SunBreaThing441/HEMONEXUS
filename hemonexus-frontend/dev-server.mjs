import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const BACKEND_TARGET = 'http://localhost:8000';
const STATIC_DIR = path.resolve(__dirname, '../Blood-Donation-PHP/B24U_CorePHP_SourceFile/hemonexus');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers for decoupled presentation tier
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // 1. Proxy PHP endpoints to Core PHP Backend (port 8000)
  if (pathname.endsWith('.php') || pathname.startsWith('/api/')) {
    const backendPath = pathname.replace(/^\/api\//, '/');
    const proxyUrl = new URL(backendPath + url.search, BACKEND_TARGET);

    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];

    const clientReq = http.request(proxyUrl, {
      method: req.method,
      headers: headers
    }, (clientRes) => {
      // Forward Set-Cookie and response headers
      const resHeaders = { ...clientRes.headers };
      res.writeHead(clientRes.statusCode, resHeaders);
      clientRes.pipe(res);
    });

    clientReq.on('error', (err) => {
      console.error(`[Proxy Error] Unable to connect to backend ${proxyUrl.href}:`, err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend unreachable on port 8000', details: err.message }));
    });

    req.pipe(clientReq);
    return;
  }

  // 2. Serve Static Frontend Files from hemonexus directory
  let filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  🌐 HemoNexus Frontend Server running on: http://localhost:${PORT}`);
  console.log(`  🔗 Proxies API calls to Backend:        ${BACKEND_TARGET}`);
  console.log(`======================================================\n`);
});
