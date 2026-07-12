"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Triangle, Circle, Square, Hexagon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 bg-[#0A0A0A] text-white min-h-[90vh] flex flex-col justify-center font-sans overflow-hidden">
      
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-start text-left lg:pr-12">
            
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/20 mb-8 backdrop-blur-sm"
            >
              <span className="text-xs font-medium text-blue-100 tracking-wide">
                Announcing Quantim Labs Programs
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6 leading-[1.1] text-white font-heading"
            >
              Empower your career <br />
              with our versatile platform
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-neutral-400 max-w-xl mb-10 leading-relaxed font-light"
            >
              Seamlessly integrate advanced skills into your portfolio with our developer-friendly, 
              scalable internship ecosystem. Save time, reduce complexity, and focus on building what matters.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-6"
            >
              <Button 
                asChild
                className="h-12 px-7 rounded-full bg-white text-black hover:bg-neutral-200 font-medium transition-colors"
              >
                <Link href="/login">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Link 
                href="/programs" 
                className="group flex items-center text-neutral-300 hover:text-white transition-colors text-sm font-medium"
              >
                Explore Programs <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: 3D Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end mt-12 lg:mt-0"
          >
            <div className="relative w-full max-w-[600px] aspect-square">
              {/* Fallback glow if image is slow to load */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-full blur-[100px] opacity-50" />
              <Image
                src="/assets/cubes.png"
                alt="3D Metallic Cubes"
                fill
                className="object-contain relative z-10 mix-blend-screen"
                priority
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          </motion.div>
        </div>

        {/* Trusted By Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-32 pt-16 flex flex-col items-center border-t border-white/5"
        >
          <p className="text-xs text-neutral-500 mb-10 font-medium tracking-wide">Trusted by the world&apos;s most innovative companies</p>
          
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-2 text-xl font-bold font-sans tracking-tight"><div className="w-6 h-6 rounded-full border-[3px] border-white/80" /> Linear</div>
             <div className="flex items-center gap-2 text-2xl font-black font-sans tracking-tighter">HubSpot</div>
             <div className="flex items-center gap-2 text-xl font-bold font-sans lowercase"><Triangle className="w-5 h-5 fill-current" /> adidas</div>
             <div className="flex items-center gap-2 text-xl font-bold font-sans"><Square className="w-5 h-5 fill-current text-blue-500" /> Dropbox</div>
             <div className="flex items-center gap-1 text-xl font-bold font-sans tracking-tight text-blue-400"><Circle className="w-5 h-5 fill-current" /> coinbase</div>
             <div className="flex items-center gap-2 text-xl font-bold font-sans"><Hexagon className="w-6 h-6 text-green-500" /> grammarly</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
