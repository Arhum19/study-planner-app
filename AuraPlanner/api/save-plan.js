// Vercel Serverless Function: POST /api/save-plan
// Save plan endpoint
//
// ⚠️ IMPORTANT LIMITATION:
// On Vercel, file system writes are NOT persistent between requests.
// Each serverless function invocation runs in an isolated, ephemeral container.
// The original Express version saved plans to backend/data/plans.json,
// but this approach does NOT work on Vercel.
//
// RECOMMENDED SOLUTIONS:
// 1. Store plan in frontend (localStorage) - simplest, no backend needed
// 2. Use a database (MongoDB Atlas, Supabase, etc.) - requires additional setup
// 3. Use Vercel KV or Edge Config - requires Vercel Pro plan
//
// For now, this endpoint validates the plan and returns success,
// but does NOT actually persist the data.

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
    const plan = req.body;

    // Validate payload - exactly as in original Express route
    if (!plan || Object.keys(plan).length === 0) {
      return res.status(400).json({ error: "Plan data is required" });
    }

    // Return informative response about Vercel limitations
    // We acknowledge the request but explain persistence is not available
    res.status(200).json({
      success: true,
      message: "Plan validated successfully",
      warning:
        "Note: Plan persistence is not available on Vercel serverless deployment. Please store your plan locally in the browser (localStorage).",
      planReceived: true,
    });
  } catch (error) {
    console.error("Error processing plan:", error);
    res.status(500).json({ error: error.message });
  }
}
