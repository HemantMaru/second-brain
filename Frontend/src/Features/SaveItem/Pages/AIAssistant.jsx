import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Sparkles, Bot } from "lucide-react";
// Make sure this path is correct for your project
import { chatWithBrainAPI } from "../services/save.api";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      role: "ai",
      text: "Hello! How can I help you explore your knowledge vault today?",
      id: "initial-msg",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever chatLog or loading changes
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog, loading]);

  // Auto-focus input when chat window opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300); // slightly delayed for animation
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading) return;

    // Add user message to UI immediately
    const userMessage = {
      role: "user",
      text: trimmedMessage,
      id: Date.now().toString(),
    };
    setChatLog((prev) => [...prev, userMessage]);
    setMessage(""); // Clear input right away
    setLoading(true);

    try {
      const res = await chatWithBrainAPI(trimmedMessage);
      if (res && res.answer) {
        setChatLog((prev) => [
          ...prev,
          { role: "ai", text: res.answer, id: (Date.now() + 1).toString() },
        ]);
      } else {
        throw new Error("No answer received");
      }
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Connection error. Please check your neural link and try again.",
          id: (Date.now() + 1).toString(),
        },
      ]);
    } finally {
      setLoading(false);
      // Re-focus input after AI replies
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[5000] flex flex-col items-end pointer-events-none">
      {/* 🔮 ANIMATED CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-[calc(100vw-3rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#09090b]/90 border border-indigo-500/20 rounded-[2.5rem] shadow-[0_0_80px_rgba(79,70,229,0.15)] flex flex-col overflow-hidden backdrop-blur-2xl mb-6 pointer-events-auto relative"
          >
            {/* Subtle animated background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="p-5 sm:p-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                  <Bot size={22} className="text-white" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border border-white/20 rounded-xl rounded-tl-sm pointer-events-none"
                  />
                </div>
                <div>
                  <h3 className="text-white font-black italic uppercase tracking-tighter text-base leading-none">
                    Neuro Assistant
                  </h3>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_#4ade80]" />
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-red-500/80 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all hover:rotate-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar relative z-10">
              <AnimatePresence initial={false}>
                {chatLog.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[85%] p-4 rounded-3xl text-[14px] leading-relaxed whitespace-pre-wrap break-words shadow-lg ${
                        chat.role === "user"
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-[0_10px_20px_rgba(79,70,229,0.3)]"
                          : "bg-white/[0.04] border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-md"
                      }`}
                    >
                      {chat.role === "ai" && chat.id !== "initial-msg" && (
                        <Sparkles
                          size={14}
                          className="absolute -top-1 -left-1 text-indigo-400"
                        />
                      )}
                      {chat.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Animated Typing Indicator */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/[0.04] border border-white/10 text-indigo-400 rounded-3xl rounded-tl-sm p-4 px-5 flex items-center gap-2 shadow-lg backdrop-blur-md">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          ease: "easeInOut",
                        }}
                        className="w-2 h-2 bg-indigo-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          ease: "easeInOut",
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-indigo-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          ease: "easeInOut",
                          delay: 0.4,
                        }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-5 bg-black/40 border-t border-white/5 backdrop-blur-xl relative z-10 shrink-0">
              <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all shadow-inner">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your neural network..."
                  disabled={loading}
                  rows={1}
                  className="flex-1 max-h-32 bg-transparent text-white text-sm outline-none px-4 py-3 resize-none disabled:opacity-50 placeholder:text-slate-500 custom-scrollbar"
                  style={{ minHeight: "44px" }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={loading || !message.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] m-1 shrink-0"
                  aria-label="Send Message"
                >
                  <Send
                    size={18}
                    className={`${message.trim() && !loading ? "translate-x-0.5 -translate-y-0.5" : ""} transition-transform`}
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ FLOATING ACTION BUTTON ✨ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="relative p-5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)] text-white border border-white/20 group pointer-events-auto overflow-hidden"
            aria-label="Open Chat"
          >
            {/* Animated rotating border glow */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-[-50%] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
            />
            <div className="absolute inset-[2px] bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full pointer-events-none" />

            <MessageSquare
              size={26}
              className="relative z-10 group-hover:scale-110 transition-transform"
            />
            <Sparkles
              size={12}
              className="absolute top-3 right-3 text-yellow-300 z-10 animate-pulse"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Global styles specific to this component */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
