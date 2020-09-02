const Course = require('../models/courseModel');
const Bootcamp = require('../models/bootcampModel');
const ErrorResponse = require('../utils/errorResponse');
const catchAsync = require('../utils/catchAsync');
const serviceController = require('./serviceController');

exports.setBootcampId = catchAsync(async (req, res, next) => {
  if (!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;
  const doesBootcampExit = await Bootcamp.exists({ _id: req.body.bootcamp });
  if (!doesBootcampExit)
    return next(new ErrorResponse('No bootcamp found with that ID', 404));
  next();
});

// CRUD operations Handlers ( Create, Read, Update, Delete)
const populateOptions = {
  path: 'bootcamp',
  select: 'name description'
};
exports.getAllCourses = serviceController.getAll(Course);
exports.getCourse = serviceController.getOne(Course, populateOptions);
exports.createNewCourse = serviceController.createOne(Course);
exports.updateCourse = serviceController.updateOne(Course);
exports.deleteCourse = serviceController.deleteOne(Course);
