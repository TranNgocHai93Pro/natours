const catchAsync = require('../utils/catchAsync');
const AppErrors = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.createOne = Model =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id, {
      new: true,
      runValidators: true
    });
    if (!doc) next(new AppErrors('Not found Document to delete', 404));
    //204 chỉ có response nào được trả về
    console.log('Delete document successfull!');
    res.status(204).json({
      status: 'Successful',
      data: {
        doc
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const updateContent = req.body;
    const doc = await Model.findOneAndUpdate(
      { _id: req.params.id },
      updateContent,
      {
        // returnOriginal: false,
        new: true,
        runValidators: true
      }
    );
    if (!doc) next(new AppErrors('Not found Document to update', 404));
    res.status(200).json({
      status: 'Successful',
      data: {
        doc
      }
    });
  });

exports.getOne = (Model, optionPop) =>
  catchAsync(async (req, res, next) => {
    // console.log(req.params.id);
    let query = Model.findById(req.params.id);
    if (optionPop) query = query.populate(optionPop);
    const doc = await query;

    if (!doc) next(new AppErrors('Not found Tour', 404));
    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.idTour) filter = { tour: req.params.idTour };
    // console.log('filter-factoryController68', filter);
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit();

    const x = await features.pagination();

    let doc = await x.query;
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        data: doc
      }
    });
  });
