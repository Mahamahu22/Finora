const router = require("express").Router();
const auth = require("../middlewares/auth");
const ctrl = require("../controllers/report.controller");

router.get("/summary", auth, ctrl.summary);
router.get("/monthly", auth, ctrl.monthly);
router.get("/category", auth, ctrl.category);
router.get("/export", auth, ctrl.export);

module.exports = router;
