class APIFeatures {
  constructor(query, requestQuery) {
    this.query = query;
    this.requestQuery = requestQuery;
  }

  filter() {
    const queryObj = { ...this.requestQuery };
    // Exclude unwanted fields from the query object
    const excludedFields = ['sort', 'limit', 'page', 'select'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Prepend $ for mongodb operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in)\b/g,
      match => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if ('sort' in this.requestQuery) {
      const sortBy = this.requestQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('-createdAt');
    return this;
  }

  limitFields() {
    if ('select' in this.requestQuery) {
      const fields = this.requestQuery.select.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = +this.requestQuery.page || 1;
    const limit = +this.requestQuery.limit || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
