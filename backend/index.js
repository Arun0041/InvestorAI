// ─────────────────────────────────────────────────────────────
// Express Server — AI Investment Research Agent API
// 
// Endpoints:
//   GET /api/health    → Health check
//   GET /api/research  → SSE stream of research results
// ─────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runResearchAgent } from "./lib/agent.js";

// Load environment variables from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    keys: {
      google: !!process.env.GOOGLE_API_KEY,
      tavily: !!process.env.TAVILY_API_KEY,
    },
  });
});

// ─── SSE Research Endpoint ──────────────────────────────────

app.get("/api/research", async (req, res) => {
  const { company } = req.query;

  // Validate input
  if (!company || company.trim().length === 0) {
    return res.status(400).json({ error: "Company name is required. Use ?company=Tesla" });
  }

  if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.includes("your_google_gemini_api_key_here")) {
    return res.status(500).json({
      error: "Invalid Google Gemini API Key. Please replace 'your_google_gemini_api_key_here' with your actual Gemini API key in the .env file at the project root.",
    });
  }

  // Set up Server-Sent Events
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Disable Nginx buffering
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: "connected", company: company.trim() })}\n\n`);

  // Heartbeat to keep connection alive (every 15s)
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  // Handle client disconnect
  let isClientConnected = true;
  req.on("close", () => {
    isClientConnected = false;
    clearInterval(heartbeat);
  });

  try {
    for await (const event of runResearchAgent(company.trim())) {
      if (!isClientConnected) break;
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  } catch (error) {
    console.error("❌ Research agent error:", error);
    if (isClientConnected) {
      res.write(
        `data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`
      );
    }
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
});

// ─── Start Server ───────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║       🚀 AI Investment Research Agent Server        ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Server:   http://localhost:${PORT}                    ║
║  API:      http://localhost:${PORT}/api/research       ║
║  Health:   http://localhost:${PORT}/api/health          ║
║                                                      ║
║  API Keys:                                           ║
║    Google Gemini: ${process.env.GOOGLE_API_KEY ? "✅ Configured" : "❌ Missing (required)"}           ║
║    Tavily Search: ${process.env.TAVILY_API_KEY ? "✅ Configured" : "⚠️  Missing (optional)"}           ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});
