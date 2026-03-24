const express = require("express");
const router = express.Router();

const { getAllUsers } = require("../controllers/user.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.get("/", protect, restrictTo("professor", "ta"), getAllUsers);

module.exports = router;