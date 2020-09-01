/* eslint-disable no-console */
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');

process.on('uncaughtException', err => {
  console.error(
    'Uncaught Exception: X﹏X\n'.red.bold,
    `${err}`.yellow.underline
  );
  process.exit(1);
});

dotenv.config({ path: path.resolve(__dirname, 'config.env') });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DataBase connection established ✔✔✔'.green.underline.bold);
  });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ⪻  ${PORT} ⪼  ∘∘∘`.blue.underline.bold);
});

process.on('unhandledRejection', err => {
  console.error(
    'Unhandled Rejection X﹏X\n'.red.bold,
    `${err}`.yellow.underline
  );
  server.close(() => {
    process.exit(1);
  });
});
