// DEPENDENCIES
const puppeteer = require('puppeteer');
// F
const { imgUrlDownload } = require('../imgUrlDownloader');

module.exports.crawlingSeo = async ({ url }) => {
  // Puppeteer 브라우저 셋팅
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  // Meta data
  const meta = await page.$$eval(`meta[content]`, (data) =>
    data.map((d) => {
      let data = {};
      const isName = d.hasAttribute('name');
      const isProperty = d.hasAttribute('property');
      const content = d.getAttribute('content');

      if (isProperty)
        data[d.getAttribute('property').replace(/og:/, '')] = content;
      if (isName) {
        const name = d.getAttribute('name');
        const isDescription = name.indexOf('description') === 0;
        const isTwitter = name.indexOf('twitter') === 0;
        if (isTwitter) {
          data[name] = content;
        }
      }
      return data;
    }),
  );
  console.log(meta);
  // 파비콘 찾고 추가
  await page
    .$eval(`link[rel~='icon']`, (el) => {
      return el.href;
    })
    .then((favicon) => {
      meta.push({ favicon });
    })
    .catch((err) => err);
  // Puppeteer 브라우저 닫기
  await browser.close();

  // meta 하나의 객채로 변형
  const metaData = {};
  meta.forEach((og) => {
    const key = Object.keys(og)[0];
    metaData[key] = og[key];
  });

  const saveImg = async (property, imgUrl) => {
    return `${process.env.FILE_SERVER_URI}${await imgUrlDownload({
      originalUrl: url,
      imgUrl,
      name: property,
    })}`;
  };
  const isAbsolutPath = (property) => {
    // 이미지 URL이 absolute path인지 여기서 체크
    const urlCracker = new RegExp('^(.*//)([A-Za-z0-9-.]+)(:[0-9]+)?(.*)$');
    const _ = urlCracker.exec(metaData[property]);
    if (_ !== null) return metaData[property];
    return metaData.url.slice(0, -1) + metaData[property];
  };
  const isSaveImg = async (property) => {
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
    .then((e) =>
      e.map((obj) => {
        const key = Object.keys(obj)[0];
        metaData[key] = obj[key];
      }),
    )
    .then(() => metaData)
    .catch((err) => err);
};
