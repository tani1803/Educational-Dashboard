const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignmentTitle: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      // Stores the path to the student's .zip file
      type: String,
      required: true
    },
    student: {
      // Links to the student who submitted it
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    course: {
      // Links to the course this submission belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);