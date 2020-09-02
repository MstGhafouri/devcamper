const express = require('express');
const morgan = require('morgan');

const ErrorResponse = require('./utils/errorResponse');
const globalErrorHandler = require('./controllers/errorController');
const bootcampRouter = require('./routes/bootcampRoutes');
const courseRouter = require('./routes/courseRoutes');

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes handler
app.use('/api/v1/bootcamps', bootcampRouter);
app.use('/api/v1/courses', courseRouter);

// Catch all unknown routes
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
