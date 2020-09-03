const express = require('express');

const bootcampController = require('../controllers/bootcampController');
const courseRouter = require('./courseRoutes');

const router = express.Router();
// Nested route handler
router.use('/:bootcampId/courses', courseRouter);

router
  .route('/within/:distance/zipcode/:zipcode/unit/:unit')
  .get(bootcampController.getBootcampsWithinRadius);

router.patch('/:id/photo', bootcampController.photoUpload);

router
  .route('/')
  .get(bootcampController.getAllBootcamps)
  .post(bootcampController.createNewBootcamp);

router
  .route('/:id')
  .get(bootcampController.getBootcamp)
  .patch(bootcampController.updateBootcamp)
  .delete(bootcampController.deleteBootcamp);

module.exports = router;
