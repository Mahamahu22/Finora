const Joi = require("joi");
const { EXPENSE_CATEGORIES } = require("../constants");

const createExpense = Joi.object({
  title: Joi.string().optional(),
  amount: Joi.number().min(0).required(),
  category: Joi.string().valid(...EXPENSE_CATEGORIES).required(),
  note: Joi.string().allow("", null),
  date: Joi.date().required(),
  incomeId: Joi.string().optional()   // ✅ instead of source
});

const updateExpense = Joi.object({
  amount: Joi.number().min(0).optional(),
  category: Joi.string().valid(...EXPENSE_CATEGORIES).optional(),
  note: Joi.string().allow("", null),
  date: Joi.date().optional(),
  active: Joi.boolean().optional(),
  incomeId: Joi.string().optional()   // ✅ instead of source
});

const byId = Joi.object({
  id: Joi.string().required()
});

module.exports = { createExpense, updateExpense, byId };
