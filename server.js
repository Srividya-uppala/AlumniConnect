
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AlumniConnect backend is running!");
});

app.get("/api/alumni", (req, res) => {
  const sql = "SELECT * FROM alumni ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

app.post("/api/alumni", (req, res) => {
  const {
    full_name, email, graduation_year, department,
    company, job_role, location, skills
  } = req.body;

  if (!full_name || !email || !graduation_year || !department) {
    return res.status(400).json({
      message: "Please fill in all required fields."
    });
  }

  const sql = `INSERT INTO alumni
    (full_name, email, graduation_year, department,
     company, job_role, location, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    full_name, email, graduation_year, department,
    company || null, job_role || null,
    location || null, skills || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      const status = err.code === "ER_DUP_ENTRY" ? 409 : 500;
      return res.status(status).json({
        message: err.code === "ER_DUP_ENTRY"
          ? "This email is already registered."
          : "Could not register alumni."
      });
    }

    res.status(201).json({
      message: "Welcome to AlumniConnect!",
      id: result.insertId
    });
  });
});

app.get("/api/jobs", (req, res) => {
  db.query("SELECT * FROM jobs ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

app.post("/api/mentorship", (req, res) => {
  const { student_name, email, mentor_id, message } = req.body;

  if (!student_name || !email || !mentor_id) {
    return res.status(400).json({
      message: "Name, email, and mentor are required."
    });
  }

  const sql = `INSERT INTO mentorship_requests
    (student_name, email, mentor_id, message)
    VALUES (?, ?, ?, ?)`;

  db.query(sql, [student_name, email, mentor_id, message || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Could not submit request."
        });
      }

      res.status(201).json({
        message: "Mentorship request submitted successfully!",
        id: result.insertId
      });
    }
  );
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
