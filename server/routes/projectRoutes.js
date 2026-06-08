const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// Get all projects for logged in user
router.get("/", async (req, res) => {
  try {
    // In a real app, use passport middleware to get req.user.id
    // For now, we'll assume the front-end sends a header or we use a session
    if (!req.isAuthenticated && !req.headers.userid) {
       return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user ? req.user._id : req.headers.userid;
    const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new project
router.post("/", async (req, res) => {
  const { name, location, items, userId } = req.body;
  try {
    const newProject = new Project({
      user: userId,
      name,
      location,
      items
    });
    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update project
router.put("/:id", async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
