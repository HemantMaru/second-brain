// Backend/migrate.js
import mongoose from "mongoose";
import saveModel from "./src/models/save.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getEmbedding(text) {
  try {
    // 🔥 Ye model tere account mein available hai aur 3072 dimensions deta hai
    const model = genAI.getGenerativeModel({
      model: "models/gemini-embedding-2-preview",
    });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("❌ Gemini Error:", error.message);
    return null;
  }
}

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB... 🚀");

    const items = await saveModel.find({});
    console.log(`Force Updating ${items.length} items to 3072 dimensions...`);

    let successCount = 0;

    for (let item of items) {
      const textToEmbed = `${item.title} ${item.note || ""} ${item.collection || ""}`;
      const vector = await getEmbedding(textToEmbed);

      if (vector && vector.length === 3072) {
        item.embedding = vector;
        await item.save();
        console.log(`✅ Fixed [3072]: ${item.title.substring(0, 30)}...`);
        successCount++;
      } else {
        console.log(
          `⚠️ Failed for: ${item.title.substring(0, 30)} (Check terminal logs)`,
        );
      }
    }

    console.log(`\n--- Migration Summary ---`);
    console.log(
      `Total: ${items.length} | Success: ${successCount} | Failed: ${items.length - successCount}`,
    );
  } catch (err) {
    console.error("CRITICAL ERROR:", err);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

migrate();
