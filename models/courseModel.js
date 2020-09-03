const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Course must have a title'],
      maxlength: [100, 'Course title cannot be longer than 100 characters'],
      minlength: [2, 'Course title cannot be shorter than 2 characters']
    },
    description: {
      type: String,
      required: [true, 'Course must have a description'],
      maxlength: [
        500,
        'Course description cannot be longer than 500 characters'
      ]
    },
    weeks: {
      type: Number,
      required: [true, 'Please provide number of weeks for the course'],
      min: [1, 'Number of weeks cannot be less than 1']
    },
    tuition: {
      type: Number,
      required: [true, 'Please provide tuition for the course'],
      min: [0, 'tuition cannot be less than 0']
    },
    minimumSkill: {
      type: String,
      required: [true, 'Please provide minimum skill'],
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message:
          'Minimum skill must be one of beginner, intermediate or advanced'
      }
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: [true, 'Course must belong to a bootcamp']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Static method only accessible on Models
courseSchema.statics.calcAverageCost = async function (bootcampId) {
  const stats = await this.aggregate([
    {
      $match: {
        bootcamp: bootcampId
      }
    },
    {
      $group: {
        _id: '$bootcamp',
        avgCost: { $avg: '$tuition' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: stats[0].avgCost
    });
  }
};

courseSchema.post('save', async function () {
  await this.constructor.calcAverageCost(this.bootcamp);
});

courseSchema.pre('remove', async function () {
  await this.constructor.calcAverageCost(this.bootcamp);
});

courseSchema.pre(/^findOneAnd/, async function (next) {
  this.C = await this.findOne();
  next();
});

courseSchema.post(/^findOneAnd/, async function () {
  await this.C.constructor.calcAverageCost(this.C.bootcamp);
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
