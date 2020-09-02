const ErrorResponse = require('../utils/errorResponse');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

// Get all documents
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const apiFeatures = new APIFeatures(Model.find(), req.query)
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
exports.getOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

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
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new ErrorResponse('No document found with that ID', 404));

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
