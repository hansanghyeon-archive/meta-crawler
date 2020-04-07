const Seo = require('../crawlingSeo/model');

module.exports.isCrawlingSeo = () => {
  Seo.find({ m_url: 'https://4log.hapas.io/' })
    .then((seo) => console.log(seo))
    .catch((err) => console.log(err));
};
