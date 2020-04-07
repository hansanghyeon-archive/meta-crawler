// ENV
require('dotenv').config();
// DEPENDENCIES
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8080;
const db = require('./db');
// FUNCTIONS
const { crawlingSeo } = require('../api/components/crawlingSeo');

// Node.js의 native Promise 사용
mongoose.Promise = global.Promise;

// CONNECT To MONGODB SERVER
db();

app.all('/*', (req, res, next) => {
  res.header(
    'Access-Control-Allow-Origin',
    process.env.NODE_ENV === 'production' ? process.env.ORIGIN : '*',
  );
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.get('/', (req, res) => {
  res.send('🔥Meta Crawler');
});

app.get('/:function', (req, res) => {
  switch (req.params.function) {
    case 'seo':
      const { url } = req.query;
      (async () => {
        const result = await crawlingSeo({ url });
        if (result) res.json(result);
        else res.json({});
      })();
      break;
    default:
      break;
  }
});

app.listen(port);
