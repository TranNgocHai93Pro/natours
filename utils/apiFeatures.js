const Tours = require('../model/tourModel');

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    try {
      //  Filter query
      const queryObj = { ...this.queryString };
      const excluedFields = ['limit', 'sort', 'page', 'fields'];
      excluedFields.forEach(el => delete queryObj[el]);

      // Advanced query
      const queryStr = JSON.stringify(queryObj);
      const updateStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        match => `$${match}`
      );

      // console.log(updateQueryObj);
      this.query = this.query.find(JSON.parse(updateStr));

      return this;
    } catch (err) {
      console.error(err);
      return this;
    }
  }

  sort() {
    try {
      // Sort documents
      if (this.queryString.sort) {
        // const sortBy = req.query.sort.split(',').join(' ');
        const sortBy = this.queryString.sort;
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createAt');
      }
      return this;
    } catch (err) {
      console.error(err);
      if (err) return err;
      return this;
    }
  }

  limit() {
    // Limit documents
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join('');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  async pagination() {
    try {
      // Pagination page
      const page = this.queryString.page * 1 || 1;
      const valueLimit = this.queryString.limit * 1 || 100;
      const valueSkip = (page - 1) * valueLimit;
      this.query = this.query.skip(valueSkip).limit(valueLimit);

      if (this.queryString.page) {
        const numberDocuments = await Tours.countDocuments();
        if (valueSkip > numberDocuments) {
          console.log('Page not found');
        }
      }
      return this;
    } catch (err) {
      console.error(err);
      return this;
    }
  }
}

module.exports = ApiFeatures;
