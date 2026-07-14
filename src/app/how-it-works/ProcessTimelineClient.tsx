"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Code2, Trophy, Rocket } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Enroll & Onboard",
    description: "Join Quantim Labz and get immediate access to your personalized dashboard. Choose your preferred tech stack and internship track.",
    icon: <Rocket className="w-6 h-6" />,
    tagline: "INITIATE_PROTOCOL"
  },
  {
    id: "02",
    title: "Master the Theory",
    description: "Progress through our structured daily modules. Each lesson is carefully crafted to build your foundation before moving to complex concepts.",
    icon: <BookOpen className="w-6 h-6" />,
    tagline: "KNOWLEDGE_ACQUISITION"
  },
  {
    id: "03",
    title: "Build Real Projects",
    description: "Apply your knowledge in our browser-based interactive sandbox. Write code, pass automated tests, and receive AI-driven feedback instantly.",
    icon: <Code2 className="w-6 h-6" />,
    tagline: "PRACTICAL_APPLICATION"
  },
  {
    id: "04",
    title: "Get Certified",
    description: "Upon successful completion of all modules and projects, receive a cryptographically secure, verifiable certificate to showcase to employers.",
    icon: <Trophy className="w-6 h-6" />,
    tagline: "VERIFIED_CREDENTIAL"
  }
];

export function ProcessTimelineClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end 80%"] // Completes before the bottom hits the center
  });
  
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-32 z-10">
      
      <div ref={containerRef} className="max-w-6xl mx-auto space-y-12 md:space-y-24 relative py-8">
        
        {/* Static Vertical Spine Background */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#E5E5E5] hidden md:block -translate-x-1/2" />
        
        {/* Animated Black Scroll Line */}
        <motion.div 
          style={{ scaleY, transformOrigin: "top" }}
          className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#111] hidden md:block -translate-x-1/2 z-0" 
        />

        {steps.map((step, index) => {
          const isEven = index % 2 === 0;
          return (
            <div key={step.id} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-24 group`}>
              
              {/* Center Node */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm items-center justify-center z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#111] group-hover:border-[#111]">
                <span className="font-mono text-xl font-bold text-[#111] group-hover:text-white transition-colors duration-500">
                  {step.id}
                </span>
              </div>

              {/* Content Card */}
              <div className={`w-full md:w-1/2 ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} flex flex-col ${isEven ? 'items-end' : 'items-start'}`}>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm border border-[#E5E5E5] mb-6 text-[#111] group-hover:bg-[#111] group-hover:text-white transition-colors duration-500`}>
                  {step.icon}
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#555] mb-3 block">
                  {step.tagline}
                </span>
                <h3 className="text-3xl font-heading font-extrabold text-[#111] mb-4 tracking-tight">{step.title}</h3>
                <p className="text-base text-[#555] leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </div>

              {/* Visual Placeholder for Balance */}
              <div className="hidden md:block w-full md:w-1/2">
                 <div className="w-full aspect-video rounded-3xl bg-white/50 backdrop-blur-sm border border-[#E5E5E5] relative overflow-hidden group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all duration-500">
                   {/* Decorative subtle element inside */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#F2F2F2] rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                   <div className="absolute inset-0 flex items-center justify-center text-[#E5E5E5] group-hover:text-[#D1D1D1] transition-colors duration-500 group-hover:scale-110 transform">
                     {React.cloneElement(step.icon as React.ReactElement<any>, { className: "w-48 h-48" })}
                   </div>
                   <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#111] text-white flex items-center justify-center font-mono font-bold text-sm">
                        {step.id}
                      </div>
                      <div>
                        <p className="font-bold text-[#111] text-sm">System Process</p>
                        <p className="text-xs text-[#555] font-mono uppercase tracking-widest">{step.title}</p>
                      </div>
                   </div>
                 </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
