const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const schema = require("../validations/auth.validation");

router.post("/register", validate(schema.register), ctrl.register);
router.post("/login", validate(schema.login), ctrl.login);
router.post("/logout", ctrl.logout);

module.exports = router;
