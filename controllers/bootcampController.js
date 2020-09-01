const serviceController = require('./serviceController');
const Bootcamp = require('../models/bootcampModel');

// CRUD operations Handlers ( Create, Read, Update, Delete)
exports.getAllBootcamps = serviceController.getAll(Bootcamp);
exports.getBootcamp = serviceController.getOne(Bootcamp);
exports.createNewBootcamp = serviceController.createOne(Bootcamp);
exports.updateBootcamp = serviceController.updateOne(Bootcamp);
exports.deleteBootcamp = serviceController.deleteOne(Bootcamp);
