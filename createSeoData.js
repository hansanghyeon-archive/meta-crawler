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

  // 섬네일작업 이미지 다운로드 및 json 리턴 값에 추가
  meta.forEach(async (og, index) => {
    if (og.hasOwnProperty('image')) {
      const imgDirResult = await imgUrlDownload({
        originalUrl: url,
        imgUrl: og.image,
        name: 'thum',
      });
      // 로컬 저장하고 배열에서 제거
      // meta.splice(index, 1);
      meta[index].image = imgDirResult;
    }
  });

  // 파비콘작업 이미지 다운로드 및 json 리턴 값에 추가
  const favicon = await page.$eval(`link[rel~='icon']`, el =>
    el.getAttribute('href'),
  );
  const faviDirResult = await imgUrlDownload({
    originalUrl: url,
    imgUrl: favicon,
    name: 'favicon',
  });
  meta.push({ favicon: faviDirResult });

  // Puppeteer 브라우저 닫기
  await browser.close();

  // meta 하나의 객채로 변형
  let result = {};
  meta.forEach(og => {
    const key = Object.keys(og)[0];
    if (key === 'image' || key === 'favicon') {
      result[key] = 'https://file.nas.hapas.io/meta-crawler/' + og[key];
    } else {
      result[key] = og[key];
    }
  });
  console.log(result);

  return result;
};
