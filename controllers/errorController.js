/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const ErrorResponse = require('../utils/errorResponse');

// MongoDB CastError handler (ex: invalid id !)
const handleCastErrorDB = err =>
  new ErrorResponse(`Invalid ${err.path}: ${err.value}`, 400);

// MongoDB duplicate fields error handler
const handleDuplicateFieldsDB = err => {
  const value = Object.values(err.keyValue)[0];
  return new ErrorResponse(
    `Duplicate field value: ${value}. Please use another one!`,
    400
  );
};

// MongoDB validation error handler
const handleValidationErrorDB = err => {
  const errs = Object.values(err.errors).map(er => er.message);
  return new ErrorResponse(`Invalid input data: ${errs.join('. ')}`, 400);
};

// JWT validation error handler
const handleJsonWebTokenError = () =>
  new ErrorResponse('Invalid token. Please log in again.', 401);

// JWT expiration error handler
const handleTokenExpiredError = () =>
  new ErrorResponse('Token is expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // OPERATIONAL ERRORS, WE TRUST THEM
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  // UNKNOWN ERRORS, DON'T LEAK ERROR DETAILS
  console.error('Unknown Error: X﹏X\n'.red.bold, `${err}`.yellow.underline);
  res.status(500).json({
    status: 'error',
    message: "Something went very wrong. That's all we know."
  });
};

// Global error handler function
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // Send error response based on the node environment !
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  // Production error response
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    else if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    else if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    else if (error.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError();
    else if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
};
