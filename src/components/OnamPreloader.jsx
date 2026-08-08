import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Phone } from "lucide-react";

export default function OnamPreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [showOffer, setShowOffer] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // 1. Animate counter up to 50%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setShowOffer(true);
          
          // 2. Hold poster on screen for 2.5s after hitting 50%, then slide up/disappear
          setTimeout(() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }, 2500);

          return 50;
        }
      });
    }, 40); // Speed of loading counter

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="onam-loader"
          initial={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 overflow-hidden px-4"
        >
          {/* Animated SVG Path (Moving Road/Wave) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M-100,300 C300,700 700,100 1100,800"
              stroke="#78350f"
              strokeWidth="12"
              fill="none"
              initial={{ pathLength: 0, pathOffset: 1 }}
              animate={{ pathLength: 1, pathOffset: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </svg>

          {/* Main Poster Card Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-md w-full bg-amber-50/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center flex flex-col items-center"
          >
            {/* Poster Header */}
            <h1 className="text-4xl font-extrabold text-green-900 font-serif tracking-wide drop-shadow-sm">
              Onam loading...
            </h1>
            <p className="text-amber-800 font-bold text-sm tracking-wider uppercase mb-3">
              from Zudo Cars
            </p>

            {/* Poster Main Image Area */}
            <div className="relative my-2 w-full flex justify-center items-center">
              <motion.img
                src="/images/onam-poster.jpg"
                alt="Zudo Cars Onam Poster"
                className="w-full max-h-72 object-contain rounded-2xl shadow-lg"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* 50% Off Badge */}
              {showOffer && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="absolute -top-3 -right-2 bg-red-600 text-amber-200 font-black text-xl py-2 px-4 rounded-full shadow-2xl border-2 border-yellow-300 transform"
                >
                  50% OFF
                </motion.div>
              )}
            </div>

            {/* Loading Counter & Bar */}
            <div className="w-full my-3">
              <div className="flex justify-between items-center text-xs font-bold text-amber-950 mb-1">
                <span>Loading Homepage...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-amber-200 h-3 rounded-full overflow-hidden border border-amber-400">
                <motion.div
                  className="bg-green-700 h-full rounded-full"
                  style={{ width: `${(progress / 50) * 100}%` }}
                />
              </div>
            </div>

            {/* CTA Button */}
            {showOffer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full mt-2"
              >
                <button className="w-full bg-green-800 hover:bg-green-900 text-yellow-300 font-bold py-3 px-6 rounded-xl shadow-xl border border-yellow-400 flex items-center justify-center space-x-2 transition-transform active:scale-95">
                  <Gift className="w-5 h-5" />
                  <span>Onam Gifts - Book Now</span>
                </button>
                <p className="text-xs font-semibold text-amber-900 mt-2 flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" /> PH: +91 85899 00964 | Kerala
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}