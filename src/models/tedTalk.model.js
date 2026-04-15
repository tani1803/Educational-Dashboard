const mongoose = require("mongoose");

const tedTalkSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // "tedtalk" = alumni sharing experience/insights
    // "techupdate" = senior sharing company recent tech news
    type: {
      type: String,
      enum: ["tedtalk", "techupdate"],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true // rich text / markdown
    },
    // For tech updates: company name
    company: {
      type: String,
      trim: true,
      default: ""
    },
    // Link where the session will be conducted
    sessionLink: {
      type: String,
      trim: true,
      default: ""
    },
    // The date and time when the session will be conducted
    dateTime: {
      type: Date
    },
    tags: [{ type: String, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
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

module.exports = mongoose.model("TedTalk", tedTalkSchema);
