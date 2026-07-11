"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const programs = [
  {
    id: 1,
    title: "Full Stack Development",
    description: "Master React, Next.js, Node.js, and PostgreSQL to build scalable web applications from scratch.",
    image: "/assets/quantum_core.png"
  },
  {
    id: 2,
    title: "Data Science & AI",
    description: "Learn Python, machine learning algorithms, and neural networks to extract insights from data.",
    image: "/assets/data_nodes.png"
  },
  {
    id: 3,
    title: "Cloud Architecture",
    description: "Design and deploy highly available enterprise systems on AWS and Google Cloud.",
    image: "/assets/robot_hand.png"
  },
];

export function Programs() {
  return (
    <section id="programs" className="py-24 relative bg-card/50 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Featured <span className="text-primary">Programs</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose from our industry-vetted internship programs designed to accelerate your tech career.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((program, idx) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group rounded-3xl bg-background border border-border hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden flex flex-col h-full"
            >
              {/* AI Image Banner without heavy fade */}
              <div className="h-48 w-full relative overflow-hidden border-b border-border shadow-inner">
                <img 
                  src={program.image} 
                  alt={program.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              
              {/* Card Content without negative margin */}
              <div className="p-8 flex flex-col flex-1 relative z-10">
                <h3 className="text-2xl font-bold mb-3">{program.title}</h3>
                <p className="text-muted-foreground mb-8 flex-1">
                  {program.description}
                </p>

                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                  View Details <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="rounded-full px-8">
            View All Programs
          </Button>
        </div>
      </div>
    </section>
  );
}
