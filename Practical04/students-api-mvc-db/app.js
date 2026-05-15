const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();

const studentController = require("./controllers/studentController");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Routes for students
// Link specific URL paths to the corresponding controller functions
app.get("/students", studentController.getAllStudents);
app.get("/students/:id", studentController.getStudentById);
app.post("/students", studentController.createStudent);

app.put("/students/:id", validateStudentId, validateStudent, studentController.updateStudent);
app.delete("/students/:id", validateStudentId, studentController.deleteStudent);
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
// Listen for termination signals (like Ctrl+C)
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Close any open connections
  await sql.close();
  console.log("Database connections closed");
  process.exit(0); // Exit the process
});