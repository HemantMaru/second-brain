import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import axios from "axios";
import * as cheerio from "cheerio";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Models & Libraries
import saveModel from "../models/save.model.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 🧠 AI HELPERS ---
const cleanText = (text) => {
  return text
    .replace(
      /official video|lyrical|video song|full song|youtube|music video/gi,
      "",
    )
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

async function getEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-embedding-2-preview",
    });
    const cleaned = cleanText(text);
    const result = await model.embedContent(cleaned);
    return result.embedding.values;
  } catch (error) {
    return null;
  }
}

async function generateAISummary(title, scrapedContent) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      Context: You are an AI librarian for a 'Second Brain' app.
      Task: Summarize this content in 2 short lines and suggest 5 tags.
      Format:
      Summary: [text]
      Tags: [tag1, tag2, tag3, tag4, tag5]

      Title: ${title}
      Content: ${scrapedContent.substring(0, 1200)}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let summary = "Summary generation failed.";
    let suggestedTags = [];

    const lines = response.split("\n");
    lines.forEach((line) => {
      if (line.toLowerCase().startsWith("summary:"))
        summary = line.replace(/summary:/i, "").trim();
      if (line.toLowerCase().startsWith("tags:")) {
        suggestedTags = line
          .replace(/tags:/i, "")
          .replace(/[\[\]]/g, "")
          .split(",")
          .map((t) => t.trim().toLowerCase());
      }
    });

    return { summary, suggestedTags };
  } catch (error) {
    return {
      summary: `Saved fragment: ${title}.`,
      suggestedTags: ["neural-vault"],
    };
  }
}

// --- 🛡️ CONTROLLERS ---

// 1. Save Generic Link

export const saveItem = async (req, res) => {
  try {
    const { url, collection, tags, note } = req.body;

    let title = url;
    let thumbnail = "";

    // 🔥 LINK PREVIEW API CALL
    try {
      const preview = await axios.get(
        `https://api.linkpreview.net/?key=${process.env.LINK_PREVIEW_API_KEY}&q=${encodeURIComponent(url)}`,
      );

      title = preview.data.title || url;
      thumbnail = preview.data.image || "";
    } catch (err) {
      console.log("Preview API failed:", err.response?.data || err.message);

      // 🔥 FALLBACK (IMPORTANT)
      thumbnail = `https://image.thum.io/get/width/800/crop/600/${url}`;
    }
    // 🔥 FINAL FALLBACK (अगर image नहीं मिली)
    if (!thumbnail) {
      thumbnail = `https://image.thum.io/get/width/800/crop/600/${url}`;
    }

    const newItem = await Save.create({
      user: req.user._id,
      url,
      title,
      thumbnail,
      collection,
      tags,
      note,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 2. Multi-Vector Search (Strict User Isolation)
export const searchItems = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query) {
      const allItems = await saveModel
        .find({ user: userId })
        .sort({ createdAt: -1 });
      return res.json({ data: allItems });
    }

    const queryVector = await getEmbedding(query);
    let vectorResults = [];

    if (queryVector) {
      vectorResults = await saveModel.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryVector,
            numCandidates: 100,
            limit: 15,
          },
        },
        { $match: { user: userId } },
        { $addFields: { score: { $meta: "vectorSearchScore" } } },
      ]);
    }

    const regexResults = await saveModel
      .find({
        user: userId,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
        ],
      })
      .limit(15);

    const combined = [...regexResults, ...vectorResults];
    const uniqueResults = Array.from(
      new Map(combined.map((item) => [item._id.toString(), item])).values(),
    );

    res.json({ data: uniqueResults });
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};

