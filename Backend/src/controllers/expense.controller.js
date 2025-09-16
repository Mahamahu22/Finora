const Expense = require("../models/Expense");
const mongoose = require("mongoose");
const Income = require("../models/Income");

// 🔹 format function unchanged
const formatExpense = (doc, incomeDoc = null) => {
  if (!doc) return null;
  return {
    id: doc.id,
    amount: doc.amount,
    category: doc.category,   // now free string
    note: doc.note,
    date: doc.date,
    active: doc.active,
    income: incomeDoc
      ? {
          id: incomeDoc.id,
          source: incomeDoc.source,
          amount: incomeDoc.amount,
        }
      : null,
    user: {
      id: doc.userId,
      email: doc.userEmail,
    },
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

// 👉 Create Expense
exports.create = async (req, res) => {
  try {
    const { incomeId, ...rest } = req.body;

    let incomeDoc = null;

    if (incomeId) {
      // 1. Find linked income
      incomeDoc = await Income.findOne({ id: incomeId, userId: req.user.id });
      if (!incomeDoc) {
        return res.status(404).json({ success: false, message: "Income not found" });
      }

      // 2. Get total expenses already spent from this income
      const totalSpent = await Expense.aggregate([
        { $match: { incomeId, userId: req.user.id, active: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const spent = totalSpent.length > 0 ? totalSpent[0].total : 0;

      // 3. Check available balance
      const available = incomeDoc.amount - spent;

      if (rest.amount > available) {
        return res.status(400).json({
          success: false,
          message: `Not enough balance! Available: ${available}, Tried: ${rest.amount}`
        });
      }
    }

    // 4. Create expense if valid
    const doc = await Expense.create({
      ...rest,
      userId: req.user.id,
      userEmail: req.user.email,
      incomeId: incomeId || null,
      active: true,
    });

    res.status(201).json({
      status: "success",
      message: "Expense created successfully",
      expense: formatExpense(doc, incomeDoc),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// 👉 List Expenses
exports.list = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const filter = { userId: req.user.id, active: true };
    const [items, total] = await Promise.all([
      Expense.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Expense.countDocuments(filter),
    ]);

    // fetch linked income for each expense
    const expenseList = await Promise.all(
      items.map(async (doc) => {
        let incomeDoc = null;
        if (doc.incomeId) {
          incomeDoc = await Income.findOne({ id: doc.incomeId }).select("id source amount");
        }
        return formatExpense(doc, incomeDoc);
      })
    );

    res.json({
      status: "success",
      message: "Expenses fetched successfully",
      data: expenseList,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 👉 Get One Expense
exports.getOne = async (req, res) => {
  try {
    const doc = await Expense.findOne({
      id: req.params.id,
      userId: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    let incomeDoc = null;
    if (doc.incomeId) {
      incomeDoc = await Income.findOne({ id: doc.incomeId }).select("id source amount");
    }

    res.json({
      status: "success",
      message: "Expense fetched successfully",
      expense: formatExpense(doc, incomeDoc),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 👉 Update Expense
exports.update = async (req, res) => {
  try {
    const { incomeId, ...rest } = req.body;

    const doc = await Expense.findOneAndUpdate(
      { id: req.params.id, userId: req.user.id },
      { ...rest, incomeId: incomeId || null, userEmail: req.user.email },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    let incomeDoc = null;
    if (doc.incomeId) {
      incomeDoc = await Income.findOne({ id: doc.incomeId }).select("id source amount");
    }

    res.json({
      status: "success",
      message: "Expense updated successfully",
      expense: formatExpense(doc, incomeDoc),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 👉 Soft Delete Expense
exports.remove = async (req, res) => {
  try {
    const doc = await Expense.findOneAndUpdate(
      { id: req.params.id, userId: req.user.id },
      { active: false },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.json({
      status: "success",
      message: "Expense deleted successfully",
      deletedId: doc.id,
      user: { email: doc.userEmail },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};