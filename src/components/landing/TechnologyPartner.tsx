"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export function TechnologyPartner() {
  return (
    <section className="py-24 bg-background relative border-b border-border overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Side: Image with Floating Card */}
          <div className="w-full lg:w-5/12 relative">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative rounded-[2rem] overflow-hidden aspect-[4/5] md:aspect-square lg:aspect-[4/5] bg-background border border-border shadow-sm"
            >
              <img 
                src="/rot.png" 
                alt="Technology Partner" 
                className="w-full h-full object-contain animate-[spin_20s_linear_infinite]"
              />
              
              {/* Floating Stat Card to mimic reference's floating dashboard element */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="hidden md:flex absolute bottom-8 left-0 right-0 mx-auto w-[85%] bg-white/95 backdrop-blur-md border border-border rounded-2xl p-6 shadow-2xl items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Performance</p>
                    <p className="text-3xl font-black text-foreground tracking-tight">120 <span className="text-sm font-semibold text-muted-foreground">TB/s</span></p>
                  </div>
                </div>
                {/* Circular progress mimic */}
                <div className="w-14 h-14 rounded-full border-[4px] border-primary/20 border-t-primary animate-[spin_3s_linear_infinite]" />
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side: Content & Stats */}
          <div className="w-full lg:w-7/12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-heading font-bold mb-8 text-black leading-[1.15]"
            >
              Technology partner to the world&apos;s leading brands
            </motion.h2>

            <div className="space-y-6 text-muted-foreground text-[17px] leading-relaxed mb-12">
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <strong className="text-foreground font-bold">Quantim Labz</strong> builds AI-enabled ecosystems that make finance, commerce, retail and servicing seamless for OEMs, captives, banks, independent finance companies, dealers and fleets, empowering consumers to buy, fund, use, service and renew assets with trust and transparency.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                With over 40 years of experience and operations in more than 40 countries, we deliver secure, composable platforms that integrate seamlessly with partner systems, simplify the entire asset lifecycle and deliver operational efficiency at scale.
              </motion.p>
            </div>

            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
            >
              {[
                { value: "200+", label: "Customers worldwide" },
                { value: "300+", label: "Successful implementations" },
                { value: "$500B+", label: "Assets managed globally" },
                { value: "25+", label: "Years of excellence" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 text-center border border-border hover:border-[#AAAAAA] hover:shadow-md transition-all duration-300">
                  <h4 className="text-2xl md:text-3xl font-black text-foreground mb-2">{stat.value}</h4>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wide leading-tight">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            <div className="space-y-6 text-muted-foreground text-[17px] leading-relaxed">
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                As business models, channels and technologies evolve, our commitment stays constant: human-centered experiences, responsible AI and measurable outcomes.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
                Beyond software, we work as a strategic partner, offering deep domain expertise, implementation support and process optimization to help our clients modernize with confidence.
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
