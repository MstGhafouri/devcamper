const express = require('express');

const Bootcamp = require('../models/bootcampModel');
const bootcampController = require('../controllers/bootcampController');
const authController = require('../controllers/authController');
const courseRouter = require('./courseRoutes');
const reviewRouter = require('./reviewRoutes');
const handlePermission = require('../utils/handlePermission');

const router = express.Router();
// Nested route handler
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/within/:distance/zipcode/:zipcode/unit/:unit')
  .get(bootcampController.getBootcampsWithinRadius);

router.get('/', bootcampController.getAllBootcamps);
router.get('/:id', bootcampController.getBootcamp);

// Protect and restrict all the following routes
router.use(
  authController.protect,
  authController.restrictTo('admin', 'publisher')
);

router.patch(
  '/:id/photo',
  handlePermission(Bootcamp),
  bootcampController.photoUpload
);

router.post(
  '/',
  bootcampController.setUserId,
  bootcampController.createNewBootcamp
);

router
  .route('/:id')
  .patch(handlePermission(Bootcamp), bootcampController.updateBootcamp)
  .delete(handlePermission(Bootcamp), bootcampController.deleteBootcamp);

module.exports = router;
