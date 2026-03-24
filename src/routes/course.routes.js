const express = require("express");
const router = express.Router();

const { createCourse, getCourses, enrollInCourse } = require("../controllers/course.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

// all can see course
router.get("/", getCourses);

// Professor only to create course 
router.post("/", protect, restrictTo("professor"), createCourse);

// Student only enroll in course 
router.post("/:id/enroll", protect, restrictTo("student"), enrollInCourse);

module.exports = router;
