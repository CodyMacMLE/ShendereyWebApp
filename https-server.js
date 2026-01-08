// https-server.js
const fs = require('fs');
const https = require('https');
const express = require('express');
const multer = require('multer');
const next = require('next');

const app = next({ dev: true });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

app.prepare().then(() => {
  const server = express();

  // Configure multer for handling multipart/form-data with large file sizes
  const upload = multer({
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
      fieldSize: 100 * 1024 * 1024, // 100MB limit for fields
    }
  });

  // Configure body size limit for all requests (100MB)
  server.use(express.json({ limit: '100mb' }));
  server.use(express.urlencoded({ limit: '100mb', extended: true }));
  
  // Handle multipart/form-data requests with multer
  server.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      console.log('Handling multipart request:', req.url);
      // Use multer to handle multipart requests
      upload.any()(req, res, next);
    } else {
      next();
    }
  });

  // Use handle as middleware
  server.use((req, res, next) => {
    handle(req, res).catch(next);
  });

  https.createServer(httpsOptions, server).listen(3001, () => {
    console.log('> Ready on https://localhost:3001');
  });
});