// Vercel Serverless Function: GET /api/plan
// Retrieve saved plan endpoint
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
// For now, this endpoint returns an informative error explaining the limitation.

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Return informative response about Vercel limitations
  res.status(501).json({
    error: "Plan persistence not available on Vercel serverless deployment",
    message:
      "Vercel serverless functions are stateless. Plans cannot be saved to file system. Please store your plan locally in the browser or use a database service.",
    suggestion:
      "The generated plan is returned directly from /api/generate-plan. Store it in localStorage or state management.",
  });
}
