const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { createSeoData } = require('./createSeoData');
const app = express();

dotenv.config({ path: path.join(__dirname, '.env') });

app.all('/*', (req, res, next) => {
  console.log(process.env.NODE_ENV);
  res.header(
    'Access-Control-Allow-Origin',
    process.env.NODE_ENV === 'production' ? 'https://4log.hapas.io/' : '*',
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
        const result = await createSeoData({ url });
        if (result) res.json(result);
        else res.json({});
      })();
      break;
    default:
      break;
  }
});

app.listen(8080);
