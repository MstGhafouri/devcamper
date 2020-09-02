const Bootcamp = require('../models/bootcampModel');
const serviceController = require('./serviceController');
const geocoder = require('../utils/geocoder');
const catchAsync = require('../utils/catchAsync');

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

// CRUD operations Handlers ( Create, Read, Update, Delete)
exports.getAllBootcamps = serviceController.getAll(Bootcamp);
exports.getBootcamp = serviceController.getOne(Bootcamp, { path: 'courses' });
exports.createNewBootcamp = serviceController.createOne(Bootcamp);
exports.updateBootcamp = serviceController.updateOne(Bootcamp);
exports.deleteBootcamp = serviceController.deleteOne(Bootcamp);
