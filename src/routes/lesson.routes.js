const express = require("express");
// mergeParams: true allows this router to read parameters from parent routers (like courseId)
const router = express.Router({ mergeParams: true }); 

const { createLesson } = require("../controllers/lesson.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware"); // Your multer setup

// Route: POST /api/courses/:courseId/lessons
// Notice the middleware chain: Protect -> Restrict -> Upload File -> Controller
router.post(
  "/", 
  protect, 
  restrictTo("professor"), 
  upload.single("file"), // "file" is the key we will use in Postman
  createLesson
);

module.exports = router;