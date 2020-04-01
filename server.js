const express = require('express');
const puppeteer = require('puppeteer');
const downloader = require('./imgUrlDownloader');

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
        const favicon = await page.$eval(`link[rel~='icon']`, el => el.getAttribute('href'));
        console.log('favicon', favicon);
        console.log(meta);
        downloader.imgUrlDownload({originalUrl: url, imgUrl: favicon, name: 'favicon'});
        meta.forEach((og, index) => {
          if (og.hasOwnProperty('image')) {
            downloader.imgUrlDownload({originalUrl: url, imgUrl: og.image, name: 'thum'});
            meta.splice(index, 1);
          };
        })
        await browser.close();
        return meta;
      })();
      break;
    default: break;
  }
  
  res.send('🔥Meta Crawler');
});

app.listen(process.env.PORT || 3000);