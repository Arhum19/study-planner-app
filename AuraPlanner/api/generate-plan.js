// Vercel Serverless Function: POST /api/generate-plan
// Core plan generation endpoint - uses scheduler.generatePlan()

import { generatePlan } from "./lib/scheduler.js";

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { durationDays, availability, topics, sessionLength } = req.body;

    // Validate payload - exactly as in original Express route
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

    // Generate plan using scheduler - UNCHANGED LOGIC
    const plan = generatePlan({
      durationDays,
      availability,
      topics,
      sessionLength,
    });

    // Return the generated plan
    // NOTE: We do NOT save to file system on Vercel (stateless)
    // The frontend should handle storing the plan (localStorage, etc.)
    res.status(200).json({ success: true, plan });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: error.message });
  }
}
