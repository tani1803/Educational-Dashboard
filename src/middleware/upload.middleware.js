const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Keep the original name but add a timestamp to prevent overwriting files with the same name
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// The security filter
const fileFilter = (req, file, cb) => {
  // 1. Define the allowed extensions (Regex)
  const allowedFileTypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|zip|rar|7z/;
  
  // 2. Check the file extension
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  
  // 3. Check the MIME type (what the file actually is inside)
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file type. Only PDFs, Word, Excel, PPT, and images are allowed."));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // Limits file size to 10MB (prevents server crashing from huge uploads)
});

module.exports = upload;