// Centralized Express error handler
export default function errorHandler(err, req, res, next) {
  // Default response
  let statusCode = err.statusCode || 500;
  let payload = { message: err.message || 'Server error' };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = {};
    Object.keys(err.errors || {}).forEach((field) => {
      errors[field] = err.errors[field].message;
    });
    payload = { message: 'Validation failed', errors };
  }

  // Mongo duplicate key error
  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    const errors = {};
    Object.keys(err.keyValue).forEach((field) => {
      errors[field] = `${err.keyValue[field]} already exists`;
    });
    payload = { message: 'Duplicate field(s)', errors };
  }

  // CastError (invalid ObjectId etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    payload = { message: `Invalid ${err.path}: ${err.value}` };
  }

  // If controller already supplied a errors object on the error
  if (err.errors && typeof err.errors === 'object' && !Array.isArray(err.errors)) {
    payload = { message: err.message || 'Validation failed', errors: err.errors };
    statusCode = err.statusCode || statusCode;
  }

  // Log server errors in development
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json(payload);
}
