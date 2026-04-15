const TedTalk = require("../models/tedTalk.model");
const Session = require("../models/session.model");

// GET ALL POSTS (public feed: approved only for others, but author sees their own pending)
exports.getAllTalks = async (req, res) => {
  try {
    const userId = req.user.id;
    const talks = await TedTalk.find({
      $or: [
        { status: "approved" },
        { author: userId }
      ]
    })
      .populate("author", "name role department")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: talks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PENDING TALKS (TPC Coordinators or HODs only)
exports.getPendingTalks = async (req, res) => {
  try {
    if (!req.isTpcCoord && !req.isHOD) {
      return res.status(403).json({ message: "Only TPC Coordinators or HODs can view pending posts." });
    }

    const talks = await TedTalk.find({ status: "pending" })
      .populate("author", "name role department")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: talks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REVIEW A TALK (Approve/Decline)
exports.reviewTalk = async (req, res) => {
  try {
    if (!req.isTpcCoord && !req.isHOD) {
      return res.status(403).json({ message: "Only TPC Coordinators or HODs can review posts." });
    }

    const { status, rejectionReason } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'." });
    }

    const talk = await TedTalk.findById(req.params.id);
    if (!talk) return res.status(404).json({ message: "Post not found." });

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required." });
    }

    talk.status = status;
    talk.rejectionReason = status === "rejected" ? rejectionReason : "";
    talk.reviewedBy = req.user.id;
    talk.reviewedAt = new Date();
    await talk.save();

    res.status(200).json({ success: true, message: `Post has been ${status}.`, data: talk });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE TALK BY ID
exports.getTalkById = async (req, res) => {
  try {
    const talk = await TedTalk.findById(req.params.id)
      .populate("author", "name role department bio socialLinks")
      .populate("comments.user", "name role");
    if (!talk) return res.status(404).json({ message: "Post not found." });
    res.status(200).json({ success: true, data: talk });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE A TED TALK (alumni only)
exports.createTedTalk = async (req, res) => {
  try {
    const { title, body, sessionLink, dateTime, tags } = req.body;
    const userRole = req.user.role;

    if (userRole !== "alumni") {
      return res.status(403).json({ message: "Only alumni can post TED talks." });
    }

    if (!dateTime) {
      return res.status(400).json({ message: "dateTime is required for a TED Talk session." });
    }

    const talk = await TedTalk.create({
      author: req.user.id,
      type: "tedtalk",
      title,
      body,
      sessionLink: sessionLink || "",
      dateTime,
      tags: tags || []
    });

    const populated = await TedTalk.findById(talk._id).populate("author", "name role department");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE A TECH UPDATE (seniors can also share)
exports.createTechUpdate = async (req, res) => {
  try {
    const { title, body, company, tags } = req.body;
    const userRole = req.user.role;

    // Alumni can always post; seniors only if they are TPC coordinators approved by HOD
    const isTpcCoord = req.isTpcCoord || false;
    const isAlumni = userRole === "alumni";

    if (!isAlumni && !isTpcCoord) {
      return res.status(403).json({ message: "Only alumni or TPC Coordinators (HOD-approved) can post company tech updates." });
    }

    const talk = await TedTalk.create({
      author: req.user.id,
      type: "techupdate",
      title,
      body,
      company: company || "",
      tags: tags || []
    });

    const populated = await TedTalk.findById(talk._id).populate("author", "name role department");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE LIKE
exports.toggleLike = async (req, res) => {
  try {
    const talk = await TedTalk.findById(req.params.id);
    if (!talk) return res.status(404).json({ message: "Post not found." });

    const userId = req.user.id;
    const liked = talk.likes.some(id => id.toString() === userId);

    if (liked) {
      talk.likes = talk.likes.filter(id => id.toString() !== userId);
    } else {
      talk.likes.push(userId);
    }

    await talk.save();
    res.status(200).json({ success: true, liked: !liked, likesCount: talk.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD A COMMENT
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required." });

    const talk = await TedTalk.findById(req.params.id);
    if (!talk) return res.status(404).json({ message: "Post not found." });

    talk.comments.push({ user: req.user.id, text });
    await talk.save();

    const updated = await TedTalk.findById(req.params.id).populate("comments.user", "name role");
    res.status(201).json({ success: true, data: updated.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE A TALK (author only)
exports.deleteTalk = async (req, res) => {
  try {
    const talk = await TedTalk.findById(req.params.id);
    if (!talk) return res.status(404).json({ message: "Post not found." });

    if (talk.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    await TedTalk.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================= SESSION ENDPOINTS =======================

// CREATE A SESSION (alumni only)
exports.createSession = async (req, res) => {
  try {
    const { title, description, dateTime, platform, meetLink, maxParticipants } = req.body;
    const userRole = req.user.role;

    if (userRole !== "alumni") {
      return res.status(403).json({ message: "Only alumni can post sessions." });
    }

    const session = await Session.create({
      postedBy: req.user.id,
      title,
      description,
      dateTime,
      platform,
      meetLink: meetLink || "",
      maxParticipants: maxParticipants || 50
    });

    const populated = await Session.findById(session._id).populate("postedBy", "name role department");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL APPROVED SESSIONS
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: "approved" })
      .populate("postedBy", "name role department")
      .populate("registeredStudents", "name email")
      .sort({ dateTime: 1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REGISTER FOR A SESSION (students)
exports.registerForSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found." });

    if (session.status !== "approved") {
      return res.status(400).json({ message: "Cannot register for an unapproved session." });
    }

    const userId = req.user.id;
    const isRegistered = session.registeredStudents.some(id => id.toString() === userId);

    if (isRegistered) {
      return res.status(400).json({ message: "You are already registered for this session." });
    }

    if (session.registeredStudents.length >= session.maxParticipants) {
      return res.status(400).json({ message: "Session is full." });
    }

    session.registeredStudents.push(userId);
    await session.save();

    res.status(200).json({ success: true, message: "Successfully registered for the session." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REVIEW A SESSION (Approve/Decline)
exports.reviewSession = async (req, res) => {
  try {
    if (!req.isTpcCoord && !req.isHOD) {
      return res.status(403).json({ message: "Only TPC Coordinators or HODs can review sessions." });
    }

    const { status, rejectionReason } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'." });
    }

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found." });

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required." });
    }

    session.status = status;
    session.rejectionReason = status === "rejected" ? rejectionReason : "";
    session.reviewedBy = req.user.id;
    session.reviewedAt = new Date();
    await session.save();

    res.status(200).json({ success: true, message: `Session has been ${status}.`, data: session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================= UNIFIED FETCH ENDPOINTS =======================

// GET MY POSTS (alumni views their own submitted talks & sessions)
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const talks = await TedTalk.find({ author: userId }).sort({ createdAt: -1 });
    const sessions = await Session.find({ postedBy: userId }).sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      data: {
        talks,
        sessions
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL PENDING (combines talks & sessions for TPC dashboard)
exports.getPendingPosts = async (req, res) => {
  try {
    if (!req.isTpcCoord && !req.isHOD) {
      return res.status(403).json({ message: "Only TPC Coordinators or HODs can view pending posts." });
    }

    const now = new Date();
    
    // Auto purge expired pending TED talks (those where a session dateTime has passed and they're still pending)
    await TedTalk.deleteMany({
      status: "pending",
      type: "tedtalk",
      dateTime: { $lt: now }
    });

    const talks = await TedTalk.find({ status: "pending" })
      .populate("author", "name role department")
      .sort({ createdAt: -1 });
      
    const sessions = await Session.find({ status: "pending" })
      .populate("postedBy", "name role department")
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      data: {
        talks,
        sessions
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

