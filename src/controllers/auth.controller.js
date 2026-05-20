const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../services/email.service");
const { getPlacementRole } = require("../middleware/placement.middleware");

// ── EMAIL REGEX ────────────────────────────────────────────────
const emailRegex = /^[a-zA-Z0-9.]+_[0-9]{4}[a-zA-Z]{2,3}[0-9]{2,4}@iitp\.ac\.in$/i;

// ── GENERATE 4 DIGIT OTP ───────────────────────────────────────
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// ── REGISTER ───────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    console.log("Registration Request Body:", req.body);
    let { name, collegeId, email, password, role, department: bodyDepartment } = req.body;

    // Standardize input
    if (email) email = email.toLowerCase().trim();
    if (role) role = role.toLowerCase().trim();
    if (collegeId) collegeId = collegeId.toUpperCase().trim();

    // 1. Check all fields
    if (!name || !collegeId || !email || !password || !role) {
      console.log("Registration failed: Missing fields", { name, collegeId, email, role });
      return res.status(400).json({ message: "All fields are required" });
    }

    // Dynamic Department Extraction from College ID (e.g., 2401AI54 -> AI)
    let department = "Unknown";
    if (role === "professor" && bodyDepartment) {
      department = bodyDepartment;
    } else {
      const match = collegeId.match(/[a-zA-Z]+/);
      if (match) {
        const code = match[0].toUpperCase();
        const map = {
          "EE": "Electrical",
          "DS": "Data Science",
          "MC": "Mathematics and Computing",
          "ME": "Mech",
          "MECH": "Mech",
          "CS": "CSE",
          "CSE": "CSE",
          "AI": "AI",
          "CE": "Civil",
          "HS": "Humanities"
        };
        if (map[code]) department = map[code];
      }
    }

    // 2. Validate email format (skip strict regex for professors)
    const matchesRegex = emailRegex.test(email);
    console.log(`Email check: role=${role}, email=${email}, matchesRegex=${matchesRegex}`);
    
    if (role !== "professor" && role !== "alumni" && role !== "ta" && !matchesRegex) {
      console.log("Registration failed: Invalid email format check triggered");
      return res.status(400).json({
        message: "Invalid email. Must be in format: name_2401ai54@iitp.ac.in"
      });
    }

    // 3. Validate role — now includes alumni
    const allowedRoles = ["student", "ta", "professor", "alumni"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Must be one of: ${allowedRoles.join(", ")}`
      });
    }

    // 4. Check duplicate
    const userExists = await User.findOne({ $or: [{ email }, { collegeId }] });
    if (userExists) {
      console.log("Registration failed: User already exists", { email, collegeId });
      return res.status(400).json({ message: "User already exists" });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const hashedOTP = await bcrypt.hash(otp, 10);

    // 7. Save user
    const user = await User.create({
      name,
      collegeId,
      email,
      password: hashedPassword,
      role,
      department,
      otp: hashedOTP,
      otpExpiry
    });

    // 8. Send OTP
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      // Rollback user creation if email fails
      await User.findByIdAndDelete(user._id);
      throw new Error("Failed to send OTP email. Registration was cancelled.");
    }

    res.status(201).json({
      success: true,
      message: `OTP sent to ${email}. Please verify to activate your account.`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── VERIFY OTP ─────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified. Please login." });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: "Account verified successfully. You can now login."
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── LOGIN ──────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { collegeId, password } = req.body;

    if (!collegeId || !password) {
      return res.status(400).json({ message: "College ID and password are required" });
    }

    const user = await User.findOne({ collegeId }).select('+password');
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Account not verified. Please verify your OTP to login." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, collegeId: user.collegeId, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ── Compute placement role (senior/student detection) ───────
    // Alumni role is already in user.role
    // For students — detect if they are senior from collegeId year
    const placementRole = user.role === "alumni"
      ? "alumni"
      : getPlacementRole(user.collegeId);

    user.password = undefined;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
      placementRole   // "student" | "senior" | "alumni"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
