const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const bootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Bootcamp must have a name'],
      maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
      type: String,
      validate: [validator.isURL, 'Please provide a valid website address']
    },
    phone: {
      type: String,
      match: [
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
        'Please provide a valid phone number'
      ]
    },
    email: {
      type: String,
      validate: [validator.isEmail, 'Please provide a valid email address']
    },
    address: {
      type: String,
      required: [true, 'Please provide a valid address']
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        'Mobile Development',
        'Web Development',
        'Data Science',
        'Business',
        'UI/UX',
        'Other'
      ]
    },
    averageRating: {
      type: Number,
      min: [1, 'Average rating must be at least 1'],
      max: [10, 'Average rating can not be more than 10']
    },
    averageCost: {
      type: Number,
      set: val => Math.round(val * 10) / 10
    },
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Bootcamp must belong to a user']
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

bootcampSchema.index({ startLocation: '2dsphere' });

// Virtual Populate Courses
bootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
});

// Create slug before saving document
bootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Create and geocode location field
bootcampSchema.pre('save', async function (next) {
  const loc = (await geocoder.geocode(this.address))[0];

  this.location = {
    type: 'Point',
    coordinates: [loc.longitude, loc.latitude],
    formattedAddress: loc.formattedAddress,
    street: loc.street,
    city: loc.city,
    state: loc.stateCode,
    zipcode: loc.zipcode,
    country: loc.countryCode
  };
  // Remove address field from the document
  this.address = undefined;
  next();
});

// Cascade delete courses when a bootcamp is deleted
bootcampSchema.pre('remove', async function (next) {
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

const Bootcamp = mongoose.model('Bootcamp', bootcampSchema);

module.exports = Bootcamp;
