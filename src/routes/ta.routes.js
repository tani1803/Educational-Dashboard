const express = require("express");
const router = express.Router();
const {
  getAssignedCourses,
  getPendingSubmissions,
  updateComponentGrade
} = require("../controllers/ta.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

// Apply existing authentication and restrict to "ta" role
router.use(protect);
router.use(restrictTo("ta"));

// Route to get courses assigned to the logged-in TA
router.get("/assigned-courses", getAssignedCourses);

// Route to fetch ungraded submissions specifically for the courses the TA is assigned to
router.get("/pending-submissions", getPendingSubmissions);

// Route to update a specific component score in the Grade document
router.put("/grade/:courseId/:studentId", updateComponentGrade);

module.exports = router;
