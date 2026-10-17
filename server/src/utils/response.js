exports.sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

exports.sendPaginated = (res, data, total, page, limit, message = 'Success') => {
  res.status(200).json({
    success: true, message, data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
};

exports.sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ success: false, message });
};
