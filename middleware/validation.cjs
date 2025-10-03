const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema object with body, query, params
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    };

    const toValidate = {};
    if (schema.body) toValidate.body = req.body;
    if (schema.query) toValidate.query = req.query;
    if (schema.params) toValidate.params = req.params;

    const { error, value } = Joi.object(schema).validate(toValidate, validationOptions);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace request data with validated/sanitized data
    if (value.body) req.body = value.body;
    if (value.query) req.query = value.query;
    if (value.params) req.params = value.params;

    next();
  };
}

// Common validation schemas
const schemas = {
  // Task creation
  createTask: {
    body: Joi.object({
      type: Joi.string().valid('metrics_snapshot', 'content_index', 'readiness_check', 'lead_sweep').required(),
      reason: Joi.string().max(500).default('manual enqueue'),
      payload: Joi.object().default({})
    })
  },

  // Search query
  search: {
    query: Joi.object({
      q: Joi.string().max(200).required()
    })
  },

  // Ask endpoint
  ask: {
    body: Joi.object({
      question: Joi.string().max(1000).required()
    })
  },

  // Lead submission
  lead: {
    body: Joi.object({
      name: Joi.string().max(100).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[0-9\-\+\(\)\s]+$/).max(20).optional(),
      message: Joi.string().max(2000).optional(),
      source: Joi.string().max(50).optional()
    })
  },

  // Task ID param
  taskId: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  }
};

module.exports = { validate, schemas };
