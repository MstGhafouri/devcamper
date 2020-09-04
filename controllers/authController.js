const crypto = require('crypto');
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

// Restrict routes
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

// Update user password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from DB based on id
  const user = await User.findById(req.user.id).select('+password');
  // 2) Check if posted password is correct
  const { currentPassword, password, passwordConfirm } = req.body;
  if (!currentPassword)
    return next(new ErrorResponse('Please provide your current password', 400));
  if (!(await user.verifyPassword(currentPassword))) {
    return next(new ErrorResponse('Your current password is wrong!', 401));
  }
  // 3) Update the password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // 4) Log the user in
  createAndSendToken(user, 200, req, res);
});

// Forgot password ? (:
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ErrorResponse('There is no user with that email address', 404)
    );
  }
  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  // Save current user with new password reset token ( disable validation before save !)
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email address
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/password-reset/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorResponse(
        'An error occurred while sending email! please try again later',
        500
      )
    );
  }
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on sent token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() }
  });
  // 2) If token has not expired and user still exists, set new password
  if (!user) {
    return next(new ErrorResponse('Token is invalid or has expired', 400));
  }
  const { password, passwordConfirm } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  // 3) Log the user in, send jwt
  createAndSendToken(user, 200, req, res);
});
