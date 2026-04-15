const { success } = require("../utils/apiResponse");
const { getPlacementRole } = require("../middleware/placement.middleware");
const PlacementPost = require("../models/placementPost.model");

// GET /api/placement/test — public
exports.test = (req, res) => {
  return success(res, "Placement module is working!", {
    module: "EduNexus Placement",
    features: [
      "SDE Sheet",
      "Mock OA",
      "Leaderboard",
      "Interview Experience",
      "Blogs",
      "Industry Talks"
    ]
  });
};

// GET /api/placement/me — returns placement role of logged in user and TPC status
exports.getMyPlacementRole = async (req, res) => {
  const User = require("../models/user.model");
  const placementRole = getPlacementRole(req.user.collegeId || "");
  const user = await User.findById(req.user.id).select("isTpcCoord isHOD");
  return success(res, "Placement role fetched", { 
    placementRole, 
    isTpcCoord: user?.isTpcCoord || false,
    isHOD: user?.isHOD || false
  });
};

// GET /api/placement/bookmarks — returns posts bookmarked by the user
exports.getBookmarkedPosts = async (req, res, next) => {
  try {
    const posts = await PlacementPost.find({ "engagement.bookmarks": req.user.id })
      .populate("author", "name department")
      .sort({ createdAt: -1 });

    return success(res, "Bookmarked posts fetched", posts);
  } catch (error) {
    next(error);
  }
};
