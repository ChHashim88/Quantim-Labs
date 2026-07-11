"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TEXT = "Hi, Welcome to the Future of Learning";

export function TerminalBanner() {
  const [loading, setLoading] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initial loading phase
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1s loading animation
    return () => clearTimeout(timer);
  }, []);

  // Typing effect
  useEffect(() => {
    if (loading) return;

    if (currentIndex < TEXT.length) {
      let nextChar = TEXT[currentIndex];
      const isGlitch = Math.random() < 0.05 && nextChar !== " " && nextChar !== "\n"; // 5% chance to glitch a character
      
      let delay = Math.random() * 40 + 30; // Variable typing speed 30-70ms

      const timeout = setTimeout(() => {
        if (isGlitch) {
          // Temporarily show a glitch char
          const glitchChars = "!@#$%^&*()_+-=[]{}|;':,.<>/?";
          const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
          setDisplayedText((prev) => prev + randomChar);
          
          // Then correct it quickly
          setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1) + nextChar);
            setCurrentIndex((prev) => prev + 1);
          }, Math.random() * 40 + 40); // 40-80ms glitch duration
        } else {
          setDisplayedText((prev) => prev + nextChar);
          setCurrentIndex((prev) => prev + 1);
        }
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, loading]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mx-auto mb-8 flex justify-center items-center h-[30px]"
    >
      {loading ? (
        <div className="font-mono text-sm text-[#60A5FA]/70 animate-pulse">
          Initializing sequence...
        </div>
      ) : (
        <div className="font-mono text-sm sm:text-base md:text-lg text-[#60A5FA] drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] whitespace-nowrap flex items-center">
          {displayedText}
          <span className="inline-block w-[8px] sm:w-[10px] h-[16px] sm:h-[20px] bg-[#60A5FA] ml-[4px] animate-cursor-blink shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
        </div>
      )}
    </motion.div>
  );
}
