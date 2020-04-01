const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/', (req, res) => {
  res.send('🔥Meta Crawler');
});

app.get('/:function', (req, res) => {
  switch (req.params.function) {
    case 'seo':
      const {url} = req.query;
      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const meta = await page.$$eval(`meta[property*='og:']`,data => data.map(d => {
          let data = {};
          const keyRegExp = new RegExp('og:(.+)');
          const key = keyRegExp.exec(d.getAttribute('property'));
          const value = d.getAttribute('content');
          data[key[1]] = value;
          return data;
        }));
        console.log(meta);
        meta.forEach(async og => {
        })
        // if (meta.hasOwnPropery('images')) {
        // }
        await browser.close();
        return meta;
      })();
    default: break;
  }
  
  res.send('🔥Meta Crawler');
});

app.listen(process.env.PORT || 3000);