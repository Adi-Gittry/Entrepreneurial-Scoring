import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiKeyConfigured: !!process.env.GEMINI_API_KEY });
});

// AI Interpretation Endpoint
app.post("/api/assess/interpret", async (req, res) => {
  const {
    userName,
    organization,
    overallScore,
    category,
    dimensionScores,
    strengths,
    developments,
  } = req.body;

  const ai = getAIClient();

  if (!ai) {
    console.warn("GEMINI_API_KEY environment variable is not configured. Falling back to local interpretation.");
    return res.status(412).json({
      error: "Gemini API key is not configured.",
      fallback: true,
    });
  }

  try {
    const prompt = `You are a professional psychometrician, startup incubator director, and executive founder coach. Your task is to generate a highly detailed, personalized entrepreneurial readiness assessment summary report for a participant.

Participant Name: ${userName || "Anonymous"}
Organization/Institution: ${organization || "N/A"}
Overall Entrepreneurial Score: ${overallScore}/100
Entrepreneurial Potential Category: ${category}

Dimension Scores:
${dimensionScores.map((d: any) => `- ${d.dimensionName}: ${d.score}/100`).join("\n")}

Top 3 Strengths:
${strengths.map((s: any) => `- ${s.name} (${s.score}/100)`).join("\n")}

Top 3 Development Areas:
${developments.map((d: any) => `- ${d.name} (${d.score}/100)`).join("\n")}

Generate a comprehensive evaluation containing:
1. A highly personalized, detailed, and engaging assessment summary interpretation of at least 300 to 500 words (written in professional Markdown). Discuss the critical interaction between their highest strengths and their lowest development areas. Offer a descriptive professional profile (e.g., "The Visionary Ideator with Execution Gaps" or "The Grounded Operations Leader").
2. 3 Specific, tailored Career Recommendations selected from this list: Startup Founder, Co-Founder, Product Manager, Innovation Manager, Research Entrepreneur, Startup Team Member, Consultant, Corporate Intrapreneur. Provide a custom 1-sentence justification for each choice based on their dimensions score.
3. A structured, highly actionable 30-Day, 60-Day, and 90-Day Improvement Plan, consisting of 3 specific developmental milestones for each period, specifically targeting their bottom 3 development areas.

Return the response strictly as valid JSON that conforms to this schema:
{
  "aiInterpretation": "string (at least 300-500 words of rich markdown-formatted assessment summary)",
  "careerRecommendations": [
    "string: Career Title 1: Justification...",
    "string: Career Title 2: Justification...",
    "string: Career Title 3: Justification..."
  ],
  "improvementPlan": {
    "day30": ["milestone 1", "milestone 2", "milestone 3"],
    "day60": ["milestone 1", "milestone 2", "milestone 3"],
    "day90": ["milestone 1", "milestone 2", "milestone 3"]
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiInterpretation: {
              type: Type.STRING,
              description: "Detailed 300-500 words personalized psychometric narrative, styled with professional markdown.",
            },
            careerRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 customized career recommendations with a 1-sentence justification each.",
            },
            improvementPlan: {
              type: Type.OBJECT,
              properties: {
                day30: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 developmental actions for the first 30 days.",
                },
                day60: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 developmental actions for 31-60 days.",
                },
                day90: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 developmental actions for 61-90 days.",
                },
              },
              required: ["day30", "day60", "day90"],
            },
          },
          required: ["aiInterpretation", "careerRecommendations", "improvementPlan"],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response from Gemini.");
    }

    const resultData = JSON.parse(textOutput);
    res.json(resultData);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Failed to generate interpretation via Gemini API.",
      details: error.message,
      fallback: true,
    });
  }
});

async function start() {
  // Vite dev server vs compiled static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static files from ${distPath} in production.`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
