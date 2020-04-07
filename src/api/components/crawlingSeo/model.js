const mongoose = require('mongoose');

// Define Schemes
const seoSchema = new mongoose.Schema(
  {
    m_url: { type: String, required: true, unique: true },
    // 크롤링한 데이터
    title: { type: String, required: true },
    description: { type: String, define: false },
    thumbnail_url: { type: String, define: false },
    favicon_url: { type: String, define: false },
  },
  {
    timestamps: true,
    collection: 'meta-crawler',
  },
);

// Create Model & Export
module.exports = mongoose.model('Seo', seoSchema);
