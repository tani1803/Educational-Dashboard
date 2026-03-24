const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,       
      required: true,
      unique: true,
      uppercase: true,
      trim: true
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
