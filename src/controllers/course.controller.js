const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");

// prof only create course
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


exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email collegeId")
      .select("-students -tas");

    return success(res, "Courses fetched", courses);
  } catch (error) {
    next(error);
  }
};

// Student to register
exports.enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

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
