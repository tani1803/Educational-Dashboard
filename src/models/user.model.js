const mongoose = require("mongoose");

// ── CONSTANTS ─────────────────────────────────────────────────────
const CURRENT_YEAR_PREFIX = 26; // Derived from 2026

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
    },


    // Used to denote if a Student is a Class Representative 
    // This allows them to upload branch schedules
    isCR: {
      type: Boolean,
      default: false
    },

    // ── TPC COORDINATOR ────────────────────────────────────────
    // Set to true by HOD. Only TPC Coords can post contests & tech updates.
    isTpcCoord: {
      type: Boolean,
      default: false
    },

    // ── HOD FLAG (Professor only) ───────────────────────────────
    isHOD: {
      type: Boolean,
      default: false
    },
    
    // ── PROFILE PREFERENCES & ACADEMICS ────────────────────────
    emailNotifications: {
      type: Boolean,
      default: true
    },
    cgpa: {
      type: Number,
      default: 0
    },
    totalCreditsEarned: {
      type: Number,
      default: 0
    },
    bio: {
      type: String,
      default: ""
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" }
    },

    // ── PROFESSOR FACULTY PROFILE FIELDS ─────────────────────
    academicTitle: {
      type: String,
      default: "Professor"
    },
    researchInterests: [
      { type: String, trim: true }
    ],
    officeLocation: {
      type: String,
      default: ""
    },
    officeHours: [
      {
        day: { type: String },       // e.g. "Monday"
        from: { type: String },      // e.g. "10:00 AM"
        to: { type: String }         // e.g. "12:00 PM"
      }
    ],
    scholarLink: {
      type: String,
      default: ""
    },
    personalWebsite: {
      type: String,
      default: ""
    },
    notifications: {
      taGradeSubmit:           { type: Boolean, default: true },
      weeklyPerformanceSummary:{ type: Boolean, default: true }
    },

    targetRoles: [
      {
        type: String,
        trim: true
      }],

    // ── ROADMAP PROGRESS ───────────────────────────────────────
    completedRoadmapQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoadmapQuestion"
      }
    ]
  },
  { timestamps: true }
);

// ── ROLL NUMBER VALIDATION (students & TAs only) ─────────────────
// B.Tech: 3rd/4th digits = "01", max 4 years
// M.Tech: 3rd/4th digits = "11", max 2 years
// Mongoose 9 requires async pre hooks (no next() callback)
userSchema.pre("validate", async function () {
  const studentRoles = ["student", "ta"];
  if (!studentRoles.includes(this.role)) return;

  const id = this.collegeId;
  if (!id || id.length < 4) return; // let other validators catch missing IDs

  const yy = parseInt(id.substring(0, 2), 10);           // Joining year (e.g. 24)
  const programCode = id.substring(2, 4);                 // e.g. "01" or "11"

  let maxYears;
  if (programCode === "01") {
    maxYears = 4; // B.Tech
  } else if (programCode === "11") {
    maxYears = 2; // M.Tech
  } else {
    return; // Unrecognised program code — skip duration check
  }

  const yearOfStudy = CURRENT_YEAR_PREFIX - yy; // e.g. 26 - 24 = 2

  if (yearOfStudy < 1 || yearOfStudy > maxYears) {
    const programName = maxYears === 4 ? "B.Tech" : "M.Tech";
    throw new Error(
      `Invalid roll number: year of study calculated as ${yearOfStudy} ` +
      `but ${programName} programs run for 1–${maxYears} years. ` +
      `Current year prefix is ${CURRENT_YEAR_PREFIX}, joining year parsed as 20${yy < 10 ? "0" + yy : yy}.`
    );
  }
});


const User = mongoose.model("User", userSchema);

module.exports = User;
