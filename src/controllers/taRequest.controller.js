const TARequest = require("../models/taRequest.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");

// Create a TA Request (MTech Students only)
exports.createTARequest = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Verify user is MTech (checking collegeId 3rd/4th digit or role logic if you want)
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMtech = user.collegeId && user.collegeId.substring(2, 4) === '11';
    if (!isMtech) {
      return res.status(403).json({ success: false, message: "Only MTech students can request to be a TA." });
    }

    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // Check if course belongs to the student's department
    if (course.department !== user.department) {
      return res.status(400).json({ success: false, message: "You can only request to TA for courses in your department." });
    }

    // Check if request already exists
    const existingReq = await TARequest.findOne({ student: req.user.id, course: course._id });
    if (existingReq) {
      return res.status(400).json({ success: false, message: "You have already sent a request for this course." });
    }

    const newRequest = await TARequest.create({
      student: req.user.id,
      course: course._id,
      professor: course.instructor
    });

    res.status(201).json({ success: true, message: "TA request sent successfully.", data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Professor queries TA requests for their courses
exports.getProfessorTARequests = async (req, res) => {
  try {
    const requests = await TARequest.find({ professor: req.user.id })
      .populate("student", "name email collegeId department")
      .populate("course", "title courseId");

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Professor approves TA request
exports.approveTARequest = async (req, res) => {
  try {
    const request = await TARequest.findById(req.params.id).populate("course");
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (request.professor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized to approve this request" });
    }

    request.status = "approved";
    await request.save();

    // Add student to course's tas array
    const course = await Course.findById(request.course._id);
    if (!course.tas.includes(request.student)) {
      course.tas.push(request.student);
      await course.save();
    }

    // Upgrade user role to 'ta' if they are currently a 'student'
    const student = await User.findById(request.student);
    if (student.role === 'student') {
      student.role = 'ta';
      await student.save();
    }

    res.status(200).json({ success: true, message: "TA request approved and student assigned as TA." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
