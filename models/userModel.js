const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    require: [true, 'Please provide a name']
  },
  email: {
    type: String,
    unique: true,
    require: [true, 'Please provide an email address'],
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
  passwordResetExpiresAt: Date
});

const User = mongoose.model('User', userSchema);

module.exports = User;
