"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import confetti from "canvas-confetti";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  onClose: () => void;
}

export function CelebrationModal({ onClose }: Props) {
  useEffect(() => {
    // Trigger confetti explosion
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="bg-card border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <CardContent className="p-12 text-center flex flex-col items-center relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </motion.div>
            
            <h2 className="text-4xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-2">
              Congratulations!
            </h2>
            <p className="text-xl text-muted-foreground font-medium mb-8">
              You are now Verified.
            </p>
            
            <Button onClick={onClose} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 text-lg rounded-xl">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
