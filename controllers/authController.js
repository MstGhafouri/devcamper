// const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const createAndSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    maxAge: process.env.JWT_COOKIE_MAX_AGE * 24 * 60 * 60 * 1000,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    httpOnly: true
  });
  // Remove password and active from the output
  user.password = undefined;
  user.active = undefined;
  user.__v = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// SIGN UP
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, role, password, passwordConfirm } = req.body;

  const newUser = await User.create({
    name,
    email,
    role,
    password,
    passwordConfirm
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, req, res);
});

// LOG IN
exports.login = catchAsync(async (req, res, next) => {
  // 1) Check if email and password are provided
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide both email and password', 400)
    );
  }
  // 2) Find user by provided email address
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.verifyPassword(password)))
    return next(new ErrorResponse('Incorrect email or password', 401));

  createAndSendToken(user, 200, req, res);
});

// LOG OUT
exports.logout = (req, res) => {
  res.cookie('jwt', 'null', {
    maxAge: 3000,
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// PROTECT ROUTES
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check if token is provided in authorization headers
  const { authorization } = req.headers;
  let token =
    authorization && authorization.startsWith('Bearer ')
      ? authorization.split(' ')[1]
      : null;

  // Check if token is in the cookies
  // if (!token && req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }

  if (!token) {
    return next(new ErrorResponse('Please log in to get access', 401));
  }
  // 2) Verify given token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // 3) Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new ErrorResponse(
        'User belonging to this token does no longer exist',
        401
      )
    );
  }
  // 4) Check if user changed password after the token was issued
  if (user.doesUserChangePasswordAfter(decoded.iat)) {
    return next(
      new ErrorResponse(
        'User has recently changed password. Please log in again!',
        401
      )
    );
  }
  // 5) Grant access to protected routes!
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new ErrorResponse(
        'You do not have permission to perform this action',
        403
      )
    );
  }
  next();
};
