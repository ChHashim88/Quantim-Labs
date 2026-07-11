"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatarInitials: string;
  avatarBg: string;
  rating: number;
  text: string;
}

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 1,
    name: "Nimra Ali",
    role: "Full Stack Engineer",
    company: "Vercel",
    avatarInitials: "NA",
    avatarBg: "from-blue-600 to-blue-400",
    rating: 5,
    text: "Quantim Labs completely changed my trajectory. The structured daily lessons and lock system kept me disciplined, and the AI agent feedback felt like having a personal mentor 24/7."
  },
  {
    id: 2,
    name: "Sohaib Rasheed",
    role: "Cloud Architect",
    company: "AWS",
    avatarInitials: "SR",
    avatarBg: "from-blue-700 to-blue-500",
    rating: 5,
    text: "Building real-world projects in the browser sandbox and deploying them prepared me for the enterprise stack. I was interview-ready from day one and landed my dream role."
  },
  {
    id: 3,
    name: "Aisha Rahman",
    role: "AI Engineer",
    company: "OpenAI",
    avatarInitials: "AR",
    avatarBg: "from-slate-700 to-blue-600",
    rating: 5,
    text: "The AI agent curriculum and database integration challenges were cutting-edge. It is rare to find an internship program that mirrors actual high-scale production systems so closely."
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-28 relative overflow-hidden bg-background border-t border-border">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Student Success</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            What Our <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Graduates Say</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            See how Quantim Labs graduates bridged the gap between theory and industry execution to land top-tier tech roles.
          </p>
        </div>

        {/* 3-Column Grid of Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS_DATA.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="group relative rounded-3xl p-8 bg-card/45 border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-xl backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 flex flex-col justify-between"
            >
              {/* Card Hover Ambient Light Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.015] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                {/* Five Stars Rating Row */}
                <div className="flex items-center gap-1.5 mb-6">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                  ))}
                </div>

                {/* Testimonial Quote Text */}
                <p className="text-muted-foreground text-[15px] leading-relaxed italic mb-8 relative">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              {/* User Avatar Info Footer */}
              <div className="flex items-center gap-4 border-t border-border/30 pt-6 mt-auto">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.avatarBg} flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-md shadow-black/10`}>
                  {item.avatarInitials}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-base group-hover:text-primary transition-colors duration-200">
                    {item.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {item.role} @ <span className="font-semibold text-foreground/80">{item.company}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
