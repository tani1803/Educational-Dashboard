const express = require("express");
const router = express.Router();

const { register, verifyOTP, login } = require("../controllers/auth.controller");

router.post("/register",    register);
router.post("/verify-otp",  verifyOTP);
router.post("/login",       login);

module.exports = router;
