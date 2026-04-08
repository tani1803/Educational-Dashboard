const express = require("express");
const router = express.Router();
const { getDSAQuestions, addDSAQuestion, toggleDSAQuestion } = require("../../controllers/placement/dsa.controller");
const { protect } = require("../../middleware/auth.middleware");
const { attachPlacementRole } = require("../../middleware/placement.middleware");

// Apply middleware
router.use(protect);
router.use(attachPlacementRole);

// Routes
router.get("/questions", getDSAQuestions);
router.post("/questions", addDSAQuestion);
router.post("/questions/:id/toggle", toggleDSAQuestion);

module.exports = router;
