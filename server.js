const dotenv = require('dotenv');
const mongoose = require('mongoose');
// Caught about Error Exception
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
// const AppErrors = require('.utils/appError');
// CAUGHT ERROR EXCEPTION - it must be top level to caught error exceptions

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_CLOUD.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server connected with ${PORT}`);
});
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
// console.log(x);
