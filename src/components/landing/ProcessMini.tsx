"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Code2, ShieldCheck, TrendingUp, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

const steps = [
  { id: "01", title: "Discovery & Arch", desc: "Mapping the digital landscape.", icon: Search },
  { id: "02", title: "UI/UX Prototyping", desc: "Forging the human interface.", icon: PenTool },
  { id: "03", title: "Agile Engineering", desc: "Constructing the core engine.", icon: Code2 },
  { id: "04", title: "QA & Deployment", desc: "Stress-testing protocols.", icon: ShieldCheck },
  { id: "05", title: "Scaling & Support", desc: "Infinite vertical scaling.", icon: TrendingUp }
];

export function ProcessMini() {
  return (
    <section className="py-32 bg-[#F2F2F2] text-[#111] relative overflow-hidden border-t border-[#E5E5E5]">
      {/* Futuristic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px] pointer-events-none opacity-50"></div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <Zap className="w-4 h-4 text-[#111]" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase font-bold text-[#555]">
                Methodology
              </span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight text-[#111] font-heading"
            >
              How we build <br className="hidden md:block"/> the future.
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-start md:items-end gap-6"
          >
            <p className="text-[#555] text-sm md:text-base leading-relaxed max-w-sm md:text-right">
              A battle-tested methodology to deliver flawless enterprise software at scale.
            </p>
            <Link href="/process" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-[#E5E5E5] text-[#111] font-medium hover:bg-[#111] hover:text-white transition-all shadow-sm hover:shadow-xl group">
              View Full Process
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Futuristic Flow Grid */}
        <div className="relative">
          {/* Main Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D1D1D1] to-transparent -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 relative z-10">
            {steps.map((step, idx) => {
              // Create an alternating vertical stagger effect
              const isEven = idx % 2 === 0;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 60 }}
                  className={`
                    relative group
                    ${isEven ? 'lg:-translate-y-8' : 'lg:translate-y-8'}
                  `}
                >
                  {/* Vertical connector line to center */}
                  <div className={`hidden lg:block absolute left-1/2 w-[1px] h-8 bg-[#D1D1D1] group-hover:bg-[#111] transition-colors -translate-x-1/2 ${isEven ? '-bottom-8' : '-top-8'}`}></div>

                  <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:border-[#E5E5E5] transition-all duration-500 h-full flex flex-col items-start relative overflow-hidden">
                    
                    {/* Background abstract shape on hover */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#F2F2F2] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex items-center justify-between w-full mb-12 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-[#F2F2F2] border border-[#E5E5E5] flex items-center justify-center group-hover:bg-[#111] transition-colors duration-500">
                        <step.icon className="w-5 h-5 text-[#111] group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                      </div>
                      <span className="text-3xl font-heading font-black text-[#E5E5E5] group-hover:text-[#111] transition-colors duration-500">
                        {step.id}
                      </span>
                    </div>
                    
                    <div className="relative z-10 flex-1">
                      <h3 className="font-bold text-lg leading-tight text-[#111] mb-2">{step.title}</h3>
                      <p className="text-sm text-[#555] leading-relaxed">{step.desc}</p>
                    </div>
                    
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
