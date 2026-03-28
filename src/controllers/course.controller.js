const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");
const courseService = require('../services/course.service');
const Lesson = require("../models/lesson.model");           // <-- ADD THIS
const Submission = require("../models/submission.model");   // <-- ADD THIS
const fs = require("fs");                                   // <-- ADD THIS

// 1. Get All Courses
exports.getCourses = async (req, res, next) => {
  try {
    // Re-adding your getCourses logic based on your Day 5 notes
    const courses = await Course.find()
      .populate("instructor", "name email collegeId")
      .select("-students -tas");
    return success(res, "Courses fetched successfully", courses);
  } catch (error) {
    next(error);
  }
};

// 2. Create Course (Prof Only)
exports.createCourse = async (req, res, next) => {
  try {
    const { courseId, title, description } = req.body;

    if (!courseId || !title || !description) {
      return res.status(400).json({ message: "courseId, title and description are required" });
    }

    const course = await Course.create({
      courseId,
      title,
      description,
      instructor: req.user.id
    });

    return success(res, "Course created successfully", course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Course with this ID already exists" });
    }
    next(error);
  }
};

// 3. Get Single Course
exports.getSingleCourse = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await courseService.getCourseById(courseId);

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        next(error);
    }
};


// 4. Student Enroll
exports.enrollInCourse = async (req, res, next) => {
  try {
    // REFACTORED: Use findOne with the custom courseId field
    const course = await Course.findOne({ courseId: req.params.id });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const alreadyEnrolled = course.students.some(
      (studentId) => studentId.toString() === req.user.id
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "You are already enrolled in this course" });
    }

    course.students.push(req.user.id);
    await course.save();

    return success(res, "Enrolled successfully", course);
  } catch (error) {
    next(error);
  }
};

// 5. Update Course (Owner Only)
exports.updateCourse = async (req, res, next) => {
  try {
    const customCourseId = req.params.id;
    
    // REFACTORED: Use findOne to search by custom courseId
    let course = await Course.findOne({ courseId: customCourseId });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Authorization logic (Unchanged)
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Forbidden: You can only update courses that you created" 
      });
    }

    // REFACTORED: Use findOneAndUpdate instead of findByIdAndUpdate
    course = await Course.findOneAndUpdate(
      { courseId: customCourseId }, 
      req.body, 
      { new: true, runValidators: true }
    );

    return success(res, "Course updated successfully", course);
  } catch (error) {
    next(error);
  }
};

// 6. Delete Course (Owner Only) + Cascading File Cleanup
exports.deleteCourse = async (req, res, next) => {
  try {
    const customCourseId = req.params.id;

    // 1. Find the course to check ownership
    const course = await Course.findOne({ courseId: customCourseId });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2. Authorization logic
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You can only delete courses that you created"
      });
    }

    // 3. Clean up Lessons
    const lessons = await Lesson.find({ course: course._id });
    lessons.forEach((lesson) => {
      if (lesson.fileUrl) {
        // Delete the physical lesson file
        fs.unlink(lesson.fileUrl, (err) => {
          if (err) console.error(`Warning: Failed to delete lesson file ${lesson.fileUrl}:`, err);
        });
      }
    });
    // Delete all lesson records from the DB for this course
    await Lesson.deleteMany({ course: course._id });

    // 4. Clean up Submissions
    const submissions = await Submission.find({ course: course._id });
    submissions.forEach((submission) => {
      if (submission.fileUrl) {
        // Delete the physical submission zip file
        fs.unlink(submission.fileUrl, (err) => {
          if (err) console.error(`Warning: Failed to delete submission file ${submission.fileUrl}:`, err);
        });
      }
    });
    // Delete all submission records from the DB for this course
    await Submission.deleteMany({ course: course._id });

    // 5. Finally, delete the Course itself
    await Course.findOneAndDelete({ courseId: customCourseId });

    res.status(200).json({
      success: true,
      message: "Course, alongside all associated lessons, submissions, and files, were deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

// 7. Get "My Courses" (Instructor Dashboard)
exports.getMyCourses = async (req, res, next) => {
  try {
    // We filter the database to only find courses created by the logged-in user
    const courses = await Course.find({ instructor: req.user.id })
      .populate("students", "name email") // Optional: Lets the professor see who is enrolled
      .sort({ createdAt: -1 }); // Sorts by newest first

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};