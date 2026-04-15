const express = require("express");
const router = express.Router();
const {
  getAllTalks,
  getTalkById,
  createTedTalk,
  createTechUpdate,
  toggleLike,
  addComment,
  deleteTalk,
  getPendingPosts,
  reviewTalk,
  createSession,
  getAllSessions,
  registerForSession,
  reviewSession,
  getMyPosts
} = require("../controllers/alumni.controller");
const { protect } = require("../middleware/auth.middleware");
const { attachPlacementRole } = require("../middleware/placement.middleware");

// All routes require authentication
router.use(protect);
router.use(attachPlacementRole); // attaches req.placementRole (senior/student/alumni)

// TPC Review routes (no overlap with /talks or /sessions)
router.get("/pending", getPendingPosts);
router.patch("/talks/:id/review", reviewTalk);
router.patch("/session/:id/review", reviewSession);

// Alumni specific routes
router.get("/my-posts", getMyPosts);

// Public feed (any authenticated user)
router.get("/talks", getAllTalks);
router.get("/talks/:id", getTalkById);

// Create posts
router.post("/talks/ted-talk", createTedTalk);        // alumni only
router.post("/talks/tech-update", createTechUpdate);  // alumni + seniors

// Engagement (Talks)
router.post("/talks/:id/like", toggleLike);
router.post("/talks/:id/comment", addComment);

// Delete (author only)
router.delete("/talks/:id", deleteTalk);

// Sessions
router.post("/session", createSession); // alumni only
router.get("/sessions", getAllSessions); // any authenticated
router.post("/session/:id/register", registerForSession); // any student

module.exports = router;
