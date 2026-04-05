import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const CreateItem = async (url, tags, collection, note) => {
  const response = await api.post("/api/item/save", {
    url,
    tags,
    collection,
    note,
  });
  return response.data;
};

export const getCreateItem = async () => {
  const response = await api.get("/api/item/");
  return response.data;
};

export const deleteSavedItems = async (id) => {
  const response = await api.delete(`/api/item/delete/${id}`);
  return response.data;
};

export const editSavedItems = async (id, url, note) => {
  const response = await api.put(`/api/item/edit/${id}`, {
    url,
    note,
  });
  return response.data;
};

export const searchItems = async (query) => {
  const response = await api.get(`/api/item/search?query=${query}`);
  return response.data;
};

export const getRecommendations = async (id) => {
  const res = await api.get(`/api/item/recommend/${id}`);
  return res.data;
};

export const togglePin = async (id) => {
  const res = await api.put(`/api/item/pin/${id}`);
  return res.data;
};

export const updateLastOpened = async (id) => {
  const res = await api.put(`/api/item/open/${id}`);
  return res.data;
};
export const getSharedItem = async (shareId) => {
  const res = await api.get(`/api/item/share/${shareId}`);
  return res.data.data; // 🔥 Direct data bhej rahe hain component ko
};

// save.api.js mein ye change karo
export const chatWithBrainAPI = async (message) => {
  try {
    // 🔥 Path ko correct karo: /api/item/chat
    const response = await api.post("/api/item/chat", { message });
    return response.data;
  } catch (error) {
    console.error("Chat API Error:", error);
    throw error;
  }
};

// save.api.js
export const getFlashcardsAPI = async (id) => {
  try {
    // 🔥 Path pakka /api/item/flashcards/ hona chahiye
    const response = await api.get(`/api/item/flashcards/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Flashcards API Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// src/api/save.api.js mein add karo

export const uploadPdfAPI = async (formData) => {
  try {
    // 🔥 TRICK: File upload ke liye header 'multipart/form-data' zaroori hai
    const response = await api.post("/api/item/save-pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("PDF API Error:", error);
    throw error;
  }
};

export const uploadImageAPI = async (formData) => {
  const res = await api.post("/api/item/save-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const addHighlightAPI = async (id, text) => {
  const res = await api.post(`/api/item/highlight/${id}`, { text });
  return res.data;
};

export async function saveYoutubeAPI(data) {
  const res = await api.post("/api/item/save-youtube", data);
  return res.data;
}
