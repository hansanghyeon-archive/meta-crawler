const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const imgUrlDownloader = async ({originalUrl, imgUrl, name}) => {
  const urlSlicer = new RegExp('(.*\/)(.+(ico|png|jpg|jpeg))');
  const _ = urlSlicer.exec(imgUrl);

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  const viewSource = await page.goto(imgUrl);

  // 디렉토리 있는지 체크 없으면 만들기
  // url 16진수로 변환 파일네임 생성
  const isDir = ({originalUrl}) => {
    return encodeURI(
      originalUrl
        .replace(new RegExp('/', 'g'), '%2F')
        .replace(new RegExp('&', 'g'), '%26')
        .replace(new RegExp(':', 'g'), '%3A')
        .replace(new RegExp('=', 'g'), '%3D')
    );
  }
  const createImg = async (dir) => {
    const fileDir = path.resolve(__dirname, 'static', dir);
    if (!fs.existsSync(fileDir)) {
      // 디렉토리 없음
      // console.log('디렉토리 없음');
      fs.mkdirSync(fileDir);
      createImg(dir);
    } else {
      const filePath = path.resolve(fileDir, `${name}.${_[3]}`);
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(await viewSource.buffer(), err => {
        if (err) console.log(err);
        // The file was saved!
        // console.log('The file was saved!');
      });
    }
  }
  createImg(isDir({originalUrl}));
  return [isDir({originalUrl}), `${name}.${_[3]}`].join('/');
}

module.exports.imgUrlDownload = imgUrlDownloader;