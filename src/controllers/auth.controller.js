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
    let { name, collegeId, email, password, role, department: bodyDepartment, isHOD } = req.body;

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
          "CIVIL": "Civil",
          "HS": "Humanities"
        };
        if (map[code]) department = map[code];
      }
    }

    // 2. Validate email format (skip strict regex for professors)
    const matchesRegex = emailRegex.test(email);
    console.log(`Email check: role=${role}, email=${email}, matchesRegex=${matchesRegex}`);
    
    if (role !== "professor" && role !== "alumni" && !matchesRegex) {
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
      if (userExists.isVerified) {
        console.log("Registration failed: User already exists and is verified", { email, collegeId });
        return res.status(400).json({ message: "User already exists. Please login." });
      } else {
        // Automatically resend OTP for unverified user and update their details
        console.log("Existing unverified user found. Updating details and generating new OTP.");
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        
        userExists.name = name;
        userExists.role = role;
        userExists.collegeId = collegeId;
        userExists.email = email;
        userExists.password = await bcrypt.hash(password, 10);
        userExists.department = department;
        userExists.otp = await bcrypt.hash(otp, 10);
        userExists.otpExpiry = otpExpiry;
        userExists.isHOD = role === "professor" ? (isHOD || false) : false;
        
        await userExists.save();
        
        await sendOTPEmail(userExists.email, otp);
        return res.status(200).json({
          success: true,
          message: `Your account was already registered but not verified. A new OTP has been sent to ${userExists.email}.`
        });
      }
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Generate OTP
    const otp = generateOTP();
    console.log(`\n--- NEW REGISTRATION ATTEMPT ---`);
    console.log(`Role: ${role} | Name: ${name} | Email: ${email}`);
    console.log(`Generated OTP: ${otp}`);
    console.log(`-------------------------------\n`);
    
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
      otpExpiry,
      isHOD: role === "professor" ? (isHOD || false) : false
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
      // Automatically resend OTP for unverified login attempt
      console.log(`Unverified login attempt for ${collegeId}. Resending OTP.`);
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      user.otp = await bcrypt.hash(otp, 10);
      user.otpExpiry = otpExpiry;
      await user.save();
      
      await sendOTPEmail(user.email, otp);
      return res.status(403).json({ 
        message: "Account not verified. A new OTP has been sent to your email.",
        unverified: true,
        email: user.email 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ── JWT includes collegeId for placement middleware ─────────
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

    // ── Use calculated role for students who become seniors/alumni ────────
    // But keep "professor" and "ta" roles as they are.
    const effectiveRole = (user.role === "professor" || user.role === "ta") 
      ? user.role 
      : (placementRole === "alumni" ? "alumni" : user.role);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { ...user.toObject(), role: effectiveRole },
      placementRole   // "student" | "senior" | "alumni"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.promoteToHOD = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "professor") {
      return res.status(403).json({ message: "Only professors can become HODs." });
    }
    user.isHOD = true;
    await user.save();
    res.json({ success: true, message: "You are now the HOD." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
