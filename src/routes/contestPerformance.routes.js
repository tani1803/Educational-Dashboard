const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
  addPerformance,
  getMyPerformances,
  deletePerformance
} = require("../controllers/contestPerformance.controller");

const router = express.Router();

router.use(protect); // All routes require login

router.post("/", addPerformance);
router.get("/me", getMyPerformances);
router.delete("/:id", deletePerformance);

module.exports = router;
