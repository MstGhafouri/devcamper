const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');

const ErrorResponse = require('./utils/errorResponse');
const globalErrorHandler = require('./controllers/errorController');
const bootcampRouter = require('./routes/bootcampRoutes');
const courseRouter = require('./routes/courseRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');

const app = express();
// MIDDLEWARES

// Enable cross-origin requests
app.use(cors());
app.options('*', cors());

app.use(helmet()); // Set secure headers
// Limit requests from the same IP
const limiter = rateLimit({
  max: 100, // Max api request
  windowMs: 60 * 60 * 1000, // Per one hour,
  message: {
    status: 'fail',
    message: 'Too many requests from the this IP. Please try again in an hour!'
  }
});
app.use(limiter);
// Body parser, reading data from body into req.body
app.use(express.json());
// Cookie parser, parse the cookie that browser sends
app.use(cookieParser());
// Data sanitization against NoSql query injections
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Clear up query string
app.use(
  hpp({
    whitelist: ['averageCost', 'averageRating']
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Express file upload middleware for uploading bootcamp images
app.use(fileUpload());
// Serve static files
app.use(express.static(path.resolve(__dirname, 'public')));
// Routes handler
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bootcamps', bootcampRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/reviews', reviewRouter);

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
