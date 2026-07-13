"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Code2, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  { id: "01", title: "Discovery & Architecture", icon: Search },
  { id: "02", title: "UI/UX & Prototyping", icon: PenTool },
  { id: "03", title: "Agile Engineering", icon: Code2 },
  { id: "04", title: "QA & Deployment", icon: ShieldCheck },
  { id: "05", title: "Scaling & Support", icon: TrendingUp }
];

export function ProcessMini() {
  return (
    <section className="py-24 bg-background text-foreground relative overflow-hidden border-t border-border">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            How we <span className="text-primary">build</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            A battle-tested methodology to deliver flawless enterprise software at scale.
          </p>
          <Link href="/process" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#DCDCDC] bg-[#F2F2F2] hover:bg-[#111] hover:text-white hover:border-[#111] transition-all group font-bold">
            View Full Process
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-[#DCDCDC] rounded-3xl p-6 flex flex-col items-start hover:border-[#AAAAAA] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F2F2F2] border border-[#DCDCDC] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#111] transition-all">
                <step.icon className="w-6 h-6 text-[#111] group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs font-mono text-gray-400 mb-2">{step.id}</span>
              <h3 className="font-bold text-lg leading-tight text-[#111]">{step.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
