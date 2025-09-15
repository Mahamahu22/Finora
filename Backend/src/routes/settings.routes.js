const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  changePassword,
} = require("../controllers/settings.controller");
const authMiddleware = require("../middlewares/auth");

// ✅ GET /api/settings → fetch current user preferences
router.get("/", authMiddleware, getSettings);

// ✅ PUT /api/settings → update user preferences
router.put("/", authMiddleware, updateSettings);

// ✅ PUT /api/settings/password → change password
router.put("/password", authMiddleware, changePassword);

module.exports = router;
