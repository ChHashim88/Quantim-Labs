"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import { useState, useEffect } from "react";

interface SwitchProgramModalProps {
  isOpen: boolean;
  currentProgramName: string;
  targetProgramName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SwitchProgramModal({ isOpen, currentProgramName, targetProgramName, onConfirm, onCancel }: SwitchProgramModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsConfirming(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    setIsConfirming(true);
    // Simulate a brief loading state for UX
    setTimeout(() => {
      onConfirm();
    }, 400);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-y-0 right-0 left-[60px] sm:left-[72px] lg:left-[240px] bg-background/80 flex items-center justify-center z-[120] p-3 sm:p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[calc(100vw-80px)] sm:max-w-md relative"
          >
            <Card className="bg-card border-2 border-primary/20 shadow-2xl overflow-hidden relative rounded-2xl">
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-2xl font-bold font-heading">
                  Switch Internship?
                </CardTitle>
                <CardDescription className="text-base mt-4 text-muted-foreground px-4 leading-relaxed">
                  Are you sure you want to move from <strong>{currentProgramName}</strong> to <strong>{targetProgramName}</strong>?
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 mt-6 pb-6 px-6">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-border hover:bg-muted transition-all text-base font-semibold"
                  disabled={isConfirming}
                  onClick={handleCancel}
                >
                  No
                </Button>
                <Button
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all text-base font-bold flex items-center justify-center gap-2"
                  disabled={isConfirming}
                  onClick={handleConfirm}
                >
                  {isConfirming ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Switching
                    </>
                  ) : (
                    "Yes"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
