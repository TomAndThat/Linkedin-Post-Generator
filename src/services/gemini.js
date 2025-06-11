// src/services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const BLOCK_CATEGORIES = new Set([
  "HARM_CATEGORY_SEXUAL",
  "HARM_CATEGORY_SEXUAL_MINORS",
  "HARM_CATEGORY_VIOLENCE",
  "HARM_CATEGORY_HARASSMENT",
  "HARM_CATEGORY_HATE_SPEECH",
  "HARM_CATEGORY_DANGEROUS",
]);

async function tryGenerate(modelName, base64Image, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
  });

  const response = result.response;

  const safety = response.candidates?.[0]?.safetyRatings || [];
  const isBlocked = safety.some(
    (r) =>
      BLOCK_CATEGORIES.has(r.category) &&
      ["HIGH", "VERY_HIGH"].includes(r.probability)
  );

  if (isBlocked) return { blocked: true };
  return { text: response.text(), blocked: false };
}

export default async function callGemini(base64Image, prompt) {
  try {
    return await tryGenerate("gemini-1.5-pro-latest", base64Image, prompt);
  } catch (err) {
    console.warn(
      "[Gemini API Warning] Pro model failed, trying flash fallback"
    );

    try {
      return await tryGenerate("gemini-1.5-flash-latest", base64Image, prompt);
    } catch (err2) {
      console.error("[Gemini API Error]", err2);

      if (
        err2.message?.includes("API key") ||
        err2.message?.includes("quota")
      ) {
        const knownError = new Error(
          "Issue with the Gemini API configuration."
        );
        knownError.known = true;
        throw knownError;
      }

      throw err2;
    }
  }
}
