const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("id name email active createdAt updatedAt");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        responseAt: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "User profile fetched successfully",
      data: user,
      responseAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
      responseAt: new Date().toISOString(),
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      select: "id name email active createdAt updatedAt"
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        responseAt: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "User profile updated successfully",
      data: user,
      responseAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
      responseAt: new Date().toISOString(),
    });
  }
};
