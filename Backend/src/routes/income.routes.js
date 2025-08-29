const router = require("express").Router();
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const schema = require("../validations/income.validation");
const ctrl = require("../controllers/income.controller");

// Create income
router.post("/", auth, validate(schema.createIncome, "body"), ctrl.create);

// List all incomes
router.get("/", auth, ctrl.list);

// Get one income
router.get("/:id", auth, validate(schema.byId, "params"), ctrl.getOne);

// Update income
router.put("/:id", auth, validate(schema.updateIncome, "body"), ctrl.update);

// Delete income
router.delete("/:id", auth, validate(schema.byId, "params"), ctrl.remove);

module.exports = router;
