import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, Loader2 } from "lucide-react";
import { chatWithBrainAPI } from "../services/save.api";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      role: "ai",
      text: "Hello! How can I help you explore your knowledge vault today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Auto-scroll logic for better mobile/desktop UX
  const chatEndRef = useRef(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog, loading]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", text: message };
    setChatLog((prev) => [...prev, userMessage]);
    setLoading(true);
    const currentMessage = message;
    setMessage("");

    try {
      const res = await chatWithBrainAPI(currentMessage);
      if (res && res.answer) {
        setChatLog((prev) => [...prev, { role: "ai", text: res.answer }]);
      }
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Connection error. Please check your server or internet connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-10 sm:right-10 z-[1000]">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 sm:p-5 bg-indigo-600 rounded-full shadow-2xl hover:scale-110 transition-all text-white animate-bounce border border-white/10"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-96 h-[500px] max-h-[80vh] bg-[#0d0d12] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl transition-all animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-white font-black italic flex items-center gap-2 uppercase tracking-tighter text-sm sm:text-base">
              <Bot size={20} className="text-indigo-500" /> NEURO ASSISTANT
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            {chatLog.map((chat, i) => (
              <div
                key={i}
                className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 px-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    chat.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white/5 text-gray-300 border border-white/5 rounded-tl-none"
                  }`}
                >
                  {chat.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-indigo-500 text-[10px] font-black uppercase tracking-widest pl-1">
                <Loader2 size={12} className="animate-spin" />
                AI is synthesizing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2 items-center">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask anything..."
              className="flex-1 bg-white/5 border border-white/5 rounded-xl text-white text-xs outline-none px-4 py-3 focus:border-indigo-500/50 transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !message.trim()}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
