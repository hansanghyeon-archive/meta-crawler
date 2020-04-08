const mongoose = require('mongoose');
module.exports = () => {
  function connect() {
    mongoose.connect(
      `mongodb://admin:admin@${process.env.DB_HOST || 'localhost'}:27017/${
        process.env.DB
      }`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      (err) => {
        if (err) console.error('mongodb connection error', err);
      },
    );
  }
  connect();
  mongoose.connection.on('disconnected', connect);
};
