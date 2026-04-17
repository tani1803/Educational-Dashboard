const mongoose = require("mongoose");

const contestPerformanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    contestName: {
      type: String,
      required: true,
      trim: true
    },
    rank: {
      type: Number,
      required: true,
      min: 1
    },
    totalParticipants: {
      type: Number,
      required: true,
      min: 1
    },
    performanceScore: {
      type: Number,
      required: true
    },
    datePlayed: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContestPerformance", contestPerformanceSchema);
