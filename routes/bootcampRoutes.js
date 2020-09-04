const express = require('express');

const bootcampController = require('../controllers/bootcampController');
const authController = require('../controllers/authController');
const courseRouter = require('./courseRoutes');

const router = express.Router();
// Nested route handler
router.use('/:bootcampId/courses', courseRouter);

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
  bootcampController.handlePermission,
  bootcampController.photoUpload
);

router.post(
  '/',
  bootcampController.setUserId,
  bootcampController.createNewBootcamp
);

router
  .route('/:id')
  .patch(bootcampController.handlePermission, bootcampController.updateBootcamp)
  .delete(
    bootcampController.handlePermission,
    bootcampController.deleteBootcamp
  );

module.exports = router;
