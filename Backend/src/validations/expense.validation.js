const Joi = require("joi");

// 🔹 Allow any string for category (no fixed enums now)
const createExpense = Joi.object({
  title: Joi.string().optional(),
  amount: Joi.number().min(0).required(),
  category: Joi.string().min(2).max(50).required(),  // free text category
  note: Joi.string().allow("", null),
  date: Joi.date().required(),
  incomeId: Joi.string().optional()
});

const updateExpense = Joi.object({
  amount: Joi.number().min(0).optional(),
  category: Joi.string().min(2).max(50).optional(),
  note: Joi.string().allow("", null),
  date: Joi.date().optional(),
  active: Joi.boolean().optional(),
  incomeId: Joi.string().optional()
});

const byId = Joi.object({
  id: Joi.string().required()
});

module.exports = { createExpense, updateExpense, byId };
