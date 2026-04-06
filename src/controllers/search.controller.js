const { spawn } = require("child_process");
const path = require("path");
const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");

exports.searchStudents = async (req, res, next) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query ?q= is required" });
    }

    const course = await Course.findOne({ courseId: req.params.id })
      .populate("students", "name collegeId email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.students.length === 0) {
      return success(res, "No students enrolled in this course", []);
    }

    const studentNames = course.students.map((s) => s.name);

    // Navigate up one folder to 'src', then into 'trie'
    const binaryPath = path.join(__dirname, "../trie/trie_search.exe");

    const args = [query, ...studentNames];

    const cpp = spawn(binaryPath, args);

    let output = "";
    let errorOutput = "";

    cpp.stdout.on("data", (data) => {
      output += data.toString();
    });

    cpp.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    cpp.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ message: "Search engine crashed", errorOutput, code });
      }

      const rawOutput = output.trim();
      const normalize = (str) => str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

      const matchedNames = rawOutput ? rawOutput.split(",").map(normalize) : [];

      const matchedStudents = course.students.filter((student) =>
        matchedNames.includes(normalize(student.name))
      );

      // console.log(`[TRIE DEBUG] Query: '${query}'`);
      // console.log(`[TRIE DEBUG] C++ rawOutput: '${rawOutput}'`);
      // console.log(`[TRIE DEBUG] matchedNames Array:`, matchedNames);
      // console.log(`[TRIE DEBUG] matchedStudents Length:`, matchedStudents.length);
      // console.log(`[TRIE DEBUG] Returning JSON Data: \n`, JSON.stringify(matchedStudents, null, 2));

      // Return debugging metadata inside success array so we know it didn't fail natively
      return res.status(200).json({
        success: true,
        message: `Found ${matchedStudents.length} student(s)`,
        data: matchedStudents,
        debug: { rawOutput, matchedNames, args }
      });
    });

    cpp.on("error", (err) => {
      return res.status(500).json({
        message: "Failed to locate or start C++ Binary",
        binaryPath,
        error: err.message
      });
    });

  } catch (error) {
    next(error);
  }
};
