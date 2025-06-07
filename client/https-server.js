// https-server.js
const fs = require('fs');
const https = require('https');
const express = require('express');
const next = require('next');

const app = next({ dev: true });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

app.prepare().then(() => {
  const server = express();

  // Use handle as middleware
  server.use((req, res, next) => {
    handle(req, res).catch(next);
  });

  https.createServer(httpsOptions, server).listen(3001, () => {
    console.log('> Ready on https://localhost:3001');
  });
});