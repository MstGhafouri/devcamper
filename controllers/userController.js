const User = require('../models/userModel');
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

exports.getAllUsers = serviceController.getAll(User);
exports.getUser = serviceController.getOne(User);
exports.createNewUser = serviceController.createOne(User);
exports.updateUser = serviceController.updateOne(User);
exports.deleteUser = serviceController.deleteOne(User);
