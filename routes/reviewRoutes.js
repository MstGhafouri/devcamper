const express = require('express');

const Review = require('../models/reviewModel');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const handlePermission = require('../utils/handlePermission');

const router = express.Router({ mergeParams: true });

router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);

// Protect and restrict all the following routes
router.use(authController.protect, authController.restrictTo('admin', 'user'));

router.post(
  '/',
  reviewController.setBootcampUserId,
  reviewController.createNewReview
);

router
  .route('/:id')
  .patch(handlePermission(Review), reviewController.updateReview)
  .delete(handlePermission(Review), reviewController.deleteReview);

module.exports = router;
