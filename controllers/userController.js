const User = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const catchAsync = require('../utils/catchAsync');
const serviceController = require('./serviceController');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Check if the user tries to update password, if so return an error
  if ('password' in req.body || 'passwordConfirm' in req.body) {
    return next(
      new ErrorResponse(
        'This route is not for updating password. Please use /updatePassword instead!',
        400
      )
    );
  }
  // 2) Update just name and email fields
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };
  // 3) Update the user
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );
  // 4) Send Response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.getAllUsers = serviceController.getAll(User);
exports.getUser = serviceController.getOne(User);
exports.createNewUser = serviceController.createOne(User);
exports.updateUser = serviceController.updateOne(User);
exports.deleteUser = serviceController.deleteOne(User);
