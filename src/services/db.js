const mongoose = require('mongoose');
module.exports = () => {
  function connect() {
    mongoose.connect(
      process.env.MONGO_URI,
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
