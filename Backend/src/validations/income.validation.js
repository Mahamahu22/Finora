const Joi = require("joi");
const { INCOME_SOURCES } = require("../constants");

const createIncome = Joi.object({
  amount: Joi.number().min(0).required(),
  source: Joi.string().valid(...INCOME_SOURCES).required(),
  note: Joi.string().allow("", null),
  date: Joi.date().optional()
});

const idParam = Joi.string().required();

const updateIncome = Joi.object({
  amount: Joi.number().min(0).optional(),
  source: Joi.string().valid(...INCOME_SOURCES).optional(),
  note: Joi.string().allow("", null),
  date: Joi.date().optional(),
  active: Joi.boolean().optional()
});

const byId = Joi.object({
  id: idParam
});

module.exports = { createIncome, updateIncome, byId };
