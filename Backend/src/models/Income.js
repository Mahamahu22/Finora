const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { INCOME_SOURCES } = require("../constants");

const incomeSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },

    amount: { type: Number, required: true, min: 0 },
    source: { type: String, enum: INCOME_SOURCES, required: true },
    note: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Income", incomeSchema);
