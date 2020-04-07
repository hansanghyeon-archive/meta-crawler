const Seo = require('../crawlingSeo/model');
const { crawlingSeo } = require('../crawlingSeo');

module.exports.isCrawlingSeo = async ({ m_url }) => {
  const isDbSeoData = await Seo.find({ m_url })
    .then((seo) => seo)
    .catch((err) => console.error(err));

  // DB Seo 데이터없음
  if (isDbSeoData.length === 0) {
    const result = await crawlingSeo({ m_url });
    result['m_url'] = m_url;

    // 데이터 선택적 사용
    if (Array.isArray(result.title)) {
      result.title.sort((a, b) => a.length - b.length);
      result.title = result.title[0];
    }
    if (Array.isArray(result.descipriton)) {
      result.descipriton.sort((a, b) => b.length - a.length);
      result.descipriton = result.descipriton[0];
    }

    // MongoDB 데이터 저장
    const newSeo = new Seo(result);
    newSeo.save().catch((err) => console.error(err));
    return result;
  } else {
    return isDbSeoData[0];
  }
};
