const express = require('express');
const { createSeoData } = require('./createSeoData');
const app = express();

app.get('/', (req, res) => {
  res.send('🔥Meta Crawler');
});

app.get('/:function', (req, res) => {
  switch (req.params.function) {
    case 'seo':
      const { url } = req.query;
      (async () => {
        const result = await createSeoData({ url });
        res.json(result);
      })();
      break;
    default:
      break;
  }
});

app.listen(8080);
