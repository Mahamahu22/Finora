const jwt = require("jsonwebtoken");

function sign(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d"
  });
}

module.exports = { sign };
