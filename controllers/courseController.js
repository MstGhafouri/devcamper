const Course = require('../models/courseModel');
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
  // 2. Make sure user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(
      new ErrorResponse(
        'You do not have permission to perform this action',
        403
      )
    );

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
