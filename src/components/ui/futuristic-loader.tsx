"use client";

import { motion } from "framer-motion";

export function FuturisticLoader({ text = "Syncing Neural Networks..." }: { text?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center relative w-full overflow-hidden">
      {/* Background glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t border-r border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
          style={{ width: "128px", height: "128px" }}
        />
        
        {/* Middle Ring (Reverse spin) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute inset-[15%] rounded-full border-b border-l border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        />

        {/* Inner Ring (Fast spin) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-[30%] rounded-full border-t border-emerald-400 border-dashed"
        />
        
        {/* Center glowing core */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-[42%] bg-primary rounded-full shadow-[0_0_20px_var(--primary)]"
        />
      </div>

      {/* Typing Text Effect */}
      <div className="mt-8 relative overflow-hidden">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-sm font-mono tracking-widest text-primary uppercase font-semibold">
            {text}
          </span>
          {/* Scanning line underneath text */}
          <div className="h-[2px] w-full bg-muted overflow-hidden relative mt-2 rounded-full">
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
