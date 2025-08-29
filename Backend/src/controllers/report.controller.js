const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const { exportCSV } = require("../utils/csv");
const { exportPDF } = require("../utils/pdf");

exports.summary = async (req, res) => {
  try {
    const userId = req.user.id; // UUID
    const { startDate, endDate } = req.query;

    const expMatch = { userId, active: true };
    const incMatch = { userId, active: true };

    if (startDate && endDate) {
      expMatch.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      incMatch.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const [expenseAgg, incomeAgg] = await Promise.all([
      Expense.aggregate([
        { $match: expMatch },
        {
          $group: {
            _id: null,
            totalExpenses: {
              $sum: {
                $cond: [{ $ifNull: ["$incomeId", false] }, 0, "$amount"]
              }
            },
            linkedExpenses: {
              $sum: {
                $cond: [{ $ifNull: ["$incomeId", false] }, "$amount", 0]
              }
            }
          }
        }
      ]),
      Income.aggregate([
        { $match: incMatch },
        { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
      ])
    ]);

    const totalExpenses = expenseAgg[0]?.linkedExpenses || 0;  // only linked
    const generalExpenses = expenseAgg[0]?.totalExpenses || 0;  // general
    const totalIncome = incomeAgg[0]?.totalIncome || 0;

    const balance = totalIncome - totalExpenses;

    res.json({
      status: "success",
      message: "Summary report generated",
      report: {
        email: req.user.email,
        startDate,
        endDate,
        totalIncome,
        linkedExpenses: totalExpenses,
        generalExpenses,
        balance
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to generate summary report",
      error: error.message
    });
  }
};

/**
 * Monthly trends grouped by year/month
 */
exports.monthly = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const expMatch = { userId, active: true };
    const incMatch = { userId, active: true };

    if (startDate && endDate) {
      expMatch.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      incMatch.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const [exp, inc] = await Promise.all([
      // 👉 Expenses grouped by category + income source
      Expense.aggregate([
        { $match: expMatch },
        {
          $lookup: {
            from: "incomes",            // Mongo collection (check plural)
            localField: "incomeId",
            foreignField: "id",
            as: "incomeInfo"
          }
        },
        { $unwind: { path: "$incomeInfo", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: {
              category: "$category",
              fromSource: "$incomeInfo.source"
            },
            count: { $sum: 1 },
            total: { $sum: "$amount" }
          }
        },
        // ✅ Flatten fields (remove `_id`)
        {
          $project: {
            _id: 0,
            category: "$_id.category",
            fromSource: "$_id.fromSource",
            count: 1,
            total: 1
          }
        },
        { $sort: { total: -1 } }
      ]),

      // 👉 Income grouped by source
      Income.aggregate([
        { $match: incMatch },
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
            total: { $sum: "$amount" }
          }
        },
        // ✅ Flatten fields (remove `_id`)
        {
          $project: {
            _id: 0,
            source: "$_id",
            count: 1,
            total: 1
          }
        },
        { $sort: { total: -1 } }
      ])
    ]);

    res.json({
      status: "success",
      message: "Monthly trends report generated",
      report: {
        email: req.user.email,
        startDate,
        endDate,
        expenses: exp,
        income: inc
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to generate monthly report",
      error: error.message
    });
  }
};


// * Category breakdown
 
exports.category = async (req, res) => {
  try {
    const userId = req.user.id; // <- UUID
    const { startDate, endDate } = req.query;

    const match = { userId, active: true };
    if (startDate && endDate) {
      match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const cat = await Expense.aggregate([
      { $match: match },
      { 
        $group: { 
          _id: "$category", 
          total: { $sum: "$amount" } 
        } 
      },
      { $sort: { total: -1 } },
      // ✅ reshape `_id` → `category`
      {
        $project: {
          _id: 0,               // remove _id
          category: "$_id",     // rename _id to category
          total: 1
        }
      }
    ]);

    res.json({
      status: "success",
      message: "Category breakdown generated",
      report: {
        email: req.user.email,
        startDate,
        endDate,
        categories: cat
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: "Failed to generate category report", 
      error: error.message 
    });
  }
};



// 👉 Export Report

exports.export = async (req, res) => {
  try {
    const { scope = "expenses", startDate, endDate } = req.query;
    const userId = req.user.id;

    let match = { userId, active: true };

    // 👉 Date Range (only startDate & endDate)
    if (startDate && endDate) {
      match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // 👉 Fetch Data
    let data = [];
    if (scope === "income") {
      data = await Income.find(match).lean();
    } else if (scope === "expenses") {
      data = await Expense.find(match).lean();
    } else if (scope === "all") {
      const incomes = await Income.find(match).lean();
      const expenses = await Expense.find(match).lean();
      data = [
        ...incomes.map(i => ({ ...i, type: "Income" })),
        ...expenses.map(e => ({ ...e, type: "Expense" }))
      ];
    }

    // 👉 Attach User Email
    data = data.map(item => ({ ...item, userEmail: req.user.email }));

    // 👉 Return JSON only
    return res.json({
      status: "success",
      message: `${scope.charAt(0).toUpperCase() + scope.slice(1)} report fetched`,
      data
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to export report",
      error: error.message
    });
  }
};
