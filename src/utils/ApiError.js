class ApiError extends Error {
  constructor(
    statusCode,
    data = null,
    errors = [],
    message = "Something went wrong!",
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = data;
    this.errors = errors;
    this.message = errors || message;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
