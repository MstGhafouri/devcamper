const Review = require('../models/reviewModel');
const Bootcamp = require('../models/bootcampModel');
const ErrorResponse = require('../utils/errorResponse');
const catchAsync = require('../utils/catchAsync');
const serviceController = require('./serviceController');

exports.setBootcampUserId = catchAsync(async (req, res, next) => {
  // 1. Set user and bootcamp id into req.body
  if (!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;
  if (!req.body.user) req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.body.bootcamp);
  if (!bootcamp)
    return next(new ErrorResponse('No bootcamp found with that ID', 404));
  next();
});

// CRUD operations Handlers ( Create, Read, Update, Delete)
const populateOptions = {
  path: 'bootcamp',
  select: 'name description'
};
exports.getAllReviews = serviceController.getAll(Review);
exports.getReview = serviceController.getOne(Review, populateOptions);
exports.createNewReview = serviceController.createOne(Review);
exports.updateReview = serviceController.updateOne(Review);
exports.deleteReview = serviceController.deleteOne(Review);
