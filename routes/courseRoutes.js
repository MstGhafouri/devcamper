const express = require('express');

const Course = require('../models/courseModel');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');
const handlePermission = require('../utils/handlePermission');

const router = express.Router({ mergeParams: true });

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);

// Protect and restrict all the following routes
router.use(
  authController.protect,
  authController.restrictTo('admin', 'publisher')
);

router.post(
  '/',
  courseController.setBootcampUserId,
  courseController.createNewCourse
);

router
  .route('/:id')
  .patch(handlePermission(Course), courseController.updateCourse)
  .delete(handlePermission(Course), courseController.deleteCourse);

module.exports = router;
