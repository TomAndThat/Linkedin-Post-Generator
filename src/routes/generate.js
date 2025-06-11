// src/routes/generate.js
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import generatePrompt from "../utils/generatePrompt.js";
import callGemini from "../services/gemini.js";
import heicConvert from "heic-convert";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function convertHeicIfNeeded(filePath) {
  const buffer = fs.readFileSync(filePath);

  // Basic HEIC file signature check
  const isHeic =
    buffer[0] === 0x00 &&
    buffer[1] === 0x00 &&
    buffer[2] === 0x00 &&
    buffer.toString("utf8", 4, 8) === "ftyp";

  if (isHeic) {
    const outputBuffer = await heicConvert({
      buffer,
      format: "JPEG",
      quality: 1,
    });

    const newPath = filePath.replace(path.extname(filePath), ".jpg");
    fs.writeFileSync(newPath, outputBuffer);
    fs.unlinkSync(filePath); // delete original HEIC
    return newPath;
  }

  return filePath;
}

export default async function generatePost(req, res) {
  const filePath = req.file?.path;
  let resizedPath = "";

  try {
    const { audience } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    // Convert HEIC to JPEG if needed
    const safePath = await convertHeicIfNeeded(filePath);

    // Resize image
    resizedPath = path.join(
      __dirname,
      "../../uploads/resized-" + path.basename(safePath)
    );
    await sharp(safePath)
      .resize({ width: 1600, height: 1600, fit: "inside" })
      .toFile(resizedPath);

    // Convert image to base64
    const imageBuffer = fs.readFileSync(resizedPath);
    const base64Image = imageBuffer.toString("base64");

    // Prepare prompt
    const prompt = generatePrompt(audience);

    // Call Gemini API
    try {
      const geminiResponse = await callGemini(base64Image, prompt);
      if (geminiResponse.blocked) {
        return res.status(403).json({
          error:
            "Image content was deemed inappropriate for response generation.",
        });
      }

      res.json({ text: geminiResponse.text });
    } catch (err) {
      console.error("[Gemini Error]", err);
      if (err.known) {
        res.status(400).json({ error: err.message });
      } else {
        res
          .status(500)
          .json({ error: "Something went wrong. Please try again later." });
      }
    }
  } catch (err) {
    console.error(err);
    if (err.known) {
      res.status(400).json({ error: err.message });
    } else {
      res
        .status(500)
        .json({ error: "Something went wrong. Please try again later." });
    }
  } finally {
    // Clean up temp files
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (resizedPath && fs.existsSync(resizedPath)) fs.unlinkSync(resizedPath);
  }
}
