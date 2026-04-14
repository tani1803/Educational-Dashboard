const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Format: [A-Z]{2}[1-4][1-2]\d{2}
          // e.g. AI2101 → dept=AI, year=2, sem=1, id=01
          return /^[A-Z]{2}[1-4][1-2]\d{2}$/.test(v);
        },
        message: (props) =>
          `"${props.value}" is not a valid course code. ` +
          `Expected format: 2 uppercase letters (dept) + year (1–4) + semester (1–2) + 2-digit ID. ` +
          `Example: AI2101`
      }
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
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
    gradesPublished: {
      type: Boolean,
      default: false
    },
    weights: {
      quiz1: { type: Number, default: 10 },
      quiz2: { type: Number, default: 10 },
      midsem: { type: Number, default: 30 },
      endsem: { type: Number, default: 40 },
      project: { type: Number, default: 5 },
      misc: { type: Number, default: 5 }
    },
    totalMarks: {
      quiz1: { type: Number, default: 100 },
      quiz2: { type: Number, default: 100 },
      midsem: { type: Number, default: 100 },
      endsem: { type: Number, default: 100 },
      project: { type: Number, default: 100 },
      misc: { type: Number, default: 100 }
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    tas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
