const ErrorResponse = require('../utils/errorResponse');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

// Get all documents
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow nested Get courses on Bootcamp
    // /api/v1/bootcamps/:bootcampId/courses
    // /api/v1/bootcamps/:bootcampId/reviews
    let filter = {};
    if (req.params.bootcampId) filter = { bootcamp: req.params.bootcampId };

    const apiFeatures = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await apiFeatures.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        [Model.collection.name]: docs
      }
    });
  });

// Get one document
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    const modelName = Model.collection.name.slice(0, -1);
    if (!doc)
      return next(new ErrorResponse(`No ${modelName} found with that ID`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        [modelName]: doc
      }
    });
  });

// Create new document
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    const modelName = Model.collection.name.slice(0, -1);
    res.status(201).json({
      status: 'success',
      data: {
        [modelName]: newDoc
      }
    });
  });

// Update one document
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    const modelName = Model.collection.name.slice(0, -1);

    if (!updatedDoc)
      return next(new ErrorResponse(`No ${modelName} found with that ID`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        [modelName]: updatedDoc
      }
    });
  });

// Delete one document
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc)
      return next(new ErrorResponse('No document found with that ID', 404));

    doc.remove(); // Remove it in this way to trigger the pre hook middleware

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
