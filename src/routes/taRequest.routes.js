const express = require("express");
const router = express.Router();
const {
  createTARequest,
  getProfessorTARequests,
  approveTARequest
} = require("../controllers/taRequest.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.use(protect);

// Student creates a request 
// Note: MTech students might still have the role "student" initially
router.post("/request", restrictTo("student", "ta"), createTARequest);

// Professor endpoints for managing TA requests
router.get("/professor/requests", restrictTo("professor"), getProfessorTARequests);
router.put("/professor/requests/:id/approve", restrictTo("professor"), approveTARequest);

module.exports = router;
