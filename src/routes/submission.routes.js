const express = require("express");
const router = express.Router({ mergeParams: true }); 
const { submitAssignment, getSubmissionsForCourse } = require("../controllers/submission.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// Route: POST /api/courses/:courseId/submissions
router.post(
  "/", 
  protect, 
  restrictTo("student"), // ONLY students can hit this route!
  upload.single("file"), 
  submitAssignment
);


// ... existing POST route ...

// Route: GET /api/courses/:courseId/submissions
router.get(
  "/", 
  protect, 
  restrictTo("professor"), // Only professors can view the submission list
  getSubmissionsForCourse
);

module.exports = router;