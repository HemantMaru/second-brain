import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  Zap,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Fingerprint,
  Plus,
  Cpu,
  Globe,
} from "lucide-react";
// Import saveYoutubeAPI because it handles social media extraction in your system
import {
  CreateItem,
  uploadImageAPI,
  uploadPdfAPI,
  saveYoutubeAPI,
} from "../services/save.api";

const CreateNode = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("url"); // 'url', 'pdf', or 'image'
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { message, type }

  // Form States
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [collection, setCollection] = useState("General");
  const [tags, setTags] = useState("");

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImageFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const validateURL = (string) => {
    try {
      const parsedUrl = new URL(string);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus(null);

    // 1. Validation Logic
    if (mode === "url" && !validateURL(url)) {
      setLoading(false);
      return setStatus({
        message: "Invalid Neural Protocol (Invalid URL)",
        type: "error",
      });
    }

    // 2. Dynamic Loading State & Logic Detection
    const lowUrl = url.toLowerCase();
    let loadingMsg = "Indexing node into vault... 🚀";

    if (lowUrl.includes("youtube.com") || lowUrl.includes("youtu.be")) {
      loadingMsg = "Extracting video knowledge... 🧠";
    } else if (lowUrl.includes("twitter.com") || lowUrl.includes("x.com")) {
      loadingMsg = "Capturing X post insight... 🐦";
    } else if (lowUrl.includes("linkedin.com")) {
      loadingMsg = "Syncing professional network node... 💼";
    } else if (
      lowUrl.includes("facebook.com") ||
      lowUrl.includes("instagram.com")
    ) {
      loadingMsg = "Ingesting social fragment... 🌐";
    }

    setStatus({ message: loadingMsg, type: "loading" });

    try {
      if (mode === "url") {
        if (!url) throw new Error("Source URL is required");
        const tagArray = tags ? tags.split(",").map((t) => t.trim()) : [];

        // IMPLEMENTED LOGIC: ONLY YouTube uses saveYoutubeAPI
        if (lowUrl.includes("youtube.com") || lowUrl.includes("youtu.be")) {
          await saveYoutubeAPI({
            url: url,
            collection: collection,
            tags: tagArray,
          });
        } else {
          // LinkedIn, Twitter, Facebook, and others use CreateItem
          await CreateItem(url, tagArray, collection, "");
        }
      } else if (mode === "pdf") {
        if (!file) throw new Error("Please select a PDF document");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("collection", collection);
        formData.append("tags", tags);
        await uploadPdfAPI(formData);
      } else if (mode === "image") {
        if (!imageFile) throw new Error("Please select an image file");
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("collection", collection);
        formData.append("tags", tags);
        await uploadImageAPI(formData);
      }

      setStatus({ message: "Node successfully indexed!", type: "success" });
      setTimeout(() => navigate("/saved"), 1500);
    } catch (err) {
      console.error("Upload Error:", err);
      setStatus({
        message:
          err.response?.data?.message ||
          err.message ||
          "Link connection failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020204] text-white flex items-center justify-center p-4 sm:p-6 selection:bg-indigo-500/30 font-sans overflow-hidden">
      {/* --- Ambient Neural Background --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-teal-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* --- Floating Header --- */}
        <div className="flex items-center justify-between mb-8 px-2">
          <motion.button
            whileHover={{ x: -4, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all backdrop-blur-md"
          >
            <ArrowLeft size={20} />
          </motion.button>

          <div className="text-center">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2 justify-center">
              <Sparkles className="text-indigo-500" size={20} />
              Initialize <span className="text-indigo-500">Node</span>
            </h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mt-1">
              Multi-Source Integration Protocol
            </p>
          </div>

          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.2)]">
            <Zap
              size={22}
              className="fill-indigo-500 text-indigo-500 animate-pulse"
            />
          </div>
        </div>

        {/* --- Main UI Card --- */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

          {/* --- Tab Selector --- */}
          <div className="flex p-1.5 bg-black/40 border border-white/5 rounded-2xl mb-10 relative">
            {["url", "pdf", "image"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setStatus(null);
                }}
                className={`relative z-10 flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                  mode === m
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {m === "url" && <Globe size={14} />}
                {m === "pdf" && <FileUp size={14} />}
                {m === "image" && <ImageIcon size={14} />}
                {m}
                {mode === m && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/40"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* --- Input Form Section --- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {mode === "url" && (
                <div className="group space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Fingerprint size={12} className="text-indigo-500" /> Source
                    Data URI
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Paste YouTube, X, LinkedIn, FB or Web link..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium placeholder:text-slate-700"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors">
                      <Plus size={20} />
                    </div>
                  </div>
                </div>
              )}

              {(mode === "pdf" || mode === "image") && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Cpu size={12} className="text-teal-500" />{" "}
                    {mode === "pdf" ? "Document Processor" : "Vision Ingestion"}
                  </label>
                  <div className="relative group border-2 border-dashed border-white/10 rounded-[2rem] bg-black/20 p-10 transition-all hover:bg-white/[0.02] hover:border-indigo-500/50 text-center cursor-pointer overflow-hidden">
                    <input
                      type="file"
                      accept={mode === "pdf" ? ".pdf" : "image/*"}
                      onChange={
                        mode === "pdf"
                          ? (e) => setFile(e.target.files[0])
                          : handleImageChange
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />

                    {mode === "image" && imagePreview ? (
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="relative h-40 mx-auto rounded-2xl overflow-hidden border border-white/10"
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                          {mode === "pdf" ? (
                            <FileUp
                              size={32}
                              className="text-slate-400 group-hover:text-indigo-400"
                            />
                          ) : (
                            <ImageIcon
                              size={32}
                              className="text-slate-400 group-hover:text-indigo-400"
                            />
                          )}
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                          {mode === "pdf"
                            ? file
                              ? file.name
                              : "Transmit PDF Node"
                            : imageFile
                              ? imageFile.name
                              : "Index Visual Segment"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- Metadata Grid --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Vault Sector (Collection)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Research"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all text-xs font-bold tracking-wider placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Metadata Tags
                  </label>
                  <input
                    type="text"
                    placeholder="ai, react, design..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all text-xs font-bold tracking-wider placeholder:text-slate-700"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* --- Dynamic Status Indicator --- */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-8 p-4 rounded-2xl border flex items-center gap-3 ${
                  status.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : status.type === "error"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                }`}
              >
                {status.type === "loading" && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {status.type === "success" && <CheckCircle2 size={16} />}
                {status.type === "error" && <AlertCircle size={16} />}
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {status.message}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- Submission Button --- */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={loading}
            className={`w-full mt-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
              status?.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-indigo-600 text-white"
            } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : status?.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <>
                <Fingerprint size={18} className="text-indigo-300" />
                Index Node Into Vault
              </>
            )}
          </motion.button>
        </div>

        {/* --- Security Footer --- */}
        <div className="flex justify-center items-center gap-8 mt-8 opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              E2E Neural Encryption
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,1)]" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Deep Synapse Analysis
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateNode;
