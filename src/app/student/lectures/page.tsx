"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, CheckCircle2, BookOpen, Clock, ExternalLink } from "lucide-react";
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
    useWeeklyData({ contentType: "VIDEO", progressType: "VIDEO" });

  const [activeId, setActiveId] = useState<string>("");
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  const videoPlayerRef = useRef<HTMLDivElement>(null);

  const handleSelectLesson = (lessonId: string) => {
    setActiveId(lessonId);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
    if (activeProgram) {
      const unlockedLessons = activeProgram.weeks.filter(w => w.isUnlocked).flatMap(w => w.lessons);
      const exists = unlockedLessons.some(l => l.id === activeId);
      if ((!activeId || !exists) && unlockedLessons.length > 0) {
        setActiveId(unlockedLessons[0].id);
      }
    }
  }, [activeProgram, activeId]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [activeId, activeProgramId]);

  const getDaysRemaining = (unlocksAt: Date | null) => {
    if (!unlocksAt) return 0;
    const now = new Date();
    const diffTime = unlocksAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const nextLockedWeek = activeProgram?.weeks.find(w => !w.isUnlocked && w.unlocksAt);
  const daysLeft = nextLockedWeek ? getDaysRemaining(nextLockedWeek.unlocksAt) : null;

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
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto w-full overflow-x-hidden">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 max-w-full overflow-hidden">
        <div className="max-w-full overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 max-w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">LECTURES</h1>
            {nextLockedWeek && daysLeft !== null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-sm border border-primary/40 bg-primary/10 text-primary text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase glow-primary truncate max-w-full">
                <Clock className="w-3.5 h-3.5 animate-pulse shrink-0" />
                <span>W{nextLockedWeek.weekNumber} UNLOCKS IN {daysLeft} {daysLeft === 1 ? 'DAY' : 'DAYS'}</span>
              </span>
            )}
          </div>
          <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2 max-w-full overflow-hidden break-words">
            <span className="w-1 h-1 bg-primary shrink-0"></span> WATCH COURSE VIDEOS AND TRACK SYLLABUS PROGRESS — WEEKLY UNLOCK SYSTEM
          </p>
        </div>
      </header>

      {programs.length > 0 && (
        <div className="flex items-center justify-start w-full relative z-10 max-w-full overflow-hidden">
          <div className="relative flex p-1 rounded-sm bg-card border border-border overflow-x-auto no-scrollbar max-w-full">
            {programs.map((program) => {
              const isActive = program.id === activeProgramId;
              return (
                <button
                  key={program.id}
                  onClick={() => { if (program.id !== activeProgramId) setSwitchTargetId(program.id); }}
                  className={`relative px-4 sm:px-5 py-2 rounded-sm text-xs font-mono tracking-widest uppercase transition-colors flex items-center justify-center outline-none whitespace-nowrap min-w-fit z-20 ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full max-w-full overflow-hidden">
        {/* Weekly Sidebar */}
        <div className="lg:col-span-4 max-w-full overflow-hidden order-2 lg:order-1">
          <WeeklySidebar
            weeks={activeProgram?.weeks || []}
            activeId={activeId}
            onSelect={handleSelectLesson}
          />
        </div>

        {/* Video Player */}
        <div ref={videoPlayerRef} className="lg:col-span-8 flex flex-col justify-between glass-panel px-2 py-3.5 sm:p-8 corner-accent relative min-h-0 sm:min-h-[450px] max-w-full overflow-hidden order-1 lg:order-2">
          {activeLesson ? (
            <div className="relative z-10 flex-1 flex flex-col justify-between max-w-full overflow-hidden">
              <div className="flex flex-wrap items-center justify-between border-b border-border/40 pb-3 sm:pb-6 mb-4 sm:mb-8 gap-2 sm:gap-3 max-w-full overflow-hidden px-1 sm:px-0">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20 glow-primary shrink-0">
                    <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <h3 className="text-base sm:text-2xl font-heading font-bold uppercase text-foreground tracking-tight max-w-[180px] xs:max-w-[260px] sm:max-w-[400px] truncate">
                      {activeLesson.title}
                    </h3>
                    <p className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5 sm:mt-1 truncate">
                      {activeWeek?.weekTitle} &bull; VIDEO
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {activeLesson.videoUrl && (
                    <a
                      href={activeLesson.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-mono tracking-widest text-primary border border-primary/40 bg-primary/10 hover:bg-primary/20 py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-sm glow-primary uppercase transition-all"
                      title="Open Stream in Fullscreen Window"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>FULLSCREEN</span>
                    </a>
                  )}
                  <div className="text-[8px] sm:text-[10px] font-mono tracking-widest text-primary border border-primary/40 bg-primary/10 py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-sm glow-primary uppercase">
                    VIDEO
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between max-w-full">
                {activeLesson.videoUrl ? (
                  <div className="relative w-full min-h-[260px] xs:min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] aspect-video rounded-sm bg-black border border-primary/20 overflow-hidden shadow-lg">
                    <iframe 
                      src={(() => {
                        let url = activeLesson.videoUrl || "";
                        if (url.includes("drive.google.com")) {
                          const driveIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                          if (driveIdMatch && driveIdMatch[1]) {
                            return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
                          }
                          return url.replace(/\/view.*$/, "/preview");
                        } else if (url.includes("youtube.com/watch?v=")) {
                          const vId = url.split("watch?v=")[1]?.split("&")[0];
                          return `https://www.youtube.com/embed/${vId}?rel=0`;
                        } else if (url.includes("youtu.be/")) {
                          const vId = url.split("youtu.be/")[1]?.split("?")[0];
                          return `https://www.youtube.com/embed/${vId}?rel=0`;
                        }
                        return url;
                      })()} 
                      className="w-full h-full absolute inset-0 border-0 block" 
                      style={{ width: "100%", height: "100%", border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="relative w-full min-h-[260px] xs:min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] aspect-video rounded-sm grid-bg border border-border/40 flex flex-col items-center justify-center overflow-hidden p-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="z-10 bg-primary/10 border border-primary/30 p-3 sm:p-4 rounded-full focus:outline-none transition-all transform hover:scale-105 active:scale-95 glow-primary"
                    >
                      {isPlaying ? (
                        <PauseCircle className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
                      ) : (
                        <PlayCircle className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
                      )}
                    </button>
                    <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-background via-background/80 to-transparent flex flex-col gap-2 z-10 border-t border-primary/10">
                      <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-foreground font-mono tracking-widest uppercase">
                        <span>{formatSeconds(currentTime)} / {activeLesson.durationHours ? Math.round(activeLesson.durationHours * 60) : 15} MINS</span>
                        <span className="text-primary glow-primary font-bold">HD_STREAM</span>
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

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-t border-border/40 pt-4 sm:pt-6 relative z-10 max-w-full overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground font-mono truncate max-w-full">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">STREAM_DURATION: {activeLesson.durationHours ? Math.round(activeLesson.durationHours * 60) : 15} MINS</span>
                  </div>
                  {activeLesson.completed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-primary border-primary/40 bg-primary/10 glow-primary shrink-0 hover:bg-primary/20 transition-all"
                      onClick={() => {
                        markComplete(activeLesson.id, activeProgramId, false);
                        toast.info("Lesson marked as incomplete.");
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      <span>MODULE_COMPLETED</span>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase w-full sm:w-auto hover:border-primary/50 hover:text-primary transition-all"
                      onClick={() => {
                        markComplete(activeLesson.id, activeProgramId, true);
                        playChime();
                        toast.success("Lesson marked as complete!");
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
