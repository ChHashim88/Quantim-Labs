"use client";

import { motion } from "framer-motion";
import { Cpu, Target, Smartphone, TrendingUp } from "lucide-react";

const features = [
  {
    title: "AI-First Products",
    description: "Every app is built with cutting-edge AI technology at its core, delivering intelligent and adaptive experiences.",
    icon: Cpu,
  },
  {
    title: "Real-World Solutions",
    description: "Our apps solve actual problems for students, professionals, and creators in their daily work and learning.",
    icon: Target,
  },
  {
    title: "Cross-Platform",
    description: "Available on both Android and iOS, ensuring you can access powerful AI tools on any device.",
    icon: Smartphone,
  },
  {
    title: "Continuous Updates",
    description: "We regularly release new apps and features, constantly expanding our portfolio of AI-powered solutions.",
    icon: TrendingUp,
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-background relative border-b border-border">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-sm font-semibold text-foreground mb-6 tracking-wide"
          >
            Why Choose Us
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6"
          >
            Why <span className="text-primary">Quantim Labz</span> AI
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Discover what makes our AI-powered applications stand out from the rest.
          </motion.p>
        </div>

        <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pb-8 md:pb-0 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="w-[75vw] sm:w-[300px] md:w-auto shrink-0 snap-center bg-white rounded-3xl p-8 border border-border hover:border-[#AAAAAA] hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden"
            >
              {/* Subtle gradient glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-20 h-20 rounded-[20px] bg-secondary group-hover:bg-primary transition-colors duration-500 flex items-center justify-center mb-8 relative z-10 shadow-sm">
                <feature.icon className="w-10 h-10 text-foreground group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 relative z-10">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed relative z-10">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
