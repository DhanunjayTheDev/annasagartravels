const standardResponse = (req, res, next) => {
  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.created = (data, message = 'Created successfully') => {
    return res.success(data, message, 201);
  };

  res.noContent = () => {
    return res.status(204).end();
  };

  res.paginated = (data, pagination, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  };

  next();
};

module.exports = { standardResponse };
