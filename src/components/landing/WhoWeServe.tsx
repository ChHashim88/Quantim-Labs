"use client";

import { motion } from "framer-motion";
import { Car, Users, Network } from "lucide-react";

const serveItems = [
  {
    title: "Captives & Lenders",
    description: "For captives and lenders, our secure cloud platform streamlines retail and wholesale finance. Originations, servicing and analytics built to support electric, connected and autonomous vehicles.",
    icon: Car,
  },
  {
    title: "OEMs & Dealers",
    description: "We support OEMs and dealers with a future-ready mobility platform. From digital retail to connected journeys, financing, servicing, and EVs, every channel unified, every touchpoint optimized.",
    icon: Users,
  },
  {
    title: "Brokers & Aggregators",
    description: "Empower brokers and aggregators with tools to manage multiple lender workflows, automate documentation and accelerate decisions while ensuring audit readiness and operational efficiency.",
    icon: Network,
  },
];

export function WhoWeServe() {
  return (
    <section className="py-24 bg-background relative border-b border-border">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6 text-black"
          >
            Who we serve
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg leading-relaxed"
          >
            Orchestrating commerce, intelligence and innovation across asset finance, retail and advisory ecosystems.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row group"
        >
          {serveItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex-1 p-10 lg:p-14 flex flex-col items-center text-center hover:bg-[#fafafa] transition-colors duration-300 ${idx !== serveItems.length - 1 ? "border-b md:border-b-0 md:border-r border-border" : ""
                }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 border border-border shadow-sm">
                <item.icon className="w-7 h-7 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm xl:text-base">
                {item.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
