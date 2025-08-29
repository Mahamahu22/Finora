const router = require("express").Router();
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const schema = require("../validations/expense.validation");
const ctrl = require("../controllers/expense.controller");

router.post("/", auth, validate(schema.createExpense), ctrl.create);
router.get("/", auth, ctrl.list);
router.get("/:id", auth, ctrl.getOne);
router.put("/:id", auth, validate(schema.updateExpense), ctrl.update);
router.delete("/:id", auth, validate(schema.byId, "params"),ctrl.remove);

module.exports = router;
