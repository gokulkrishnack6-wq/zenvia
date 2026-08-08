import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setLoading(false);
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#090909] text-white"
        >
          {/* Subtle background glow */}
          <div className="absolute w-[300px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Logo Monogram */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="relative flex items-center justify-center w-20 h-20 border border-[#D4AF37]/40 rounded-full bg-black/50 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <span className="font-serif-luxury text-3xl font-light tracking-widest text-[#D4AF37]">
                Z
              </span>
              <div className="absolute inset-0 rounded-full border border-[#D4AF37]/20 animate-ping opacity-25" />
            </div>

            <span className="font-serif-luxury text-3xl tracking-[0.3em] font-light text-white uppercase">
              Z E N V I A
            </span>

            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]/80 font-light">
              "Luxury isn't a product. It's an experience."
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="mt-10 w-48 h-[2px] bg-neutral-900 overflow-hidden rounded-full relative border border-neutral-800">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F4E0A5] to-[#D4AF37] shadow-[0_0_10px_#D4AF37]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          <span className="mt-3 text-[10px] tracking-widest text-neutral-500 uppercase font-mono">
            {progress}% INITIALIZING EXPERIENCE
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
