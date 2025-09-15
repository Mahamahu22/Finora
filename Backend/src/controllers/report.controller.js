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
        name: req.user.name, 
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

// Monthly trends grouped by year/month
exports.monthly = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const match = { userId, active: true };

    if (startDate && endDate) {
      match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const [expenses, income] = await Promise.all([
      Expense.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            total: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            expenses: "$total",
          },
        },
      ]),

      Income.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            total: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            income: "$total",
          },
        },
      ]),
    ]);

    // 🔗 Merge income + expenses by year/month
    const reportMap = new Map();

    expenses.forEach((e) => {
      const key = `${e.year}-${e.month}`;
      reportMap.set(key, { ...e });
    });

    income.forEach((i) => {
      const key = `${i.year}-${i.month}`;
      if (reportMap.has(key)) {
        reportMap.set(key, { ...reportMap.get(key), ...i });
      } else {
        reportMap.set(key, { ...i });
      }
    });

    const report = Array.from(reportMap.values()).map((r) => ({
      year: r.year,
      month: r.month,
      income: r.income || 0,
      expenses: r.expenses || 0,
      net: (r.income || 0) - (r.expenses || 0),
    }));

    res.json({
      status: "success",
      message: "Monthly trends report generated",
      report,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to generate monthly report",
      error: error.message,
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
    const { scope = "expenses", format = "json", startDate, endDate } = req.query;
    const userId = req.user.id;

    let match = { userId, active: true };

    // 👉 Date Range
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
        ...incomes.map((i) => ({ ...i, type: "Income" })),
        ...expenses.map((e) => ({ ...e, type: "Expense" })),
      ];
    }

    // 👉 Attach User Email
    data = data.map((item) => ({ ...item, userEmail: req.user.email }));

    // ✅ PDF Export
    if (format === "pdf") {
      const rangeText = startDate && endDate ? `${startDate} to ${endDate}` : null;
      const pdf = await exportPDF(data, scope === "all" ? "Combined Report" : scope, {
        range: rangeText,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${pdf.name}`);
      return res.send(pdf.buffer);
    }

    // ✅ CSV Export (later)
    if (format === "csv") {
      const csv = exportCSV(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${scope}_report.csv`);
      return res.send(csv);
    }

    // ✅ Default JSON
    return res.json({
      status: "success",
      message: `${scope.charAt(0).toUpperCase() + scope.slice(1)} report fetched`,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to export report",
      error: error.message,
    });
  }
};
