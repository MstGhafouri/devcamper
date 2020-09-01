const express = require('express');

const bootcampController = require('../controllers/bootcampController');

const router = express.Router();

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
