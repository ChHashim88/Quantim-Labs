"use client";

import { motion } from "framer-motion";
import { Search, Filter, Rocket, Calendar, ArrowRight, PlaySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Link from "next/link";

interface ProgramsClientProps {
  initialPrograms: any[];
}

export function ProgramsClient({ initialPrograms }: ProgramsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter programs based on search query
  const filteredPrograms = initialPrograms.filter(program =>
    program.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full border-primary/30 text-primary bg-primary/5">
            Explore Opportunities
          </Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight mb-6">
            All <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Programs</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Discover our industry-vetted internship programs. Whether you're interested in full-stack development, AI, or design, we have a path for you.
          </p>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-12 max-w-4xl mx-auto"
      >
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search programs by title or skills..."
            className="pl-12 h-14 text-base rounded-full border-border bg-card shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button size="lg" variant="outline" className="h-14 rounded-full px-6 gap-2 w-full sm:w-auto bg-card">
          <Filter className="w-5 h-5" /> Filter
        </Button>
      </motion.div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card/50">
          <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No programs found</h3>
          <p className="text-muted-foreground">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program, idx) => {
            // Pick a fallback image based on index to keep it looking cool
            const fallbacks = [
              "/assets/quantum_core.png",
              "/assets/data_nodes.png",
              "/assets/robot_hand.png"
            ];
            const fallbackImage = fallbacks[idx % fallbacks.length];

            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group rounded-3xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full"
              >
                {/* Card Image without fade */}
                <div className="h-48 relative overflow-hidden bg-muted border-b border-border shadow-inner">
                  <img 
                    src={program.thumbnail_url || program.cover_banner_url || fallbackImage} 
                    alt={program.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-none">
                      {program.category || "General"}
                    </Badge>
                    {program.status === 'PUBLISHED' && (
                      <Badge variant="default" className="bg-primary text-primary-foreground border-none shadow-[0_0_10px_rgba(68,255,209,0.5)]">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card Content without negative margin */}
                <div className="p-6 flex flex-col flex-1 relative z-10">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 font-medium bg-background/80 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full border border-border shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{program.duration_weeks || 12} Weeks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PlaySquare className="w-4 h-4 text-accent" />
                      <span>{program.program_type || "ONLINE"}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {program.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-8 flex-1 line-clamp-3">
                    {program.short_description || program.full_description || "An immersive internship program designed to build your skills."}
                  </p>

                  <div className="pt-4 border-t border-border mt-auto">
                    <Link href={`/programs/${program.id}`}>
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-xl h-12 text-base font-semibold border-primary/20 hover:border-primary">
                        View Program Details <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