// 3. Edit Item (Ownership Check)
export const editSavedItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, collection, tags } = req.body;

    const updated = await saveModel.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { note, collection, tags },
      { new: true },
    );

    if (!updated)
      return res
        .status(403)
        .json({ message: "Forbidden: Item not owned by user" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// 4. Get User Graph (Filtered)
export const getGraphData = async (req, res) => {
  try {
    const items = await saveModel.find({ user: req.user._id });
    const nodes = items.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      collection: item.collection || "General",
      val: 5,
    }));

    const links = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const commonTags = items[i].tags.filter((tag) =>
          items[j].tags.includes(tag),
        );
        if (commonTags.length > 0) {
          links.push({
            source: items[i]._id.toString(),
            target: items[j]._id.toString(),
            width: commonTags.length * 2,
          });
        }
      }
    }
    res.json({ nodes, links });
  } catch (err) {
    res.status(500).json({ message: "Graph visualization failed" });
  }
};

// 5. Get All User Items
export const getSaveItem = async (req, res) => {
  try {
    const items = await saveModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ data: items });
  } catch (error) {
    res.status(500).json({ message: "Error fetching fragments" });
  }
};

// 6. Recommendations (User-Specific)
export const getRecommendations = async (req, res) => {
  try {
    const currentItem = await saveModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!currentItem)
      return res.status(404).json({ message: "Node not found" });

    const recommendations = await saveModel
      .find({
        user: req.user._id,
        _id: { $ne: req.params.id },
        tags: { $in: currentItem.tags },
      })
      .limit(5);

    res.json({ data: recommendations });
  } catch (err) {
    res.status(500).json({ message: "Discovery failed" });
  }
};

// 7. RAG Chat (Strict User Filter)
export const chatWithBrain = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    const queryVector = await getEmbedding(message);
    if (!queryVector)
      return res.status(500).json({ message: "AI Sync failed" });

    const contextResults = await saveModel.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 50,
          limit: 3,
        },
      },
      { $match: { user: userId } },
      { $project: { title: 1, note: 1, _id: 0 } },
    ]);

    const contextText =
      contextResults.length > 0
        ? contextResults
            .map((r) => `Title: ${r.title}\nNote: ${r.note}`)
            .join("\n\n")
        : "No relevant personal data found.";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const userName = req.user.name || "User";

    const prompt = `
You are NeuroVault AI 🤖 — a smart second brain assistant.

About the app:
- NeuroVault helps users save links, PDFs, images, and videos
- It organizes knowledge using AI
- It provides summaries, search, flashcards, and chat
- It acts like a personal knowledge vault

User Info:
- Name: ${userName}

Context from user's saved data:
${contextText}

Instructions:
- Talk like a smart AI assistant
- Be helpful, short, and clear
- Personalize responses using user's name when needed
- If asked about the app, explain what NeuroVault does

User Question:
${message}
`;
    const result = await model.generateContent(prompt);
    res.json({ answer: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: "Brain communication failed" });
  }
};

// 8. PDF Processing (Ownership Added)
// 8. PDF Processing (FIXED UPLOAD)
export const savePdfItem = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF found" });

    // 🔥 FIX: Convert buffer to Base64 for ImageKit
    const fileBase64 = req.file.buffer.toString("base64");

    const ikResponse = await imagekit.upload({
      file: fileBase64,
      fileName: req.file.originalname,
      folder: "/neurovault/pdfs",
    });

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(req.file.buffer),
    });
    const pdf = await loadingTask.promise;

    let extractedText = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      extractedText += content.items.map((item) => item.str).join(" ") + "\n";
    }

    const item = new saveModel({
      title: req.file.originalname.replace(".pdf", ""),
      url: ikResponse.url,
      thumbnail:
        "https://plus.unsplash.com/premium_photo-1731951687922-1bb9d7722a49?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Strict PDF Icon
      type: "pdf",
      tags: ["pdf", "archives"],
      collection: req.body.collection || "Archives",
      note: extractedText.substring(0, 500),
      shareId: nanoid(8),
      user: req.user._id,
    });

    await item.save();
    res.status(201).json({ message: "PDF Ingested", data: item });
  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ message: "PDF sync failed" });
  }
};

