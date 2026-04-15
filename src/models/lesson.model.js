const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['assignment', 'material'],
      default: 'assignment'
    },
    fileUrl: {
      // This will store the path to the file on your server (e.g., "uploads/169000-math.pdf")
      type: String, 
      required: true 
    },
    course: {
      // We link this back to the standard MongoDB _id of the Course
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    instructor: {
      // We link the instructor here too so we don't have to constantly populate the course to check ownership
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);