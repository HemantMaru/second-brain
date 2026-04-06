import { Router } from "express";
import {
  addHighlight,
  chatWithBrain,
  deleteSavedItems,
  editSavedItem,
  generateFlashcards,
  getRecommendations,
  getSaveItem,
  getSharedItem,
  saveItem,
  savePdfItem,
  saveYoutubeItem,
  searchItems,
  togglePin,
  updateLastOpened,
  saveImageItem,
} from "../controller/save.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= MULTER =================
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const types = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    if (types.includes(file.mimetype)) cb(null, true);
    else cb(new Error("File type not supported!"), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const saveRoutes = Router();
// ================= 🔐 PROTECTED ROUTES =================

saveRoutes.post("/save", protect, saveItem);
saveRoutes.get("/", protect, getSaveItem);
saveRoutes.delete("/delete/:id", protect, deleteSavedItems);
saveRoutes.put("/edit/:id", protect, editSavedItem);
saveRoutes.get("/search", protect, searchItems);
saveRoutes.get("/recommend/:id", protect, getRecommendations);
saveRoutes.put("/pin/:id", protect, togglePin);
saveRoutes.put("/open/:id", protect, updateLastOpened);
saveRoutes.post("/highlight/:id", protect, addHighlight);

// 🤖 AI CHAT (MAIN FIX)
saveRoutes.post("/chat", protect, chatWithBrain);

// 🧠 FLASHCARDS
saveRoutes.get("/flashcards/:id", protect, generateFlashcards);

// 🎥 YOUTUBE
saveRoutes.post("/save-youtube", protect, saveYoutubeItem);

// 📁 FILE UPLOADS
saveRoutes.post("/save-pdf", protect, upload.single("file"), savePdfItem);
saveRoutes.post("/save-image", protect, upload.single("file"), saveImageItem); // Dono mein 'upload' use karo

// 🌍 PUBLIC ROUTE
saveRoutes.get("/share/:id", getSharedItem);

export default saveRoutes;
