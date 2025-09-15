const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true }, // UUID v4
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    active: { type: Boolean, default: true },

    // ✅ Settings / Preferences
    preferences: {
      currency: { type: String, default: "INR" },
      // dateFormat removed
      theme: { type: String, enum: ["light", "dark"], default: "dark" },
      // Removed: budgetAlert, reminderFrequency, budgetLimit
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