// 9. Vision Processing (FIXED UPLOAD)
export const saveImageItem = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    // 🔥 FIX: Convert buffer to Base64 for ImageKit
    const fileBase64 = req.file.buffer.toString("base64");

    const ikResponse = await imagekit.upload({
      file: fileBase64,
      fileName: req.file.originalname,
      folder: "/neurovault/images",
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt =
      "Describe this image for a search database in one paragraph.";
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const summary = result.response.text();

    const item = new saveModel({
      title: req.file.originalname,
      url: ikResponse.url,
      thumbnail: ikResponse.url, // Real image URL
      type: "image",
      tags: ["image", "visual"],
      collection: req.body.collection || "Gallery",
      note: summary,
      shareId: nanoid(8),
      user: req.user._id,
    });

    await item.save();
    res.status(201).json({ message: "Vision Analyzed", data: item });
  } catch (error) {
    console.error("IMAGE ERROR:", error);
    res.status(500).json({ message: "Vision sync failed" });
  }
};

// 10. YouTube Sync (Ownership Added)
export const saveYoutubeItem = async (req, res) => {
  try {
    const { url, collection } = req.body;

    let videoId = url.includes("v=")
      ? url.split("v=")[1]?.split("&")[0]
      : url.split("/").pop();

    if (!videoId) {
      return res.status(400).json({ message: "Invalid YT Link" });
    }

    let realTitle = "YouTube Video";

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${url}&format=json`;
      const ytRes = await axios.get(oembedUrl);
      realTitle = ytRes.data.title;
    } catch (err) {
      console.log("⚠️ YT title fetch failed");
    }

    let finalTitle = realTitle;

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = `
      You are an AI assistant.
      Task: Improve the YouTube title to make it short, clean, and meaningful.

      Rules:
      - Remove unnecessary words like "full video", "official", etc.
      - Keep it under 8 words
      - Make it catchy and clear

      Original Title: ${realTitle}
      `;

      const result = await model.generateContent(prompt);
      const aiTitle = result.response.text().trim();

      if (aiTitle && aiTitle.length > 3) {
        finalTitle = aiTitle;
      }
    } catch (err) {
      console.log("⚠️ Gemini failed, using real title");
    }

    const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; // 🔥 HIGH-Q YT THUMBNAIL

    const item = new saveModel({
      title: finalTitle,
      url,
      thumbnail,
      type: "youtube",
      tags: ["video", "youtube"],
      collection: collection || "Streams",
      note: `Saved from YouTube: ${realTitle}`,
      shareId: nanoid(8),
      user: req.user._id,
    });

    await item.save();
    res.status(201).json({
      message: "YouTube Node Created",
      data: item,
    });
  } catch (err) {
    console.error("YT ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 11. Security & Logic Toggles
export const togglePin = async (req, res) => {
  try {
    const item = await saveModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!item) return res.status(403).json({ message: "Unauthorized" });

    item.isPinned = !item.isPinned;
    await item.save();
    res.json(item);
  } catch (e) {
    res.status(500).send();
  }
};

export const deleteSavedItems = async (req, res) => {
  try {
    const result = await saveModel.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!result) return res.status(403).json({ message: "Access Denied" });
    res.status(200).json({ message: "Purged from memory" });
  } catch (err) {
    res.status(500).send();
  }
};

// 12. Highlights & Metadata
export const addHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const item = await saveModel.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $push: { highlights: { text } } },
      { new: true },
    );
    if (!item) return res.status(403).send();
    res.json(item.highlights);
  } catch (err) {
    res.status(500).send();
  }
};

export const generateFlashcards = async (req, res) => {
  try {
    const item = await saveModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!item) return res.status(404).send();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Create 3 flashcards for: ${item.title}. Format: [{"q": "...", "a": "..."}]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[.*\]/s);

    res.status(200).json({ data: JSON.parse(jsonMatch[0]) });
  } catch (err) {
    res.status(500).send();
  }
};

export const updateLastOpened = async (req, res) => {
  const item = await saveModel.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { lastOpened: new Date() },
    { new: true },
  );

  if (!item) return res.status(403).json({ message: "Unauthorized" });

  res.json(item);
};

export const getSharedItem = async (req, res) => {
  const item = await saveModel.findOne({ shareId: req.params.id });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ data: item });
};
