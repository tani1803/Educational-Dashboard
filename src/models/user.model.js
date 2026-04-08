const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    collegeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["student", "ta", "professor", "alumni"],
      required: true
    },
    department: {
      type: String,
      required: true,
      enum: [
        "CSE",
        "Mech",
        "Electrical",
        "Data Science",
        "Mathematics and Computing",
        "AI",
        "Civil",
        "Humanities",
        "Unknown"
      ]
    },

    // ── OTP VERIFICATION ───────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false       // user cannot login until OTP is verified
    },
    otp: {
      type: String,        // stored as hashed string
      default: null
    },
    otpExpiry: {
      type: Date,          // OTP expires after 5 minutes
      default: null
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
