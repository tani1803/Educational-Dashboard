const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();


app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./utils/errorHandler");
const placementRoutes = require("./routes/placement.routes");
const dsaRoutes = require("./routes/placement/dsa.routes");
const developmentRoutes = require("./routes/placement/development.routes");
const contestRoutes = require("./routes/placement/contest.routes");
const mockOARoutes = require("./routes/placement/mockOA.routes");
const tpcRoutes = require("./routes/placement/tpc.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const alumniRoutes = require("./routes/alumni.routes");
const taRoutes = require("./routes/ta.routes");
const taRequestRoutes = require("./routes/taRequest.routes");

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/placement", placementRoutes);
app.use("/api/placement/dsa", dsaRoutes);
app.use("/api/placement/development", developmentRoutes);
app.use("/api/placement/contests", contestRoutes);
app.use("/api/placement/mock-oa", mockOARoutes);
app.use("/api/placement/tpc", tpcRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/ta", taRoutes);
app.use("/api/ta-requests", taRequestRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handler
app.use(errorHandler);

module.exports = app;