const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const scheduler = require("../scheduler");

const PLANS_FILE = path.join(__dirname, "../../data/plans.json");

// GET /api/status
router.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

// POST /api/generate-plan
router.post("/generate-plan", async (req, res) => {
  try {
    const { durationDays, availability, topics, sessionLength } = req.body;

    // Validate payload
    if (!durationDays || !availability || !topics || !sessionLength) {
      return res.status(400).json({
        error:
          "Missing required fields: durationDays, availability, topics, sessionLength",
      });
    }

    if (!Array.isArray(availability) || availability.length === 0) {
      return res
        .status(400)
        .json({ error: "Availability must be a non-empty array" });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return res
        .status(400)
        .json({ error: "Topics must be a non-empty array" });
    }

    // Generate plan using scheduler
    const plan = scheduler.generatePlan({
      durationDays,
      availability,
      topics,
      sessionLength,
    });

    // Save to plans.json
    await fs.writeFile(PLANS_FILE, JSON.stringify(plan, null, 2));

    res.json({ success: true, plan });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plan
router.get("/plan", async (req, res) => {
  try {
    const data = await fs.readFile(PLANS_FILE, "utf-8");
    const plan = JSON.parse(data);
    res.json(plan);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "No plan found" });
    }
    console.error("Error reading plan:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/save-plan
router.post("/save-plan", async (req, res) => {
  try {
    const plan = req.body;

    if (!plan || Object.keys(plan).length === 0) {
      return res.status(400).json({ error: "Plan data is required" });
    }

    await fs.writeFile(PLANS_FILE, JSON.stringify(plan, null, 2));
    res.json({ success: true, message: "Plan saved successfully" });
  } catch (error) {
    console.error("Error saving plan:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
