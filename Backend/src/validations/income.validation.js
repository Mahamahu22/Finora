const Joi = require("joi");
const { INCOME_SOURCES } = require("../constants");

// ✅ Create Income Validation
const createIncome = Joi.object({
  amount: Joi.number().min(0).required(),
  source: Joi.alternatives().try(
    Joi.string().valid(...INCOME_SOURCES), // dropdown option
    Joi.string().trim().min(1)             // custom string
  ).required(),
  note: Joi.string().allow("", null),
  date: Joi.date().optional()
});

// ✅ ID Validation
const idParam = Joi.string().required();

// ✅ Update Income Validation
const updateIncome = Joi.object({
  amount: Joi.number().min(0).optional(),
  source: Joi.alternatives().try(
    Joi.string().valid(...INCOME_SOURCES), // dropdown option
    Joi.string().trim().min(1)             // custom string
  ).optional(),
  note: Joi.string().allow("", null),
  date: Joi.date().optional(),
  active: Joi.boolean().optional()
});

// ✅ ById Validation
const byId = Joi.object({
  id: idParam
});

module.exports = { createIncome, updateIncome, byId };
