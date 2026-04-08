// GlobalLoader.jsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalLoader } from "./LoadingContext";
import "../../../App/index.css"; // Import the cleaned CSS here

export const GlobalLoader = () => {
  const { isLoading } = useGlobalLoader();

  // UX: Lock scrolling when loader is active to prevent layout shifting
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="flex flex-col items-center"
          >
            {/* 3D Orbital Loader */}
            <div className="orbital-spinner mb-12">
              <div className="orbital-ring"></div>
              <div className="orbital-ring"></div>
              <div className="orbital-ring"></div>
              <div className="orbital-core"></div>
            </div>

            {/* Futuristic Typography */}
            <div className="text-center space-y-4">
              <h2 className="text-sm md:text-base font-black text-slate-200 uppercase tracking-[0.3em] italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Initializing Your Second Brain...
              </h2>
              <div className="flex items-center justify-center gap-3 opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shadow-[0_0_8px_#6366f1]"></div>
                <p className="text-[10px] md:text-xs font-bold text-indigo-300 uppercase tracking-[0.5em]">
                  Syncing knowledge nodes...
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
