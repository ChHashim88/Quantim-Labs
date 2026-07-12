"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Eye, ArrowRight, MousePointer } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen bg-[#F2F2F2] text-[#111] overflow-hidden flex flex-col">

      {/* ─── Main Content ─── */}
      <div className="relative flex-1 flex flex-col px-8 md:px-16 pt-28 pb-10 max-w-[1400px] mx-auto w-full">

        {/* Top Badge */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#555] mb-5"
        >
          [ Imagine Anything, Build Everything ]
        </motion.p>

        {/* Giant Heading — left col, same weight as reference */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[1.02] tracking-tight w-full md:max-w-[55%] font-heading text-[#111]"
        >
          <span className="md:hidden">
            Introducing<br />
            the future<br />
            of tech<br />
            careers
          </span>
          <span className="hidden md:inline">
            Introducing the future of tech careers
          </span>
        </motion.h1>

        {/* Info Card — floats below headline on left */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 w-fit max-w-[280px] bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-medium text-[#111]">View Services</span>
            <Eye className="w-4 h-4 text-gray-500" />
          </div>
          <div className="px-4 py-3">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              From web apps to AI, unlock software solutions you can trust — built for enterprise scale.
            </p>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex items-center gap-6"
        >
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-[#111] text-white text-sm font-medium rounded-full hover:bg-black transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/programs"
            className="hidden md:flex text-sm text-[#333] hover:text-black transition-colors items-center gap-1 group"
          >
            Here&apos;s How It Works
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* ─── Hero Robot Image ─── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="absolute right-0 top-16 bottom-0 w-[52%] pointer-events-none"
        >
          {/* Watermark text behind image */}
          <div className="absolute bottom-[15%] right-[5%] text-[clamp(4rem,10vw,9rem)] font-black text-[#111]/5 leading-none tracking-tighter select-none font-heading whitespace-nowrap">
            Quantim<br />Labs
          </div>

          <Image
            src="/hh1.png"
            alt="AI Robot"
            fill
            className="object-contain object-right-bottom"
            priority
            sizes="55vw"
          />

        </motion.div>

        {/* ─── Right Side Scroll Dots ─── */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          <span className="text-[10px] font-mono text-gray-400 mb-2">01</span>
          {[true, false, false, false].map((active, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${active ? "w-2.5 h-2.5 bg-[#111]" : "w-1.5 h-1.5 bg-gray-300"
                }`}
            />
          ))}
          <span className="text-[10px] font-mono text-gray-400 mt-2">05</span>
        </div>

        {/* ─── Bottom Bar ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute bottom-6 left-8 right-8 md:left-16 md:right-16 flex items-center justify-between"
        >
          {/* Left: quick teaser */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#111] flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="Quantim Labz"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <p className="text-[11px] text-gray-500 max-w-[200px] leading-snug">
              &ldquo;Quantim Labz — where real skills meet real opportunities.&rdquo;
            </p>
          </div>

          {/* Right: scroll cue removed */}
        </motion.div>
      </div>
    </section>
  );
}
