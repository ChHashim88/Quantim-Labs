"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle2, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";
import { WeeklySidebar } from "@/components/student/WeeklySidebar";
import { useWeeklyData } from "@/hooks/useWeeklyData";
import { useAttendance } from "@/hooks/useAttendance";

export default function QuizzesPage() {
  const { programs, activeProgramId, setActiveProgramId, activeProgram, loading, hasEnrollments, markComplete } =
    useWeeklyData({ contentType: "QUIZ", progressType: "QUIZ" });

  const [activeId, setActiveId] = useState<string>("");
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  useAttendance(activeProgramId);

  const activeQuiz = activeProgram?.weeks.flatMap(w => w.lessons).find(l => l.id === activeId);
  const activeWeek = activeProgram?.weeks.find(w => w.lessons.some(l => l.id === activeId));

  if (loading) return <FuturisticLoader text="Loading Assessment Matrix..." />;

  if (!hasEnrollments) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="glass-panel border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 glow-primary">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight mb-2 uppercase">NO ACTIVE ASSESSMENTS</h2>
          <p className="max-w-md mx-auto mb-8 text-xs font-mono tracking-widest text-muted-foreground uppercase">
            NO QUIZZES SCHEDULED. INITIALIZE A PROGRAM TO ACCESS ASSESSMENTS.
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
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">QUIZZES</h1>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-primary"></span> KNOWLEDGE ASSESSMENTS — WEEKLY UNLOCK SYSTEM
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
                    <motion.div layoutId="quizzes-active-pill" className="absolute inset-0 bg-primary rounded-sm shadow-lg shadow-primary/20 z-0" transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />
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
          {activeQuiz ? (
            <div className="flex-1 glass-panel corner-accent overflow-hidden flex flex-col relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <HelpCircle className="w-64 h-64 text-primary" />
              </div>

              <div className="p-8 border-b border-border/20 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-sm flex items-center justify-center border glow-primary ${activeQuiz.completed ? "bg-primary/20 border-primary/40 text-primary" : "bg-primary/10 border-primary/20 text-primary"}`}>
                    <HelpCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading tracking-tight uppercase text-foreground">{activeQuiz.title}</h2>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-2">
                      {activeWeek?.weekTitle} &bull; KNOWLEDGE_TEST
                    </p>
                  </div>
                </div>
                {activeQuiz.completed && (
                  <div className="text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-sm border border-primary/40 bg-primary/10 text-primary glow-primary flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> PASSED
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 relative z-10 flex flex-col justify-center items-center text-center">
                {activeQuiz.completed ? (
                  <div className="max-w-md w-full space-y-6 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-2 border-primary/50 flex items-center justify-center bg-primary/10 glow-primary">
                      <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl uppercase tracking-widest text-foreground mb-2">ASSESSMENT_CLEARED</h3>
                      <p className="font-mono text-xs text-muted-foreground leading-relaxed uppercase tracking-widest">
                        YOU HAVE SUCCESSFULLY COMPLETED THIS KNOWLEDGE ASSESSMENT. YOUR SCORE HAS BEEN RECORDED IN THE REGISTRY.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md w-full space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-border/40 rounded-sm p-4 bg-background/50 flex flex-col items-center justify-center gap-2">
                        <HelpCircle className="w-5 h-5 text-muted-foreground" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Multiple Choice</span>
                      </div>
                      <div className="border border-border/40 rounded-sm p-4 bg-background/50 flex flex-col items-center justify-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Untimed</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        markComplete(activeQuiz.id, activeProgramId, true);
                        toast.success("Quiz completed and passed!");
                      }}
                      className="w-full h-16 rounded-sm font-mono text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 glow-primary flex items-center justify-center gap-3"
                    >
                      <PlayCircle className="w-5 h-5" /> INITIATE_ASSESSMENT
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel corner-accent p-12 min-h-[400px]">
              <HelpCircle className="w-16 h-16 text-muted-foreground/30 mb-6" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">SELECT A QUIZ FROM THE WEEKLY INDEX TO BEGIN.</p>
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
