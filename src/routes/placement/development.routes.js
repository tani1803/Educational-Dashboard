const express = require("express");
const router = express.Router();
const { getDevQuestions, addDevQuestion, toggleDevQuestion } = require("../../controllers/placement/development.controller");
const { protect } = require("../../middleware/auth.middleware");
const { attachPlacementRole } = require("../../middleware/placement.middleware");

// Apply middleware
router.use(protect);
router.use(attachPlacementRole);

// Routes
router.get("/questions", getDevQuestions);
router.post("/questions", addDevQuestion);
router.post("/questions/:id/toggle", toggleDevQuestion);

module.exports = router;
