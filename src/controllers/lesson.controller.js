const Lesson = require("../models/lesson.model");
const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");

// Create a new lesson with a file upload
exports.createLesson = async (req, res, next) => {
  try {
    // 1. We get the custom courseId from the URL (e.g., /api/courses/CS1201/lessons)
    const customCourseId = req.params.courseId;
    
    // 2. Find the course to make sure it exists and to get its real MongoDB _id
    const course = await Course.findOne({ courseId: customCourseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 3. Security Check: Is this professor the owner of the course?
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You do not own this course" });
    }

    // 4. Check if multer successfully attached the file to the request
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file for the lesson" });
    }

    // 5. Create the lesson in the database
    const lesson = await Lesson.create({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type || 'assignment',
      fileUrl: req.file.path, // Multer gives us the path here!
      course: course._id,     // Link to the course's MongoDB _id
      instructor: req.user.id // Link to the logged-in professor
    });

    return success(res, "Lesson created and file uploaded successfully", lesson);
  } catch (error) {
    next(error);
  }
};

exports.getLessons = async (req, res, next) => {
  try {
    const course = await Course.findOne({ courseId: req.params.courseId });
    if (!course) return res.status(404).json({ message: "Course not found" });
    const lessons = await Lesson.find({ course: course._id });
    res.status(200).json({ success: true, count: lessons.length, data: lessons });
  } catch (error) {
    next(error);
  }
};