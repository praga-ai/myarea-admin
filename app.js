const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;

// Use absolute path for Azure environment
let BUILD_DIR = path.join(__dirname, 'build');
// If running on Azure, use /home/site/wwwroot/build
if (fs.existsSync('/home/site/wwwroot/build')) {
  BUILD_DIR = '/home/site/wwwroot/build';
} else if (!fs.existsSync(BUILD_DIR)) {
  // Fallback to current directory
  BUILD_DIR = path.join(process.cwd(), 'build');
}

console.log(`BUILD_DIR: ${BUILD_DIR}`);
console.log(`BUILD_DIR exists: ${fs.existsSync(BUILD_DIR)}`);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  if (pathname === '/') {
    pathname = '/index.html';
  }

  let filepath = path.join(BUILD_DIR, pathname);

  // Prevent directory traversal
  if (!filepath.startsWith(BUILD_DIR)) {
    filepath = path.join(BUILD_DIR, 'index.html');
  }

  const ext = String(path.extname(filepath)).toLowerCase();
  const mimeType = mimeTypes[ext] || 'text/html';

  fs.readFile(filepath, (err, content) => {
    if (err) {
      // If file not found, serve index.html for SPA routing
      fs.readFile(path.join(BUILD_DIR, 'index.html'), (indexErr, indexContent) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - File Not Found</h1>');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexContent, 'utf-8');
        }
      });
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
