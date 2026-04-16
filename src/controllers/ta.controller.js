const Course = require("../models/course.model");
const Submission = require("../models/submission.model");
const Grade = require("../models/grade.model");

// getAssignedCourses: Query the Course collection to find all courses where tas contains req.user.id.
exports.getAssignedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ tas: req.user.id });
    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getPendingSubmissions: Fetch ungraded submissions specifically for the courses the TA is assigned to.
exports.getPendingSubmissions = async (req, res) => {
  try {
    // Find all courses this TA is assigned to
    const assignedCourses = await Course.find({ tas: req.user.id }).select("_id");
    const courseIds = assignedCourses.map(c => c._id);

    // Ungraded submissions normally don't have an evaluatedScore
    const submissions = await Submission.find({
      course: { $in: courseIds },
      evaluatedScore: null
    })
      .populate("student", "name collegeId email")
      .populate("course", "title courseId");

    res.status(200).json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// updateComponentGrade: Accepts courseId, studentId, componentName, score.
exports.updateComponentGrade = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const { componentName, score } = req.body;

    if (!componentName || score === undefined) {
      return res.status(400).json({ success: false, message: "Please provide componentName and score in the request body." });
    }

    // Security Check 1: Verify the logged-in TA is actually in the tas array of the specified course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (!course.tas.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden: You are not assigned as a TA for this course." });
    }

    // Check if the component name is a valid component we allow TAs to grade
    const validComponents = ["quiz1", "quiz2", "midsem", "endsem", "project", "misc"];
    if (!validComponents.includes(componentName)) {
      return res.status(400).json({ success: false, message: `Invalid component name. Expected one of: ${validComponents.join(", ")}` });
    }

    // Find the Grade document for this student and course
    let gradeDoc = await Grade.findOne({ course: courseId, student: studentId });

    if (!gradeDoc) {
      // Create if it doesn't exist, though typically it should be initialized by enrollment
      gradeDoc = new Grade({ 
        course: courseId, 
        student: studentId, 
        components: {} 
      });
    }

    // Update the component score
    gradeDoc.components[componentName] = score;

    // Audit Action: Push a new object to the auditLog array in the Grade document
    const auditEntry = {
      updatedBy: req.user.id,
      role: 'ta',
      action: `Updated ${componentName} to ${score}.`
    };
    gradeDoc.auditLog.push(auditEntry);

    // Save changes
    await gradeDoc.save();

    res.status(200).json({ success: true, message: "Grade component updated successfully", grade: gradeDoc });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
