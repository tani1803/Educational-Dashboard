## Login & Registration Instructions (Development)

This application utilizes a custom Role-Based Access Control (RBAC) system. Since there are no pre-seeded users, you will need to register an account to access the dashboard.

### 1. Registering an Account
Navigate to the **Sign Up / Registration** page and fill out the details. 
- **Allowed Roles:** `student`, `professor`, `ta`, `alumni`
- **College ID:** Use any alphanumeric ID. For students, it's recommended to use an actual format (e.g., `2401AI54`) because the system dynamically extracts your "Department" (e.g., `AI` → `Artificial Intelligence`) from the ID format!
- **Strict Email Format (Important):** For `student` and `ta` roles, the system validates that the email matches the official university regex layout. **You must use this format:** 
  `yourname_2401ai54@iitp.ac.in` 
  *(Professors and alumni bypass this strict check, but keeping the format is good practice).*

### 2. Getting the OTP (Local Development Setup)
To prevent spam during local development, real Outlook SMTP email sending is temporarily commented out. 
Instead, **the 4-digit verification OTP will print directly to your backend terminal!**

Once you hit "Register", check the terminal running `node server.js` for an output like this:
```text
=========================================
 MOCK EMAIL SENT
 ----------------------------------------
 To:      yourname_2401ai54@iitp.ac.in
 Subject: EduNexus — Your OTP for Registration
 OTP:     8492
=========================================


Done with authentication (register/login via collegeId + JWT), RBAC middleware (protect + restrictTo), course creation by professor, student enrollment, and get all users for professor and TA. Models for User and Course are also finalized with all required fields.

2. The Grading Engine (Architecture)
Normalized Database Schema: Built a dedicated Grade model to keep the database fast, tracking individual components (quizzes, midsem, endsem) and final scores.

Auto-Generation: Wired the enrollment endpoint to automatically spin up a blank, fresh grade sheet the moment a student joins a course.

Academic Audit Logs: Implemented an automated tracking system that records exactly who (Professor or TA) changed a grade, what they changed, and when they changed it.

3. Business Logic & Automation
Weighted Math: Wrote automated calculation logic that takes the professor's custom course weights (e.g., Midsem = 30%, Endsem = 40%) and instantly recalculates the student's final score whenever a TA updates a quiz.

Role-Based Guardrails: Created strict security checks so TAs can grade components, but only the Professor can assign the official Final Letter Grade and hit the "Publish" button.

The Release Switch: Built a toggle system that keeps grades hidden from students until the professor explicitly releases them.

4. Enterprise-Level Features
Bulk CSV Operations: Integrated json2csv and csvtojson to allow professors to download the entire class roster as a spreadsheet, grade offline, and upload the file to update the entire database at once.


I have compiled all the newly introduced dependencies into requirements.txt at the root of your project directory for you!

Here is a comprehensive summary of the massive architecture and feature expansions we’ve implemented to your EdTech platform today:

1. Global Search Infrastructure
Wired Top Navigation: The previously "dummy" search bar on the global Navbar is now active and intelligent. Hitting Enter navigates users directly to the newly built /dashboard/search?q= UI interface.
Dual-Collection Aggregation Engine: We created a backend global search controller that simultaneously scans both the Courses module (checking IDs, Titles, and Descriptions) and the Assignments/Lessons module, returning beautifully segregated lists straight to the user.
2. The Placement Experience Module (Backend)
Security & Data Modeling: We added the PlacementPost Mongoose Schema and integrated the xss payload sanitizer so users can safely post HTML without Cross-Site Scripting vulnerabilities.
Trie Search Integration: We extended your custom C++ String Matching engine (Trie) to the Placements dashboard, allowing the server to blast through all posted Company Names and Job Roles instantly.
Privacy & Filtering: We added functionality supporting Anonymous publishing, Upvoting, Bookmarking, and querying the database directly by unique Tags (e.g., System Design, AI).
3. Reddit-Style Nested Comments Algorithm
Added the Comment model referencing PlacementPost roots and self-referencing parentComment objects.
Instead of letting Mongoose do an infinitely slow database population mapping, we wrote a highly efficient mathematically ideal $O(n)$ Hash Map algorithm that automatically grabs all child replies across a thread and recursively builds out the exact UI indentations into one unified local pass!
4. Placement Experience Module (Frontend Suite)
react-quill Integration: Integrated a Rich-Text text editor into the React frontend, dynamically disabled from Server Side Rendering to play nicely with Next.js hooks.
The Grid Viewer Context (/placements): Built a gorgeous feed card view that tracks placement packages natively and displays role filters dynamically depending on if you are logging on as an unprivileged junior vs. an authorized senior/alumni.
The Editor Engine (/placements/new): Seniors can click "Add Round" dynamically to seamlessly render independent text boxes iterating down their physical interview process step-by-step.
5. Automated Department Logic & Course Security
Auto Rollover Engine: Eradicated the requirement for manual user input during Department assignment on the main login screen. Your backend registration code now leverages native regex to read prefixes (e.g. CS, AI, EE) strictly from the user's uploaded collegeId and dynamically maps it onto identical string-mapped MongoDB enums.
Auth Token Injection: Rewrote the internal mechanics of your jwt.verify() middleware config, locking down department scopes immediately during login.
Strict Access Control: Fixed the exact Course logic parameter testing where backend requests dynamically check the user's true department value directly against the backend Course target they attempt to enroll in, locking them out entirely without a matching profile.
