const { BadRequestError } = require('../utils/errors');

/**
 * Validate request body/params/query using a Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'params' | 'query'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new BadRequestError(`Validation failed: ${errors.map((e) => e.message).join(', ')}`));
    }
    req[source] = result.data;
    next();
  };
};

module.exports = { validate };
