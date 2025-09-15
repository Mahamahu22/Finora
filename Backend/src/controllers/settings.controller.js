const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * GET /settings
 * Returns the current user's preferences object
 */
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("preferences");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ preferences: user.preferences });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * PUT /settings
 * Update user preferences.
 * Accepts: currency, theme
 * Only updates the fields provided in req.body.
 */
exports.updateSettings = async (req, res) => {
  try {
    const { currency, theme } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Build update object only with provided values
    const prefs = { ...(user.preferences || {}) };

    if (currency !== undefined) prefs.currency = String(currency);
    if (theme !== undefined && ["light", "dark"].includes(String(theme))) {
      prefs.theme = String(theme);
    }

    user.preferences = prefs;
    await user.save();

    return res.json({
      message: "Settings updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * PUT /settings/password
 * Change current user's password
 * Accepts: oldPassword, newPassword
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both oldPassword and newPassword are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid old password" });

    // Assign plain new password; User pre('save') will hash it
    user.password = newPassword;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
