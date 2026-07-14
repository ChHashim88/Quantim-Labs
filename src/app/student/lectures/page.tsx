"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, CheckCircle2, BookOpen, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";
import { WeeklySidebar } from "@/components/student/WeeklySidebar";
import { useWeeklyData } from "@/hooks/useWeeklyData";
import { useAttendance } from "@/hooks/useAttendance";

const formatSeconds = (secs: number): string => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function LecturesPage() {
  const { programs, activeProgramId, setActiveProgramId, activeProgram, loading, hasEnrollments, markComplete } =
    useWeeklyData({ contentType: "VIDEO", progressType: "LESSON" });

  const [activeId, setActiveId] = useState<string>("");
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  useAttendance(activeProgramId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtxClass();
      if (!audioCtxRef.current) audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { }
  };

  const activeLesson = activeProgram?.weeks.flatMap(w => w.lessons).find(l => l.id === activeId);
  const activeWeek = activeProgram?.weeks.find(w => w.lessons.some(l => l.id === activeId));
  const totalSeconds = activeLesson?.durationHours ? Math.round(activeLesson.durationHours * 3600) : 900;

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [activeId, activeProgramId]);

  useEffect(() => {
    if (!activeLesson || !isPlaying || activeLesson.videoUrl) return;

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const nextTime = prev + 1;

        if (nextTime >= totalSeconds / 2 && !activeLesson.completed) {
          markComplete(activeLesson.id, activeProgramId, true);
          playChime();
          toast.success("Lesson complete!");
        }

        if (nextTime >= totalSeconds) {
          setIsPlaying(false);
          clearInterval(timer);
          return totalSeconds;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, activeId, totalSeconds, activeLesson, activeProgramId, markComplete]);

  if (loading) {
    return <FuturisticLoader text="Loading video environment..." />;
  }

  if (!hasEnrollments) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto px-4">
        <div className="glass-panel border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden w-full">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <PlayCircle className="w-64 h-64 text-primary" />
          </div>
          <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 glow-primary">
            <PlayCircle className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight mb-2 uppercase">NO ACTIVE COURSES</h2>
          <p className="max-w-md mx-auto mb-8 text-xs font-mono tracking-widest text-muted-foreground uppercase">
            YOU ARE NOT ENROLLED IN ANY PROGRAMS YET. VISIT THE COURSE DIRECTORY TO INITIALIZE A SYLLABUS.
          </p>
          <Link href="/student/courses">
            <Button className="rounded-sm px-8 py-6 h-auto text-xs font-mono font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              BROWSE_CATALOG
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">LECTURES</h1>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-primary"></span> WATCH COURSE VIDEOS AND TRACK SYLLABUS PROGRESS — WEEKLY UNLOCK SYSTEM
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
                    <motion.div layoutId="lectures-active-pill" className="absolute inset-0 bg-primary rounded-sm shadow-lg shadow-primary/20 z-0" transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />
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
        {/* Weekly Sidebar */}
        <div className="lg:col-span-4">
          <WeeklySidebar
            weeks={activeProgram?.weeks || []}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </div>

        {/* Video Player */}
        <div className="lg:col-span-8 flex flex-col justify-between glass-panel p-8 corner-accent relative min-h-[500px]">
          {activeLesson ? (
            <div className="relative z-10 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border/40 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20 glow-primary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold uppercase text-foreground tracking-tight max-w-[400px] truncate">
                      {activeLesson.title}
                    </h3>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                      {activeWeek?.weekTitle} &bull; VIDEO
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-mono tracking-widest text-primary border border-primary/40 bg-primary/10 py-1.5 px-3 rounded-sm glow-primary uppercase">
                  VIDEO
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                {activeLesson.videoUrl ? (
                  <div className="w-full aspect-video rounded-sm bg-black border border-primary/20 flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_0_30px_rgba(var(--primary),0.05)]">
                    <iframe src={activeLesson.videoUrl.replace("watch?v=", "embed/")} className="w-full h-full absolute inset-0" frameBorder="0" allowFullScreen></iframe>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-sm grid-bg border border-border/40 flex flex-col items-center justify-center relative overflow-hidden group">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="z-10 bg-transparent border-none focus:outline-none transition-all transform hover:scale-105 active:scale-95"
                    >
                      {isPlaying ? (
                        <PauseCircle className="w-20 h-20 text-primary opacity-80 hover:opacity-100 glow-primary" />
                      ) : (
                        <PlayCircle className="w-20 h-20 text-primary opacity-80 hover:opacity-100 glow-primary" />
                      )}
                    </button>
                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-background to-transparent flex flex-col gap-3 z-10 border-t border-primary/10">
                      <div className="flex items-center justify-between text-[10px] text-foreground font-mono tracking-widest uppercase">
                        <span>{formatSeconds(currentTime)} // {activeLesson.durationHours ? Math.round(activeLesson.durationHours * 60) : 15} MINS</span>
                        <span className="text-primary glow-primary">HD_STREAM</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={totalSeconds}
                        value={currentTime}
                        onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                        className="w-full h-1 bg-border accent-primary rounded-sm cursor-pointer appearance-none focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 pt-6 relative z-10">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                    <Clock className="w-4 h-4" />
                    <span>STREAM_DURATION: {activeLesson.durationHours ? Math.round(activeLesson.durationHours * 60) : 15} MINS</span>
                  </div>
                  {activeLesson.completed ? (
                    <div className="flex items-center gap-2 text-primary text-[10px] uppercase tracking-widest font-mono glow-primary">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>MODULE_COMPLETED</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] font-mono tracking-widest uppercase"
                      onClick={() => {
                        markComplete(activeLesson.id, activeProgramId, true);
                        playChime();
                        toast.success("Lesson marked as complete manually!");
                      }}
                    >
                      MARK_COMPLETE
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-muted-foreground font-mono uppercase tracking-widest relative z-10">
              <PlayCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <span>SELECT UNLOCKED NODE IN SYLLABUS GRID TO INITIATE STREAM.</span>
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
