// DEPENDENCIES
const puppeteer = require('puppeteer');
// F
const { imgUrlDownload } = require('../imgUrlDownloader');

module.exports.crawlingSeo = async ({ m_url }) => {
  // Puppeteer 브라우저 셋팅
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(m_url);

  // Meta data
  const meta = await page.$$eval(`meta[property*='og:']`, (data) =>
    data.map((d) => {
      let data = {};
      let key = d.getAttribute('property').replace('og:', '');
      const value = d.getAttribute('content');
      if (key === 'title' || key === 'descrpition') key += 'og:' + key;
      data[key] = value;
      return data;
    }),
  );
  // 기본값 Description
  await page
    .$eval(`meta[name='description']`, (el) => {
      return el.content;
    })
    .then((description) => {
      meta.push({ description });
    })
    .catch((err) => err);
  // 기본값 Title 태스 수집
  await page
    .$eval(`title`, (el) => {
      return el.innerText;
    })
    .then((title) => {
      meta.push({ title });
    })
    .catch((err) => err);
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
    if (key.indexOf('og:') === -1) metaData[key] = og[key];
  });

  const saveImg = async (property, imgUrl) => {
    return `${process.env.FILE_SERVER_URI}${await imgUrlDownload({
      m_url,
      imgUrl,
      name: property,
    })}`;
  };
  const isSaveImg = async (property) => {
    if (metaData.hasOwnProperty(property)) {
      let d = {};
      d[property] = await saveImg(property, metaData[property]);
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
        if (obj !== undefined) {
          const key = Object.keys(obj)[0];
          metaData[key] = obj[key];
        }
      }),
    )
    .then(() => {
      return metaData;
    })
    .catch((err) => err);
};
