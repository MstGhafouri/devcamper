const catchAsync = require('./catchAsync');
const ErrorResponse = require('./errorResponse');

// This middleware is used to handle permission to update or delete bootcamps or courses
// Make sure only bootcamp or course owners are allowed to update and delete their bootcamps or courses
module.exports = Model =>
  catchAsync(async (req, res, next) => {
    // 1. Check if bootcamp exists
    const doc = await Model.findById(req.params.id);
    if (!doc)
      return next(new ErrorResponse('No document found with that ID', 404));
    // 2. Make sure user is the document owner
    if (doc.user.toString() !== req.user.id && req.user.role !== 'admin')
      return next(
        new ErrorResponse(
          'You do not have permission to perform this action',
          403
        )
      );

    next();
  });
