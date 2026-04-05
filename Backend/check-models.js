// Backend/check-models.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );
    const data = await response.json();
    console.log("--- Available Embedding Models ---");
    data.models.forEach((m) => {
      if (m.supportedGenerationMethods.includes("embedContent")) {
        console.log(`✅ Model Name: ${m.name}`);
      }
    });
  } catch (err) {
    console.error("Failed to fetch models:", err.message);
  }
}

listModels();
