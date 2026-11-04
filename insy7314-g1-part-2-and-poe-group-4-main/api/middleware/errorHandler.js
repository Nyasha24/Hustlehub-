const errorHandler = (err, req, res, _next) => {
  console.error('Unhandled API Error:', err.message);

  return res.status(500).json({
    error: 'Something went wrong'
  });
};

module.exports = errorHandler;