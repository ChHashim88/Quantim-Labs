"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, ChevronRight, Upload, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";
import { WeeklySidebar } from "@/components/student/WeeklySidebar";
import { useWeeklyData } from "@/hooks/useWeeklyData";
import { useAttendance } from "@/hooks/useAttendance";

export default function AssignmentsPage() {
  const { programs, activeProgramId, setActiveProgramId, activeProgram, loading, hasEnrollments, markComplete } =
    useWeeklyData({ contentType: "ASSIGNMENT", progressType: "ASSIGNMENT" });

  const [activeId, setActiveId] = useState<string>("");
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  useAttendance(activeProgramId);

  const activeAssignment = activeProgram?.weeks.flatMap(w => w.lessons).find(l => l.id === activeId);
  const activeWeek = activeProgram?.weeks.find(w => w.lessons.some(l => l.id === activeId));

  if (loading) return <FuturisticLoader text="Loading Assignment Data..." />;

  if (!hasEnrollments) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="glass-panel border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 glow-primary">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight mb-2 uppercase">NO ACTIVE ASSIGNMENTS</h2>
          <p className="max-w-md mx-auto mb-8 text-xs font-mono tracking-widest text-muted-foreground uppercase">
            NO ASSIGNMENTS DETECTED. PLEASE INITIALIZE AN INTERNSHIP PROGRAM TO BEGIN.
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
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">ASSIGNMENTS</h1>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-primary"></span> SUBMIT WEEKLY DELIVERABLES — UNLOCKS EVERY 7 DAYS
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
                    <motion.div layoutId="assignments-active-pill" className="absolute inset-0 bg-primary rounded-sm shadow-lg shadow-primary/20 z-0" transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />
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
          {activeAssignment ? (
            <div className="flex-1 glass-panel corner-accent overflow-hidden flex flex-col relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <FileText className="w-64 h-64 text-primary" />
              </div>

              <div className="p-8 border-b border-border/20 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-sm flex items-center justify-center border glow-primary ${activeAssignment.completed ? "bg-primary/20 border-primary/40 text-primary" : "bg-primary/10 border-primary/20 text-primary"}`}>
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading tracking-tight uppercase text-foreground">{activeAssignment.title}</h2>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-2">
                      {activeWeek?.weekTitle} &bull; REQUIRED_SUBMISSION
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-sm border border-border/40 bg-background/50">
                  STATUS: {activeAssignment.completed ? <span className="text-primary glow-primary">SUBMITTED</span> : <span className="text-muted-foreground">PENDING</span>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 relative z-10">
                <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2 text-primary border-b border-border/20 pb-4">
                  <span className="w-1 h-1 bg-primary glow-primary"></span> ASSIGNMENT_DETAILS
                </h3>
                <div
                  className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground prose-p:font-mono prose-p:text-xs prose-p:leading-relaxed prose-headings:font-heading prose-headings:uppercase prose-a:text-primary mb-12"
                  dangerouslySetInnerHTML={{ __html: activeAssignment.htmlNotes || "<p>No detailed instructions provided.</p>" }}
                />

                {!activeAssignment.completed && (
                  <div className="border border-border/40 rounded-sm p-6 grid-bg bg-background/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary glow-primary"></div>
                    <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground mb-4">SUBMISSION_PORTAL</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">PROJECT_URL (GITHUB/DRIVE/VERCEL)</label>
                        <div className="flex border border-border/40 rounded-sm overflow-hidden focus-within:border-primary/50 transition-colors">
                          <div className="bg-muted/20 px-4 flex items-center justify-center border-r border-border/40">
                            <LinkIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <input type="text" placeholder="https://" className="flex-1 bg-transparent border-none text-xs font-mono p-3 focus:outline-none" />
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          markComplete(activeAssignment.id, activeProgramId, true);
                          toast.success("Assignment submitted successfully!");
                        }}
                        className="w-full rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12"
                      >
                        <Upload className="w-4 h-4 mr-2" /> TRANSMIT_SUBMISSION
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {activeAssignment.completed && (
                <div className="p-8 border-t border-border/20 grid-bg relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary glow-primary" />
                    <p className="text-[10px] font-mono uppercase tracking-widest text-primary">SUBMISSION_RECEIVED_AND_VERIFIED</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      markComplete(activeAssignment.id, activeProgramId, false);
                      toast.success("Submission recalled.");
                    }}
                    className="rounded-sm font-mono text-[9px] uppercase tracking-widest hover:text-destructive hover:border-destructive/50 h-8"
                  >
                    RECALL_SUBMISSION
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel corner-accent p-12 min-h-[400px]">
              <FileText className="w-16 h-16 text-muted-foreground/30 mb-6" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">SELECT AN ASSIGNMENT FROM THE WEEKLY INDEX TO VIEW DETAILS.</p>
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
