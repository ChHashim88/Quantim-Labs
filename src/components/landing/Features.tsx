"use client";

import { motion } from "framer-motion";
import { Lock, BookOpen, BarChart3, Award, Users, PlayCircle } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Video Lock System",
    description: "Ensure 100% completion with our strict video tracking. Lessons remain locked until the previous one is fully watched.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "Intelligent Analytics",
    description: "Track daily progress, weekly milestones, and overall completion percentage on a modern dashboard.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: PlayCircle,
    title: "Structured Daily Learning",
    description: "Organized into modules, weeks, and days. A clean, focused path prevents cognitive overload and keeps you on track.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    description: "Get feedback on assignments and discuss lessons directly with industry professionals and mentors.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description: "Earn QR-verifiable certificates upon 100% completion and passing final assessments.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BookOpen,
    title: "Rich Course Materials",
    description: "Access a variety of formats including videos, PDFs, code files, HTML notes, and external resources.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#EBEBEB]">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Everything you need to <span className="text-primary">succeed</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Quantim Labz isn't just an LMS. It's a comprehensive ecosystem designed to guarantee learning outcomes and prepare you for the industry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative group rounded-2xl p-8 bg-white border border-[#DCDCDC] hover:border-[#AAAAAA] hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className={`w-14 h-14 rounded-xl bg-[#F2F2F2] border border-[#DCDCDC] flex items-center justify-center mb-6`}>
                <feature.icon className="w-7 h-7 text-[#111]" />
              </div>
              
              <h3 className="text-lg font-bold text-[#111] mb-3">{feature.title}</h3>
              <p className="text-[#666] leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
