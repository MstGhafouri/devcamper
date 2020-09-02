const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const bootcampSchema = new mongoose.Schema({
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
      'Data science',
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
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
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
});

bootcampSchema.index({ startLocation: '2dsphere' });

// Create slug before saving document
bootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Bootcamp = mongoose.model('Bootcamp', bootcampSchema);

module.exports = Bootcamp;
