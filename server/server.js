const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");
const CLIENT_DIR = path.join(ROOT_DIR, "client");
loadEnvFile(path.join(__dirname, ".env"));

const PORT = process.env.PORT || 5000;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  try {
    if (req.method === "GET" && req.url === "/api/health") {
      return sendJson(res, 200, {
        status: "ok",
        version: "v0.1.0-basic-gemini-roadmap"
      });
    }

    if (req.method === "GET" && req.url === "/api/roadmap/generate") {
      return sendJson(res, 200, {
        message: "Use POST /api/roadmap/generate with a JSON body.",
        example: {
          topic: "Machine Learning"
        }
      });
    }

    if (req.method === "POST" && req.url === "/api/roadmap/generate") {
      const body = await readJsonBody(req);
      const topic = String(body.topic || "").trim();

      if (!topic) {
        console.warn(`[${timestamp}] Validation Error: Topic is missing`);
        return sendJson(res, 400, { error: "Topic is required." });
      }

      console.log(`[${timestamp}] Generating roadmap for topic: "${topic}"`);
      const roadmap = await generateRoadmap(topic);
      console.log(`[${timestamp}] Successfully generated roadmap: "${roadmap.title}"`);
      return sendJson(res, 200, roadmap);
    }

    if (req.method === "GET") {
      return serveStatic(req, res);
    }

    console.warn(`[${timestamp}] 404 Not Found: ${req.method} ${req.url}`);
    sendJson(res, 404, { error: "Route not found." });
  } catch (error) {
    console.error(`[${timestamp}] Server Error:`, error.message);
    sendJson(res, 500, {
      error: error.message || "Something went wrong."
    });
  }
});

server.listen(PORT, () => {
  console.log(`MapMyLearning running at http://localhost:${PORT}`);
});

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[Config Warning] Env file not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  let count = 0;
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
      count++;
    }
  }
  console.log(`[Config] Loaded ${count} variables from ${filePath}`);
}

function serveStatic(req, res) {
  const requestPath = req.url === "/" ? "/index.html" : req.url;
  const cleanPath = requestPath.split("?")[0].replace(/^\/+/, "");
  const safePath = path.normalize(decodeURIComponent(cleanPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(CLIENT_DIR, safePath);

  if (!filePath.startsWith(CLIENT_DIR)) {
    console.warn(`[Security] Forbidden access attempt: ${filePath}`);
    return sendJson(res, 403, { error: "Forbidden." });
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      console.warn(`[Static] File not found: ${filePath}`);
      return sendJson(res, 404, { error: "Page not found." });
    }

    const extension = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream"
    });
    res.end(data);
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100000) {
        console.error("[Request] Body too large");
        reject(new Error("Request body is too large."));
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        console.error("[Request] Invalid JSON body:", err.message);
        reject(new Error("Invalid JSON body."));
      }
    });
  });
}

async function generateRoadmap(topic) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("[Config Error] GEMINI_API_KEY is missing in environment variables");
    throw new Error("GEMINI_API_KEY is missing. Add it to server/.env.");
  }

  const prompt = [
    "Create a beginner-friendly learning roadmap for this topic:",
    topic,
    "",
    "Return only valid JSON with this shape:",
    "{\"title\":\"string\",\"steps\":[{\"title\":\"string\",\"description\":\"string\",\"resources\":[\"string\"]}]}",
    "",
    "Use 6 to 8 steps. Keep descriptions short and practical."
  ].join("\n");

  const models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
  let lastError = "Gemini request failed.";

  for (const model of models) {
    try {
      console.log(`[AI Request] Calling model: ${model}`);
      const text = await callGeminiModel({ apiKey, model, prompt });
      const roadmap = parseGeminiRoadmap(text, topic);
      return roadmap;
    } catch (error) {
      console.warn(`[AI Warning] Model ${model} failed:`, error.message);
      lastError = error.message || lastError;

      if (!shouldRetryWithAnotherModel(lastError)) {
        throw error;
      }
    }
  }

  console.error("[AI Error] All models failed. Last error:", lastError);
  throw new Error(lastError);
}

async function callGeminiModel({ apiKey, model, prompt }) {
  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000);

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw new Error("Gemini API request timed out after 20 seconds. Check your internet connection, API key, or try again.");
    }

    throw new Error("Unable to reach Gemini API. Check your internet connection and API key.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const message = await response.text();
    console.error(`[AI Error] Gemini API returned status ${response.status}:`, message);
    throw new Error(`Gemini API request failed: ${message}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error("[AI Error] Gemini returned an empty or malformed response body:", JSON.stringify(data));
    throw new Error("Gemini did not return roadmap content.");
  }

  return text;
}

function shouldRetryWithAnotherModel(message) {
  return message.includes('"status": "UNAVAILABLE"') ||
    message.includes('"status": "NOT_FOUND"') ||
    message.includes('"status": "RESOURCE_EXHAUSTED"');
}

function parseGeminiRoadmap(text, topic) {
  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.title || !Array.isArray(parsed.steps)) {
      throw new Error("Missing title or steps in JSON");
    }

    return {
      topic,
      title: parsed.title,
      steps: parsed.steps.map((step, index) => ({
        number: index + 1,
        title: String(step.title || `Step ${index + 1}`),
        description: String(step.description || ""),
        resources: Array.isArray(step.resources) ? step.resources.map(String) : []
      }))
    };
  } catch (err) {
    console.error("[AI Error] Failed to parse roadmap JSON:", err.message);
    console.debug("[AI Debug] Raw response text:", text);
    throw new Error("Gemini response did not match the expected roadmap format.");
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}







