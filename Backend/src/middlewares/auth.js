const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { TOKEN_HEADER } = require("../constants");

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers[TOKEN_HEADER];
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: req.t("errors.unauthorized") });
    }
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: payload.sub, active: true });
    if (!user) return res.status(401).json({ error: req.t("errors.unauthorized") });
    //req.user = { id: user._id, email: user.email, name: user.name };
    req.user = { 
  _id: user._id,              // ObjectId
  id: String(user._id),       // String version
  email: user.email, 
  name: user.name 
};

    next();
  } catch {
    return res.status(401).json({ error: req.t("errors.unauthorized") });
  }
};
