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

function parseGeminiRoadmap(text, topic) {
  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("[AI Error] Failed to parse Gemini response as JSON:", error.message);
    console.debug("[AI Debug] Raw text:", text);
    throw new Error("AI generated a malformed roadmap. Please try again.");
  }
}

function shouldRetryWithAnotherModel(message) {
  return message.includes('"status": "UNAVAILABLE"') ||
    message.includes('"status": "NOT_FOUND"') ||
    message.includes('"status": "RESOURCE_EXHAUSTED"');
}

exports.generateRoadmap = async (topic) => {
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
};
