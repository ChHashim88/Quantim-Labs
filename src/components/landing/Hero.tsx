"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TerminalBanner } from "./TerminalBanner";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Left decorative image */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%) rotate(3.91deg)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Image
          src="/h2.png"
          alt="Decorative"
          width={316}
          height={316}
          style={{ width: "315.26px", height: "315.26px", opacity: 1 }}
        />
      </motion.div>

      {/* Right decorative image */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%) rotate(-14.52deg)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Image
          src="/h3.png"
          alt="Decorative"
          width={238}
          height={238}
          style={{ width: "237.56px", height: "237.56px", opacity: 1 }}
        />
      </motion.div>
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <TerminalBanner />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight mb-6 max-w-4xl"
        >
          Master Real-World Skills with <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Quantim Labs Programs
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
        >
          Not just an LMS. A complete internship ecosystem where you learn, build, and grow under expert mentorship. Prepare for your career with a premium learning experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <Button size="lg" className="h-14 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full sm:w-auto">
            Apply Internship <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Link href="/programs" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold rounded-full border-border hover:bg-muted w-full bg-transparent">
              Explore Programs
            </Button>
          </Link>
        </motion.div>

        {/* Floating Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl opacity-80"
        >
          {[
            { label: "50+ Mentors", icon: GraduationCap },
            { label: "100% Completion Focus", icon: Sparkles },
            { label: "Enterprise Stack", icon: ArrowRight },
            { label: "Career Ready", icon: Sparkles },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted border border-border ">
              <item.icon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
