const path = require('path');
const Bootcamp = require('../models/bootcampModel');
const serviceController = require('./serviceController');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const catchAsync = require('../utils/catchAsync');

exports.photoUpload = catchAsync(async (req, res, next) => {
  if (!req.files)
    return next(new ErrorResponse('Please upload a photo first', 400));

  const { photo } = req.files;

  if (!photo)
    return next(
      new ErrorResponse("No 'photo' found in the uploaded files", 400)
    );

  if (!photo.mimetype.startsWith('image'))
    return next(new ErrorResponse('Not an image', 400));

  if (photo.size > process.env.MAX_FILE_SIZE)
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_SIZE} bytes`,
        400
      )
    );

  // Set file name
  photo.name = `bootcamp-photo-${req.params.id}${path.parse(photo.name).ext}`;

  photo.mv(`${process.env.FILE_UPLOAD_PATH}/${photo.name}`, async err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Error uploading file: ', err);
      return next(
        new ErrorResponse('An error occurred while uploading the file', 500)
      );
    }

    const bootcamp = await Bootcamp.findByIdAndUpdate(
      req.params.id,
      { photo: photo.name },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        bootcamp
      }
    });
  });
});

// Get all bootcamps within a certain radius from a point
// api/v1/bootcamps/within/:distance/zipcode/:zipcode/unit/:unit
exports.getBootcampsWithinRadius = catchAsync(async (req, res, next) => {
  const { distance, zipcode, unit } = req.params;
  // Get lat/lng from geocoder
  const location = (await geocoder.geocode(zipcode))[0];
  const lat = location.latitude;
  const lng = location.longitude;

  // Calc radius using radians
  // Divide by the radius of the earth
  const radius = unit === 'km' ? distance / 6378.1 : distance / 3963.2;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: bootcamps.length,
    data: {
      bootcamps
    }
  });
});

// Set user id into req.body and check if user has permission to publish a bootcamp
exports.setUserId = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  // If the user is not admin, they can only add one bootcamp
  const hasUserBootcamp = await Bootcamp.exists({ user: req.user.id });
  if (hasUserBootcamp && req.user.role !== 'admin')
    return next(
      new ErrorResponse('You have already published a bootcamp', 400)
    );

  next();
});

// CRUD operations Handlers ( Create, Read, Update, Delete)
exports.getAllBootcamps = serviceController.getAll(Bootcamp);
exports.getBootcamp = serviceController.getOne(Bootcamp, { path: 'courses' });
exports.createNewBootcamp = serviceController.createOne(Bootcamp);
exports.updateBootcamp = serviceController.updateOne(Bootcamp);
exports.deleteBootcamp = serviceController.deleteOne(Bootcamp);
