const express = require('express');
const morgan = require('morgan');

const ErrorResponse = require('./utils/errorResponse');
const globalErrorHandler = require('./controllers/errorController');
const bootcampRouter = require('./routes/bootcampRoutes');

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcampRouter);

// Catch all unknown routes ( this middleware runs after all routes have been defined !)
app.all('*', (req, res, next) => {
  next(
    new ErrorResponse(
      `Can't find ${req.method} ${req.originalUrl} on this server`,
      404
    )
  );
});
// Final middleware, Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
