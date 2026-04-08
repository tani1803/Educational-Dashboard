const RoadmapQuestion = require("../../models/roadmapQuestion.model");
const User = require("../../models/user.model");

// GET ALL DSA QUESTIONS
exports.getDSAQuestions = async (req, res) => {
  try {
    const questions = await RoadmapQuestion.find({ roadmapString: "DSA" }).populate("addedBy", "name");
    
    // Find completed questions for this user
    let completedQuestions = [];
    if (req.user && req.user.id) {
       const user = await User.findById(req.user.id);
       if (user && user.completedRoadmapQuestions) {
          completedQuestions = user.completedRoadmapQuestions;
       }
    }

    res.status(200).json({
      success: true,
      data: {
        questions,
        completedQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD A NEW DSA QUESTION (SENIOR ONLY)
exports.addDSAQuestion = async (req, res) => {
  try {
    const { step, questionTitle, questionLink } = req.body;

    if (req.placementRole !== "senior") {
        return res.status(403).json({ message: "Only seniors can add questions." });
    }

    const question = new RoadmapQuestion({
      roadmapString: "DSA",
      step,
      questionTitle,
      questionLink,
      addedBy: req.user.id
    });

    await question.save();
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE DSA QUESTION COMPLETION
exports.toggleDSAQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle logic
    const index = user.completedRoadmapQuestions.indexOf(id);
    if (index === -1) {
      user.completedRoadmapQuestions.push(id);
    } else {
      user.completedRoadmapQuestions.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ success: true, data: user.completedRoadmapQuestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
