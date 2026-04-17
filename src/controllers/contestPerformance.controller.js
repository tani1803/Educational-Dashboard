const ContestPerformance = require("../models/contestPerformance.model");
const { success } = require("../utils/apiResponse");

exports.addPerformance = async (req, res, next) => {
  try {
    const { contestName, rank, totalParticipants, datePlayed } = req.body;
    
    if (!contestName || !rank || !totalParticipants) {
      return res.status(400).json({ message: "Contest name, rank, and total participants are required." });
    }

    const perfScore = 100 - (Number(rank) / Number(totalParticipants)) * 100;

    const performance = await ContestPerformance.create({
      student: req.user.id || req.user._id,
      contestName,
      rank: Number(rank),
      totalParticipants: Number(totalParticipants),
      performanceScore: Number(perfScore.toFixed(2)),
      datePlayed: datePlayed ? new Date(datePlayed) : new Date()
    });

    return success(res, "Performance logged successfully", performance);
  } catch (error) {
    next(error);
  }
};

exports.getMyPerformances = async (req, res, next) => {
  try {
    const performances = await ContestPerformance.find({ student: req.user.id || req.user._id })
      .sort({ datePlayed: 1 }); // Oldest to newest for graphing
    
    return success(res, "Performances fetched successfully", performances);
  } catch (error) {
    next(error);
  }
};

exports.deletePerformance = async (req, res, next) => {
  try {
    const { id } = req.params;
    await ContestPerformance.findOneAndDelete({ _id: id, student: req.user.id || req.user._id });
    return success(res, "Performance deleted");
  } catch (error) {
    next(error);
  }
};
