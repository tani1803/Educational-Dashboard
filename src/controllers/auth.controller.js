const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../services/email.service");

// ── EMAIL REGEX ────────────────────────────────────────────────
// Valid format: name_2401ai54@iitp.ac.in
// - name: one or more letters
// - underscore separator
// - 4 digit year + 2 letter branch + 2-3 digit number
// - @iitp.ac.in domain only
const emailRegex = /^[a-zA-Z]+_[0-9]{4}[a-zA-Z]{2}[0-9]{2,3}@iitp\.ac\.in$/;

// ── GENERATE 4 DIGIT OTP ───────────────────────────────────────
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // "1000" to "9999"
};

// ── VERIFY OTP ─────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified. Please login." });
    }

    // 3. Check OTP expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    // 4. Compare OTP
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 5. Mark as verified and clear OTP fields
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


exports.register = async (req, res) => {
  try {
    const { name, collegeId, email, password, role } = req.body;

    if (!name || !collegeId || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const allowedRoles = ["student", "ta", "professor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Must be one of: ${allowedRoles.join(", ")}`
      });
    }

    // Check duplicate collegeId or email
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
        return res.status(400).json({ message: "User with this email already exists and is verified" });
    }

    const collegeIdExists = await User.findOne({ collegeId });
    if (collegeIdExists && collegeIdExists.isVerified) {
        return res.status(400).json({ message: "User with this college ID already exists and is verified" });
    }

    // If user exists but is not verified, we can either re-send OTP after updating details,
    // or we just delete the unverified user and create a new one, or update the existing one.
    // For simplicity, let's just delete the unverified one and re-create.
    if (user && !user.isVerified) {
        await User.deleteOne({ email });
    }
    if (collegeIdExists && !collegeIdExists.isVerified) {
        await User.deleteOne({ collegeId });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const plainOTP = generateOTP();
    const hashedOTP = await bcrypt.hash(plainOTP, 10);

    user = await User.create({
      name,
      collegeId,
      email,
      password: hashedPassword,
      role,
      otp: hashedOTP,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 mins expiry
    });

    // Send OTP email
    await sendOTPEmail(email, plainOTP);

    user.password = undefined;
    user.otp = undefined;

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for the OTP.",
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

    // Role embedded in token — used by restrictTo middleware
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    user.password = undefined;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });  
  }
};
