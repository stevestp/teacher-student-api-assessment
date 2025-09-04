/**
 * Validation middleware factory
 * Creates middleware to validate request body, query, or params against Joi schema
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    let dataToValidate;

    switch (source) {
      case 'body':
        dataToValidate = req.body;
        break;
      case 'query':
        dataToValidate = req.query;
        break;
      case 'params':
        dataToValidate = req.params;
        break;
      default:
        dataToValidate = req.body;
    }

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');

      return res.status(400).json({
        message: `Validation error: ${errorMessage}`
      });
    }

    // Replace the original data with validated and sanitized data
    if (source === 'body') {
      req.body = value;
    } else if (source === 'query') {
      req.query = value;
    } else if (source === 'params') {
      req.params = value;
    }

    next();
  };
};

module.exports = { validateRequest };
