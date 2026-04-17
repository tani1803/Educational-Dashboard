const PlacementPost = require("../models/placementPost.model");
const { success } = require("../utils/apiResponse");
const xss = require("xss");
const path = require("path");
const { spawn } = require("child_process");

// 1. Create a draft or published post
exports.createPost = async (req, res, next) => {
  try {
    const { metadata, content, tags, status, privacy } = req.body;

    // Basic sanitization of content fields
    const sanitizedRounds = content?.rounds?.map(round => ({
      roundName: xss(round.roundName),
      details: xss(round.details)
    })) || [];
    const sanitizedTips = xss(content?.tips || "");

    const post = await PlacementPost.create({
      author: req.user.id || req.user._id,
      metadata,
      content: {
        rounds: sanitizedRounds,
        tips: sanitizedTips
      },
      tags,
      status: status || "draft",
      privacy
    });

    return success(res, "Post created successfully", post);
  } catch (error) {
    next(error);
  }
};

// 2. Edit a post
exports.editPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { metadata, content, tags, status, privacy } = req.body;

    const post = await PlacementPost.findOne({ _id: id, author: req.user.id || req.user._id });
    if (!post) {
      const error = new Error("Post not found or unauthorized");
      error.statusCode = 404;
      throw error;
    }

    if (metadata) post.metadata = metadata;
    if (tags) post.tags = tags;
    if (status) post.status = status;
    if (privacy) post.privacy = privacy;

    // Sanitize
    if (content) {
      if (content.rounds) {
        post.content.rounds = content.rounds.map(round => ({
          roundName: xss(round.roundName),
          details: xss(round.details)
        }));
      }
      if (content.tips !== undefined) {
        post.content.tips = xss(content.tips);
      }
    }

    await post.save();
    return success(res, "Post updated successfully", post);
  } catch (error) {
    next(error);
  }
};

// 3. Publish a post (just updates status)
exports.publishPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await PlacementPost.findOneAndUpdate(
      { _id: id, author: req.user.id || req.user._id },
      { status: "published" },
      { new: true }
    );
    if (!post) {
      const error = new Error("Post not found or unauthorized");
      error.statusCode = 404;
      throw error;
    }
    return success(res, "Post published", post);
  } catch (error) {
    next(error);
  }
};

// 4. Delete a post
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await PlacementPost.findOneAndDelete({ _id: id, author: req.user.id || req.user._id });
    if (!post) {
      const error = new Error("Post not found or unauthorized");
      error.statusCode = 404;
      throw error;
    }
    return success(res, "Post deleted successfully");
  } catch (error) {
    next(error);
  }
};

// 5. Toggle an upvote
exports.toggleUpvote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await PlacementPost.findById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    const userId = req.user.id || req.user._id;
    const index = post.engagement.upvotes.indexOf(userId);
    if (index === -1) {
      post.engagement.upvotes.push(userId);
    } else {
      post.engagement.upvotes.splice(index, 1);
    }

    await post.save();
    return success(res, "Upvote toggled", { upvotes: post.engagement.upvotes.length });
  } catch (error) {
    next(error);
  }
};

// 6. Toggle a bookmark
exports.toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await PlacementPost.findById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    const userId = req.user.id || req.user._id;
    const index = post.engagement.bookmarks.indexOf(userId);
    if (index === -1) {
      post.engagement.bookmarks.push(userId);
    } else {
      post.engagement.bookmarks.splice(index, 1);
    }

    await post.save();
    return success(res, "Bookmark toggled", { bookmarked: index === -1 });
  } catch (error) {
    next(error);
  }
};

// 7. Personal Dashboard (fetch logged in user's posts)
exports.getMyPosts = async (req, res, next) => {
  try {
    const posts = await PlacementPost.find({ author: req.user.id || req.user._id }).sort({ createdAt: -1 });
    return success(res, "Personal posts fetched", posts);
  } catch (error) {
    next(error);
  }
};

// 8. Search & Filter Published Posts
exports.getPublishedPosts = async (req, res, next) => {
  try {
    const { q, tags, year } = req.query;

    const filter = { status: "published" };

    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }
    if (year) {
      filter["metadata.placementYear"] = Number(year);
    }

    let posts = await PlacementPost.find(filter)
      .populate("author", "name collegeId email")
      .sort({ createdAt: -1 });

    // Apply generic string matching if query exists
    if (q && q.trim() !== "") {
      const queryStr = q.trim().toLowerCase();
      posts = posts.filter(post => {
        const companyStr = (post.metadata.companyName || "").toLowerCase();
        const roleStr = (post.metadata.jobRole || "").toLowerCase();
        return companyStr.includes(queryStr) || roleStr.includes(queryStr);
      });
    }

    // Strip anonymous data for standard query
    const sanitizedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (postObj.privacy.isAnonymous) {
        postObj.author = { name: "Anonymous" };
      }
      return postObj;
    });

    return success(res, "Posts fetched", sanitizedPosts);
  } catch (error) {
    next(error);
  }
};

// 9. Fetch Single Post By ID
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Post ID format" });
    }

    const post = await PlacementPost.findById(id).populate("author", "name collegeId email");
    
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    const postObj = post.toObject();
    if (postObj.privacy?.isAnonymous) {
      postObj.author = { name: "Anonymous" };
    }

    return success(res, "Post fetched", postObj);
  } catch (error) {
    next(error);
  }
};
