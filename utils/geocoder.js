// Node library for geocoding and reverse geocoding
const NodeGeocoder = require('node-geocoder');

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  apiKey: process.env.GEOCODER_API_KEY,
  httpAdapter: 'https',
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
