const puppeteer = require('puppeteer');
const { imgUrlDownload } = require('./imgUrlDownloader');

module.exports.createSeoData = async ({ url }) => {
  // Puppeteer 브라우저 셋팅
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  // Meta data
  const meta = await page.$$eval(`meta[property*='og:']`, data =>
    data.map(d => {
      let data = {};
      const keyRegExp = new RegExp('og:(.+)');
      const key = keyRegExp.exec(d.getAttribute('property'));
      const value = d.getAttribute('content');
      data[key[1]] = value;
      return data;
    }),
  );
  // 파비콘 찾고 추가
  await page
    .$eval(`link[rel~='icon']`, el => {
      return el.href;
    })
    .then(favicon => {
      meta.push({ favicon });
    })
    .catch(err => err);
  // Puppeteer 브라우저 닫기
  await browser.close();

  // meta 하나의 객채로 변형
  const metaData = {};
  meta.forEach(og => {
    const key = Object.keys(og)[0];
    metaData[key] = og[key];
  });

  const saveImg = async (property, imgUrl) => {
    return `https://fs.nas.hapas.io/meta-crawler/${await imgUrlDownload({
      originalUrl: url,
      imgUrl,
      name: property,
    })}`;
  };
  const isAbsolutPath = property => {
    // 이미지 URL이 absolute path인지 여기서 체크
    const urlCracker = new RegExp('^(.*//)([A-Za-z0-9-.]+)(:[0-9]+)?(.*)$');
    const _ = urlCracker.exec(metaData[property]);
    if (_ !== null) return metaData[property];
    return metaData.url.slice(0, -1) + metaData[property];
  };
  const isSaveImg = async property => {
    if (metaData.hasOwnProperty(property)) {
      let d = {};
      d[property] = await saveImg(property, isAbsolutPath(property));
      return d;
    }
  };

  return Promise.all([
    // 섬네일 🚀
    isSaveImg('image'),
    // 파비콘 🚀
    isSaveImg('favicon'),
  ])
    .then(e =>
      e.map(obj => {
        const key = Object.keys(obj)[0];
        metaData[key] = obj[key];
      }),
    )
    .then(() => metaData)
    .catch(err => err);
};
