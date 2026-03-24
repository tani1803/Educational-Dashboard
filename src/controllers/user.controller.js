const User = require("../models/user.model");
const { success } = require("../utils/apiResponse");

// prof ans TA can access the feature only 
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    return success(res, "Users fetched", users);
  } catch (error) {
    next(error);
  }
};
