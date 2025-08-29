const mongoose = require("mongoose");
const Income = require("../models/Income");
const Expense = require("../models/Expense");

// 👉 Format income with expenses + remaining
const formatIncomeWithExpenses = async (income, userId) => {
  // find total expenses linked to this income
  const expensesData = await Expense.aggregate([
    { $match: { incomeId: income.id, userId } }, // ⚠️ make sure Income model has "id" (UUID)
    { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
  ]);

  const totalExpenses = expensesData[0]?.totalExpenses || 0;

  return {
    id: income.id, // UUID field (if exists)
    _id: income._id, // MongoDB ObjectId (always exists)
    amount: income.amount,
    source: income.source,
    note: income.note,
    date: income.date,
    active: income.active,
    user: {
      id: income.userId,
      email: income.userEmail,
    },
    createdAt: income.createdAt,
    updatedAt: income.updatedAt,
    expenses: totalExpenses,
    remaining: income.amount - totalExpenses,
  };
};

// 👉 Create Income
exports.create = async (req, res) => {
  try {
    const doc = await Income.create({
      ...req.body,
      userId: req.user.id,
      userEmail: req.user.email,
    });

    const formatted = await formatIncomeWithExpenses(doc, req.user.id);

    res.status(201).json({
      status: "success",
      message: "Income created successfully",
      income: formatted,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// 👉 List Income (with pagination)
exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const q = { userId: req.user.id, active: true };

    const [incomes, total] = await Promise.all([
      Income.find(q)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Income.countDocuments(q),
    ]);

    const result = await Promise.all(
      incomes.map((income) => formatIncomeWithExpenses(income, req.user.id))
    );

    res.json({
      status: "success",
      message: "Income list with expenses calculated",
      items: result,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// 👉 Helper: find by _id or UUID
const findByIdOrUUID = async (id, userId) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Income.findOne({ _id: id, userId });
  } else {
    return Income.findOne({ id, userId }); // assumes "id" is UUID field
  }
};

// 👉 Get Single Income
exports.getOne = async (req, res) => {
  try {
    const doc = await findByIdOrUUID(req.params.id, req.user.id);
    if (!doc)
      return res.status(404).json({ status: "error", message: "Income not found" });

    const formatted = await formatIncomeWithExpenses(doc, req.user.id);

    res.json({
      status: "success",
      message: "Income retrieved successfully",
      income: formatted,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 👉 Update Income
exports.update = async (req, res) => {
  try {
    let doc;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      doc = await Income.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true }
      );
    } else {
      doc = await Income.findOneAndUpdate(
        { id: req.params.id, userId: req.user.id },
        req.body,
        { new: true }
      );
    }

    if (!doc)
      return res.status(404).json({ status: "error", message: "Income not found" });

    const formatted = await formatIncomeWithExpenses(doc, req.user.id);

    res.json({
      status: "success",
      message: "Income updated successfully",
      income: formatted,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 👉 Soft Delete Income
exports.remove = async (req, res) => {
  try {
    let doc;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      doc = await Income.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { active: false },
        { new: true }
      );
    } else {
      doc = await Income.findOneAndUpdate(
        { id: req.params.id, userId: req.user.id },
        { active: false },
        { new: true }
      );
    }

    if (!doc)
      return res.status(404).json({ status: "error", message: "Income not found" });

    const formatted = await formatIncomeWithExpenses(doc, req.user.id);

    res.json({
      status: "success",
      message: "Income deleted successfully",
      income: formatted,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
