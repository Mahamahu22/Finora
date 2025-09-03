const router = require("express").Router();
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const schema = require("../validations/user.validation");
const ctrl = require("../controllers/user.controller");

router.get("/profile", auth, ctrl.getProfile);
router.put("/profile", auth, validate(schema.updateProfile), ctrl.updateProfile);

module.exports = router;