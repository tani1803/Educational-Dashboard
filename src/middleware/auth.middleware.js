const jwt = require("jsonwebtoken");

// Verifies JWT and attaches decoded user to req.user
exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }
};

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      let userRole = req.user.role;
      
      if (!userRole) {
        const User = require('../models/user.model');
        const user = await User.findById(req.user.id);
        if (user && user.role) userRole = user.role;
      }

      if (!userRole || !roles.includes(userRole.toLowerCase())) {
        return res.status(403).json({
          message: "You do not have permission to perform this action."
        });
      }
      next();
    } catch (e) {
      return res.status(500).json({ message: "Server error verifying permissions" });
    }
  };
};
