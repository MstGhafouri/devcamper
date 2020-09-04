const User = require('../models/userModel');
const serviceController = require('./serviceController');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = serviceController.getAll(User);
exports.getUser = serviceController.getOne(User);
exports.createNewUser = serviceController.createOne(User);
exports.updateUser = serviceController.updateOne(User);
exports.deleteUser = serviceController.deleteOne(User);
