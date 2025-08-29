const Joi = require("joi");

const updateProfile = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().optional(),
    email: Joi.string().email().optional()
  })
});

module.exports = { updateProfile };
