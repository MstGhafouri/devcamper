const express = require('express');

const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');

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
  courseController.setBootcampId,
  courseController.createNewCourse
);

router
  .route('/:id')
  .patch(courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;
