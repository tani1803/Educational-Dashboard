const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
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
    dateTime: {
      type: Date,
      required: true
    },
    platform: {
      type: String, // e.g. "Google Meet", "Zoom", "In-person"
      required: true
    },
    meetLink: {
      type: String,
      default: ""
    },
    maxParticipants: {
      type: Number,
      default: 50
    },
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    rejectionReason: {
      type: String,
      default: ""
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
