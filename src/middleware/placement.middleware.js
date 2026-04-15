// Dynamically computed from collegeId — no extra DB field needed
// collegeId format: 2401AI54 → first 2 digits = year joined

exports.getPlacementRole = (collegeId) => {
  const yearJoined = parseInt(collegeId.substring(0, 2)); // "24" → 24

  const now = new Date();
  const currentYear = now.getFullYear() % 100; // 2026 → 26
  const month = now.getMonth() + 1;            // Jan=1 ... Dec=12

  // Academic year starts July — before July still in previous academic year
  const academicYear = month >= 7 ? currentYear : currentYear - 1;

  const yearsCompleted = academicYear - yearJoined;

  // 0-1 → 1st year → student
  // 1-2 → 2nd year → student
  // 2-3 → 3rd year → senior
  // 3-4 → 4th year → senior
  // 4+  → alumni
  if (yearsCompleted >= 4) return "alumni";
  if (yearsCompleted >= 2) return "senior";
  return "student";
};

// Middleware — blocks 1st/2nd year from posting
exports.restrictToSenior = (req, res, next) => {
  const placementRole = exports.getPlacementRole(req.user.collegeId || "");
  if (placementRole === "student") {
    return res.status(403).json({
      message: "Only 3rd/4th year students can perform this action."
    });
  }
  req.placementRole = placementRole;
  next();
};

// Middleware — only alumni can post industry talks
exports.restrictToAlumni = (req, res, next) => {
  const placementRole = exports.getPlacementRole(req.user.collegeId || "");
  if (placementRole !== "alumni") {
    return res.status(403).json({
      message: "Only alumni can post industry talks."
    });
  }
  req.placementRole = placementRole;
  next();
};

// Middleware — attaches placementRole AND isTpcCoord to req without blocking
exports.attachPlacementRole = async (req, res, next) => {
  req.placementRole = exports.getPlacementRole(req.user.collegeId || "");

  try {
    const User = require("../models/user.model");

    if (req.user.role === "professor") {
      // Professors: fetch isHOD only
      const user = await User.findById(req.user.id).select("isHOD");
      req.isTpcCoord = false;
      req.isHOD = user?.isHOD || false;
    } else {
      // Students, TAs, seniors, alumni: fetch isTpcCoord (and isHOD if applicable)
      const user = await User.findById(req.user.id).select("isTpcCoord isHOD");
      req.isTpcCoord = user?.isTpcCoord || false;
      req.isHOD = user?.isHOD || false;
    }
  } catch (e) {
    req.isTpcCoord = false;
    req.isHOD = false;
  }

  next();
};
