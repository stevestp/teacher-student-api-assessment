const Joi = require('joi');

// Email validation schema
const emailSchema = Joi.string().email().required();

// Register endpoint validation
const registerSchema = Joi.object({
  teacher: emailSchema,
  students: Joi.array().items(emailSchema).min(1).required()
});

// Common students endpoint validation
const commonStudentsSchema = Joi.object({
  teacher: Joi.alternatives().try(emailSchema, Joi.array().items(emailSchema).min(1)).required()
});

// Suspend endpoint validation
const suspendSchema = Joi.object({
  student: emailSchema
});

// Retrieve for notifications endpoint validation
const retrieveForNotificationsSchema = Joi.object({
  teacher: emailSchema,
  notification: Joi.string().required()
});

// Query parameter validation for common students
const queryTeacherSchema = Joi.object({
  teacher: Joi.alternatives()
    .try(Joi.string().email(), Joi.array().items(Joi.string().email()).min(1))
    .required()
});

module.exports = {
  registerSchema,
  commonStudentsSchema,
  suspendSchema,
  retrieveForNotificationsSchema,
  queryTeacherSchema,
  emailSchema
};
