const Joi = require("joi");

const updateProfile = Joi.object({
  name: Joi.string().trim().optional(),
  email: Joi.string().email().optional()
});

module.exports = { updateProfile };
