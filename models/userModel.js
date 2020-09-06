const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please provide a name']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide an email address'],
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    default: 'user',
    enum: {
      values: ['user', 'publisher'],
      message: "User role must be one of 'user' or 'publisher'"
    }
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [7, 'Password length must be at least 7 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Passwords are not the same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  confirmEmailToken: String,
  isEmailConfirmed: {
    type: Boolean,
    default: false
  }
});

// Hash password
userSchema.pre('save', async function (next) {
  // If password is not changed, return next!
  if (!this.isModified('password')) return next();
  // Hash the password by cost of 12 (salt)
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});
// Set passwordChangedAt if password is changed
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // Signing jwt is a little bit faster than saving document into DB
  // So we subtract passwordChangedAt a little bit in the past
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Method to compare passwords
userSchema.methods.verifyPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};
// Method to generate confirm email token
userSchema.methods.createConfirmEmailToken = function () {
  const confirmToken = crypto.randomBytes(32).toString('hex');
  this.confirmEmailToken = crypto
    .createHash('sha256')
    .update(confirmToken)
    .digest('hex');

  return confirmToken;
};
// Method to check if the user has changed his password after jwt was issued
userSchema.methods.doesUserChangePasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimeStamp > jwtTimeStamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
