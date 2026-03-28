const Submission = require("../models/submission.model");
const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");
const fs = require("fs");

exports.submitAssignment = async (req, res, next) => {
  try {
    const customCourseId = req.params.courseId;
    const { assignmentTitle } = req.body;

    // 1. Find the course
    const course = await Course.findOne({ courseId: customCourseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2. Security Check: Is this student enrolled?
    const isEnrolled = course.students.some(
      (studentId) => studentId.toString() === req.user.id
    );

    if (!isEnrolled) {
      return res.status(403).json({ 
        message: "Forbidden: You cannot submit assignments for a course you are not enrolled in." 
      });
    }

    // 3. Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload your assignment file (.zip)" });
    }

    // 4. Check if a submission already exists for this exact assignment by this student
    let existingSubmission = await Submission.findOne({
      student: req.user.id,
      course: course._id,
      assignmentTitle: assignmentTitle // We use the title as the unique identifier
    });

    if (existingSubmission) {
      // --- UPDATE EXISTING SUBMISSION ---
      
      // A. Delete the old file from the server's hard drive
      fs.unlink(existingSubmission.fileUrl, (err) => {
        if (err) {
          console.error("Warning: Failed to delete old file:", err);
        } else {
          console.log("Old submission file deleted successfully.");
        }
      });

      // B. Update the database record with the new file path
      existingSubmission.fileUrl = req.file.path;
      await existingSubmission.save();

      return success(res, "Submission updated successfully", existingSubmission);
      
    } else {
      // --- CREATE NEW SUBMISSION ---
      const newSubmission = await Submission.create({
        assignmentTitle: assignmentTitle,
        fileUrl: req.file.path,
        student: req.user.id,
        course: course._id
      });

      return success(res, "Assignment submitted successfully", newSubmission);
    }
  } catch (error) {
    next(error);
  }
};
  // Get all submissions for a specific course (Professor Only)
exports.getSubmissionsForCourse = async (req, res, next) => {
  try {
    const customCourseId = req.params.courseId;

    // 1. Find the course to verify ownership
    const course = await Course.findOne({ courseId: customCourseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2. Security Check: Is this professor the owner of the course?
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Forbidden: You can only view submissions for your own courses." 
      });
    }

    // 3. Fetch the submissions and populate the student details
    const submissions = await Submission.find({ course: course._id })
      .populate("student", "name email collegeId") // Let the prof see WHO submitted it
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};
