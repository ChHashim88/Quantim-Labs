"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, ChevronRight, FileText, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";
import { WeeklySidebar } from "@/components/student/WeeklySidebar";
import { useWeeklyData } from "@/hooks/useWeeklyData";
import { useAttendance } from "@/hooks/useAttendance";

export default function DocumentsPage() {
  const { programs, activeProgramId, setActiveProgramId, activeProgram, loading, hasEnrollments, markComplete } =
    useWeeklyData({ contentType: "DOCUMENT", progressType: "DOCUMENT" });

  const [activeId, setActiveId] = useState<string>("");
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  useAttendance(activeProgramId);

  const activeDocument = activeProgram?.weeks.flatMap(w => w.lessons).find(l => l.id === activeId);
  const activeWeek = activeProgram?.weeks.find(w => w.lessons.some(l => l.id === activeId));

  if (loading) return <FuturisticLoader text="Retrieving Materials..." />;

  if (!hasEnrollments) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="glass-panel border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 glow-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight mb-2 uppercase">NO ACTIVE MATERIALS</h2>
          <p className="max-w-md mx-auto mb-8 text-xs font-mono tracking-widest text-muted-foreground uppercase">
            NO DOCUMENTATION ASSIGNED. PLEASE INITIALIZE AN INTERNSHIP PROGRAM.
          </p>
          <Link href="/student/courses">
            <Button className="rounded-sm px-8 py-6 h-auto text-xs font-mono font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              EXPLORE PROGRAMS
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">DOCUMENTATION</h1>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-primary"></span> ACCESS AND REVIEW SYSTEM DOCUMENTATION — WEEKLY UNLOCK SYSTEM
        </p>
      </header>

      {programs.length > 0 && (
        <div className="flex items-center justify-start w-full relative z-10">
          <div className="relative flex p-1 rounded-sm bg-card border border-border overflow-x-auto no-scrollbar max-w-full">
            {programs.map((program) => {
              const isActive = program.id === activeProgramId;
              return (
                <button
                  key={program.id}
                  onClick={() => { if (program.id !== activeProgramId) setSwitchTargetId(program.id); }}
                  className={`relative px-5 py-2 rounded-sm text-xs font-mono tracking-widest uppercase transition-colors flex items-center justify-center outline-none whitespace-nowrap min-w-fit z-20 ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}
                >
                  {isActive && (
                    <motion.div layoutId="docs-active-pill" className="absolute inset-0 bg-primary rounded-sm shadow-lg shadow-primary/20 z-0" transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    {program.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4">
          <WeeklySidebar weeks={activeProgram?.weeks || []} activeId={activeId} onSelect={setActiveId} />
        </div>

        <div className="lg:col-span-8 flex flex-col min-h-[500px]">
          {activeDocument ? (
            <div className="flex-1 glass-panel corner-accent overflow-hidden flex flex-col relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <FileText className="w-64 h-64 text-primary" />
              </div>

              <div className="p-8 border-b border-border/20 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20 glow-primary">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading tracking-tight uppercase text-foreground">{activeDocument.title}</h2>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-2">
                      {activeWeek?.weekTitle} &bull; REQUIRED_READING
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 relative z-10">
                <div className="max-w-3xl space-y-12">
                  <div>
                    <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2 text-primary border-b border-border/20 pb-4">
                      <span className="w-1 h-1 bg-primary glow-primary"></span> DOCUMENT_CONTENTS
                    </h3>
                    <div
                      className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground prose-p:font-mono prose-p:text-xs prose-p:leading-relaxed prose-headings:font-heading prose-headings:uppercase prose-a:text-primary"
                      dangerouslySetInnerHTML={{ __html: activeDocument.htmlNotes || "No content provided." }}
                    />
                  </div>

                  {activeDocument.documentUrl && (
                    <div className="group relative overflow-hidden rounded-sm border border-primary/20 bg-primary/5 p-1 transition-all hover:border-primary/50">
                      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 bg-background/50 backdrop-blur-md p-6 rounded-sm border border-white/5">
                        <div className="flex items-center gap-5 text-center sm:text-left">
                          <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-primary/10 border border-primary/30 text-primary glow-primary">
                            <FileText className="h-8 w-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-heading font-bold uppercase tracking-tight text-foreground">REMOTE_MATERIAL</h4>
                            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mt-1">PDF_FORMAT &bull; EXTERNAL_SOURCE</p>
                          </div>
                        </div>
                        <a href={activeDocument.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center w-full sm:w-auto rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-[10px] uppercase font-bold tracking-widest glow-primary transition-all duration-300 px-8 py-3">
                          <Download className="w-4 h-4 mr-2" /> DOWNLOAD_PACKAGE
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-border/20 grid-bg relative z-10">
                <div className="flex items-center justify-between max-w-3xl">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">CONFIRM CONSUMPTION OF THIS MATERIAL TO UPDATE PROGRESS.</p>
                  <Button
                    onClick={() => {
                      const isNowComplete = !activeDocument.completed;
                      markComplete(activeDocument.id, activeProgramId, isNowComplete);
                      toast.success(isNowComplete ? "Document marked as read!" : "Document unmarked.");
                    }}
                    className={`rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest px-8 py-6 h-auto transition-all ${
                      activeDocument.completed
                        ? "bg-transparent border border-primary/50 text-primary hover:bg-primary/10 glow-primary"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
                    }`}
                  >
                    {activeDocument.completed ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> VERIFIED_READ</>
                    ) : (
                      <>MARK_AS_VERIFIED <ChevronRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel corner-accent p-12 min-h-[400px]">
              <FileText className="w-16 h-16 text-muted-foreground/30 mb-6" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">SELECT A DOCUMENT FROM THE WEEKLY INDEX TO VIEW DETAILS.</p>
            </div>
          )}
        </div>
      </div>

      <SwitchProgramModal
        isOpen={!!switchTargetId}
        currentProgramName={programs.find(p => p.id === activeProgramId)?.title || ""}
        targetProgramName={programs.find(p => p.id === switchTargetId)?.title || ""}
        onConfirm={() => { if (switchTargetId) setActiveProgramId(switchTargetId); setSwitchTargetId(null); }}
        onCancel={() => setSwitchTargetId(null)}
      />
    </div>
  );
}
