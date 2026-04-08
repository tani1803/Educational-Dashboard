const mongoose = require("mongoose");

const roadmapQuestionSchema = new mongoose.Schema(
  {
    roadmapString: {
      type: String,
      required: true,
      enum: ["DSA", "Development", "ML"]
    },
    step: {
      type: Number,
      required: true
    },
    questionTitle: {
      type: String,
      required: true,
      trim: true
    },
    questionLink: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const RoadmapQuestion = mongoose.model("RoadmapQuestion", roadmapQuestionSchema);

module.exports = RoadmapQuestion;
