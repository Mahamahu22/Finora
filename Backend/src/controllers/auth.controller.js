const User = require("../models/User");
const { sign } = require("../services/token.service");

// 👉 Register (NO TOKEN)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        status: "error",
        message: req.t("errors.emailInUse"),
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      status: "success",
      message: req.t("auth.registered"),
      data: {
        user: { id: user.id, name: user.name, email: user.email }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 👉 Login (WITH TOKEN)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, active: true });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "error",
        message: req.t("errors.invalidCredentials"),
        timestamp: new Date().toISOString()
      });
    }

    const token = sign(user._id.toString());

    return res.json({
      status: "success",
      message: req.t("auth.loggedIn"),
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        token
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 👉 Logout
exports.logout = async (_req, res) => {
  return res.json({
    status: "success",
    message: req.t("auth.loggedOut"),
    timestamp: new Date().toISOString()
  });
};
