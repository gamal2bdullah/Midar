import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Route
  app.post("/api/ai/generate", async (req, res) => {
    try {
      let apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (apiKey) apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
      
      if (!apiKey || apiKey === "undefined") {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }
      
      const { prompt, systemInstruction, responseSchema } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }

      const gemini = new GoogleGenAI({ apiKey });
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: responseSchema ? "application/json" : "text/plain",
          responseSchema: responseSchema,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg = error.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        return res.status(403).json({ error: "مفتاح Gemini API غير صالح. يرجى التأكد من إضافة مفتاح صحيح." });
      }
      res.status(500).json({ error: errorMsg || "Failed to generate AI content" });
    }
  });

  // Health / Auth / Sync ready endpoints
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // Global error handler to ensure JSON responses for API routes
  app.use((err: any, req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
    if (req.path.startsWith('/api/')) {
      console.error("API Unhandled Error:", err);
      res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
    } else {
      next(err);
    }
  });
}

startServer();
