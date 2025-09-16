const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const expenseSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },

    // 🔹 Allow user-defined categories (no enum restriction)
    category: { type: String, required: true, trim: true },

    note: { type: String, trim: true },
    date: { type: Date, default: Date.now },

    incomeId: { type: String, ref: "Income" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
