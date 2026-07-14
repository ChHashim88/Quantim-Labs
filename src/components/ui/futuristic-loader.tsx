"use client";

import { motion } from "framer-motion";

export function FuturisticLoader({ text = "Syncing Neural Networks..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 ml-[80px] lg:ml-[240px] flex flex-col items-center justify-center bg-background z-40">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--color-border) 30%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-border) 30%, transparent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

      {/* Loader rings */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 rounded-sm"
          style={{
            width: "192px",
            height: "192px",
            border: "1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)",
            boxShadow: "0 0 20px color-mix(in srgb, var(--color-primary) 15%, transparent)",
          }}
        />

        {/* Middle Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute rounded-sm"
          style={{
            inset: "20%",
            border: "1px solid color-mix(in srgb, var(--color-primary) 60%, transparent)",
            boxShadow: "0 0 15px color-mix(in srgb, var(--color-primary) 20%, transparent)",
          }}
        />

        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute rounded-sm"
          style={{
            inset: "38%",
            border: "1px dashed color-mix(in srgb, var(--color-primary) 80%, transparent)",
          }}
        />

        {/* Center core */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute rounded-sm bg-primary"
          style={{
            inset: "44%",
            boxShadow: "0 0 30px color-mix(in srgb, var(--color-primary) 80%, transparent)",
          }}
        />

        {/* Corner accents */}
        {[
          "top-0 left-0 border-t-2 border-l-2",
          "top-0 right-0 border-t-2 border-r-2",
          "bottom-0 left-0 border-b-2 border-l-2",
          "bottom-0 right-0 border-b-2 border-r-2",
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 border-primary/70 ${cls}`}
          />
        ))}
      </div>

      {/* Text */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-10 flex flex-col items-center gap-3 relative"
      >
        <span className="text-xs font-mono tracking-[0.3em] text-foreground uppercase font-bold">
          {text}
        </span>

        {/* Scanning bar */}
        <div className="h-[1px] w-64 bg-border overflow-hidden relative">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>

        <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
          SYSTEM INITIALIZING...
        </span>
      </motion.div>
    </div>
  );
}
