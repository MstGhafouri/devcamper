const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Review must have a title'],
      maxlength: [100, 'Review title cannot be longer than 100 characters'],
      minlength: [4, 'Review title cannot be shorter than 4 characters']
    },
    text: {
      type: String,
      required: [true, 'Review must have a text'],
      maxlength: [500, 'Review text cannot be longer than 500 characters']
    },
    rating: {
      type: Number,
      required: [true, 'Please provide rating for the review'],
      min: [1, 'Review rating cannot be less than 1'],
      max: [10, 'Review rating cannot be more than 10']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: [true, 'Review must belong to a bootcamp']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Prevent user from submitting more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// // Static method only accessible on Models
reviewSchema.statics.calcAverageRating = async function (bootcampId) {
  const stats = await this.aggregate([
    {
      $match: {
        bootcamp: bootcampId
      }
    },
    {
      $group: {
        _id: '$bootcamp',
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: stats[0].avgRating
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.bootcamp);
});

reviewSchema.pre('remove', async function () {
  await this.constructor.calcAverageRating(this.bootcamp);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.R = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.R.constructor.calcAverageRating(this.R.bootcamp);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
