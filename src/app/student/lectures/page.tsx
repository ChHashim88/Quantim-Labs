"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, CheckCircle2, Lock, BookOpen, Clock, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { motion, AnimatePresence } from "framer-motion";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";
import { useAttendance } from "@/hooks/useAttendance";

interface SyllabusDay {
  dayNumber: number;
  title: string;
  type: "Video" | "Assignment" | "Quiz" | "Mentor_Session";
  duration: string;
  completed: boolean;
  locked: boolean;
  contentId?: string;
  video_url?: string;
}

interface EnrolledTrack {
  id: string;
  title: string;
  category: string;
  durationWeeks: number;
  level: string;
  progress: number;
  syllabus: SyllabusDay[];
}

const parseDurationToSeconds = (durationStr: string): number => {
  const match = durationStr.match(/(\d+)\s*mins?/);
  return match ? parseInt(match[1]) * 60 : 600;
};

const formatSeconds = (secs: number): string => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function LecturesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrolledTracks, setEnrolledTracks] = useState<EnrolledTrack[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  
  const [activeTrackId, setActiveTrackId] = useState<string>("");
  const [activeLessonId, setActiveLessonId] = useState<string>("");

  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  useAttendance(activeTrackId);

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

  const loadData = async () => {
    if (typeof window === "undefined") return;
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('internship_id')
        .eq('student_id', user.id);
      
      const enrolled = enrollments ? enrollments.map(e => e.internship_id) : [];
      setEnrolledIds(enrolled);

      const { data: progressData } = await supabase
        .from('student_progress')
        .select('content_id')
        .eq('student_id', user.id)
        .eq('content_type', 'LESSON');
      
      const completed = progressData ? progressData.map(p => p.content_id) : [];

      if (enrolled.length === 0) {
        setLoading(false);
        return;
      }

      const { data: dbInternships } = await supabase.from('internships').select('*');
      const userInternships = (dbInternships || []).filter(i => enrolled.includes(i.id));

      const assembledTracks: EnrolledTrack[] = [];

      for (const i of userInternships) {
        const { data: dbDays } = await supabase.from('days').select('*').eq('internship_id', i.id).order('order_index', { ascending: true });

        let processedLessons: SyllabusDay[] = [];

        if (dbDays && dbDays.length > 0) {
          const dayIds = dbDays.map(d => d.id);
          const { data: dbLessons } = await supabase.from('lessons')
            .select('*')
            .in('day_id', dayIds)
            .eq('content_type', 'VIDEO')
            .order('created_at', { ascending: true });

          if (dbLessons) {
            dbDays.forEach((day, index) => {
              const dayLessons = dbLessons.filter(l => l.day_id === day.id);
              dayLessons.forEach(l => {
                const isCompleted = completed.includes(l.id);
                processedLessons.push({
                  contentId: l.id,
                  dayNumber: index + 1,
                  title: l.title,
                  type: 'Video',
                  duration: l.duration_hours ? `${Math.round(l.duration_hours * 60)} mins` : '15 mins',
                  completed: isCompleted,
                  locked: false,
                  ...l
                } as any);
              });
            });
          }
        }

        processedLessons = processedLessons.map((lesson, idx) => {
          if (idx === 0) return { ...lesson, locked: false };
          const prevCompleted = processedLessons[idx - 1].completed;
          return { ...lesson, locked: !prevCompleted };
        });

        const completedDays = processedLessons.filter(d => d.completed).length;
        const progress = processedLessons.length > 0 ? Math.round((completedDays / processedLessons.length) * 100) : 0;

        assembledTracks.push({
          id: i.id,
          title: i.title,
          category: i.category || "Development",
          durationWeeks: i.duration_weeks || 12,
          level: i.level || "Intermediate",
          progress,
          syllabus: processedLessons
        });
      }

      setEnrolledTracks(assembledTracks);

      if (assembledTracks.length > 0) {
        if (!activeTrackId || !enrolled.includes(activeTrackId)) {
          setActiveTrackId(assembledTracks[0].id);
          const firstUnlocked = assembledTracks[0].syllabus.find(d => !d.locked);
          setActiveLessonId(firstUnlocked?.contentId || "");
        }
      }
    } catch (e) {
      console.error("Error loading database details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeTrack = enrolledTracks.find(t => t.id === activeTrackId);
  const activeLesson = activeTrack?.syllabus.find(d => d.contentId === activeLessonId);
  const totalSeconds = activeLesson ? parseDurationToSeconds(activeLesson.duration) : 600;

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [activeLessonId, activeTrackId]);

  useEffect(() => {
    if (!activeLesson || activeLesson.type === "Assignment" || activeLesson.type === "Quiz") return;

    // Start timer if it's a real video URL (iframe) or if the placeholder player is playing
    if (!isPlaying && !activeLesson.video_url) return;

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const nextTime = prev + 1;
        
        // Auto-complete at 50% of the video duration
        if (nextTime >= totalSeconds / 2 && !activeLesson.completed) {
          handleCompleteLesson(activeLessonId, true);
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
  }, [isPlaying, activeLessonId, totalSeconds, activeLesson, activeTrackId]);

  const handleCompleteLesson = async (lessonId: string, autoFinished = false) => {
    if (!activeTrackId) return;

    const track = enrolledTracks.find(t => t.id === activeTrackId);
    const lesson = track?.syllabus.find(l => l.contentId === lessonId);
    const wasCompleted = lesson?.completed || false;
    let isNowCompleted = autoFinished ? true : !wasCompleted;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isNowCompleted) {
      if (!wasCompleted) {
        await supabase.from('student_progress').insert({ student_id: user.id, content_type: 'LESSON', content_id: lessonId });
        playChime();
        toast.success(`Lesson complete!`);
      }
    } else {
      await supabase.from('student_progress').delete()
        .eq('student_id', user.id)
        .eq('content_type', 'LESSON')
        .eq('content_id', lessonId);
    }

    setEnrolledTracks(prevTracks => {
      return prevTracks.map(track => {
        if (track.id !== activeTrackId) return track;

        let processedLessons = track.syllabus.map(lesson => {
          if (lesson.contentId === lessonId) {
            return { ...lesson, completed: isNowCompleted };
          }
          return lesson;
        });

        processedLessons = processedLessons.map((lesson, idx) => {
          if (idx === 0) return { ...lesson, locked: false };
          const prevCompleted = processedLessons[idx - 1].completed;
          return { ...lesson, locked: !prevCompleted };
        });

        const completedDays = processedLessons.filter(d => d.completed).length;
        const progress = processedLessons.length > 0 ? Math.round((completedDays / processedLessons.length) * 100) : 0;

        return { ...track, progress, syllabus: processedLessons };
      });
    });
  };

  if (loading) {
    return <FuturisticLoader text="Loading video environment..." />;
  }

  if (enrolledIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <PlayCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Active Courses</h2>
        <p className="text-muted-foreground max-w-md">You are not enrolled in any programs yet. Visit the My Courses page to enroll and start watching lectures.</p>
        <Button className="mt-6 rounded-xl" onClick={() => router.push("/student/courses")}>Browse Courses</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-4xl font-heading font-extrabold tracking-tight">Lectures</h1>
        <p className="text-muted-foreground mt-2">
          Watch course videos, learn core concepts, and track your syllabus progress.
        </p>
      </header>

      {/* Glassmorphic Animated Dock */}
      <div className="flex items-center justify-start mb-10 w-full relative z-10">
        <div className="relative flex p-1.5 rounded-full bg-background/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-x-auto no-scrollbar max-w-full">
          {enrolledTracks.map((program) => {
            const isActive = program.id === activeTrackId;
            return (
              <button
                key={program.id}
                onClick={() => {
                  if (program.id !== activeTrackId) {
                    setSwitchTargetId(program.id);
                  }
                }}
                className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center outline-none whitespace-nowrap min-w-fit z-20 ${isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="lectures-active-program-pill"
                    className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-500 rounded-full shadow-lg shadow-primary/25 z-0"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
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

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Syllabus Grid */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-border shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Syllabus Grid</CardTitle>
              <CardDescription>1-Week Day-by-Day Division</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeTrack?.syllabus.map((lesson) => {
                const isSelected = lesson.contentId === activeLessonId;
                return (
                  <div
                    key={lesson.contentId}
                    onClick={() => {
                      if (!lesson.locked) setActiveLessonId(lesson.contentId!);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all ${lesson.locked
                      ? "opacity-45 bg-slate-950/20 border-border/10 cursor-not-allowed"
                      : isSelected
                        ? "border-primary/50 bg-primary/10 text-foreground cursor-pointer"
                        : "border-border/40 bg-background/40 hover:bg-muted/30 cursor-pointer"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!lesson.locked) handleCompleteLesson(lesson.contentId!);
                        }}
                        className="cursor-pointer"
                      >
                        {lesson.completed ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-primary fill-primary/15" />
                        ) : lesson.locked ? (
                          <Lock className="w-4.5 h-4.5 text-muted-foreground" />
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border border-primary/50 hover:bg-primary/10 flex items-center justify-center font-bold text-[9px] text-primary select-none">
                            D{lesson.dayNumber}
                          </div>
                        )}
                      </span>
                      <div className="overflow-hidden">
                        <span className="font-semibold text-foreground/90 block truncate max-w-[170px]">
                          {lesson.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                          Day {lesson.dayNumber} &bull; {lesson.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                      {lesson.duration}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Player */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm shadow-xl min-h-[500px]">
          {activeLesson ? (
            <>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground truncate max-w-[400px]">
                        Day {activeLesson.dayNumber}: {activeLesson.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{activeTrack?.title}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-wider text-[10px]">
                    {activeLesson.type.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  {activeLesson.video_url ? (
                    <div className="w-full aspect-video rounded-2xl bg-slate-950 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                      <iframe src={activeLesson.video_url.replace("watch?v=", "embed/")} className="w-full h-full absolute inset-0" frameBorder="0" allowFullScreen></iframe>
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-2xl bg-slate-950 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent)]" />
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="z-10 bg-transparent border-none focus:outline-none transition-all transform hover:scale-105 active:scale-95"
                      >
                        {isPlaying ? (
                          <PauseCircle className="w-20 h-20 text-primary opacity-80 hover:opacity-100 shadow-[0_0_20px_rgba(59,130,246,0.3)] rounded-full" />
                        ) : (
                          <PlayCircle className="w-20 h-20 text-primary opacity-80 hover:opacity-100 shadow-[0_0_20px_rgba(59,130,246,0.3)] rounded-full" />
                        )}
                      </button>
                      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 to-transparent flex flex-col gap-2 z-10">
                        <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                          <span>{formatSeconds(currentTime)} / {activeLesson.duration}</span>
                          <span>1080p HD</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={totalSeconds}
                          value={currentTime}
                          onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 accent-primary rounded-full cursor-pointer appearance-none focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/30 pt-6">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                      <Clock className="w-4 h-4" />
                      <span>Video Duration: {activeLesson.duration}</span>
                    </div>
                    {activeLesson.completed && (
                      <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
              <PlayCircle className="w-12 h-12 text-muted-foreground/50 mb-2" />
              <span>Select an unlocked day in the syllabus grid to start.</span>
            </div>
          )}
        </div>
      </div>

      <SwitchProgramModal
        isOpen={!!switchTargetId}
        currentProgramName={enrolledTracks.find(p => p.id === activeTrackId)?.title || ""}
        targetProgramName={enrolledTracks.find(p => p.id === switchTargetId)?.title || ""}
        onConfirm={() => {
          if (switchTargetId) {
            setActiveTrackId(switchTargetId);
            const targetTrack = enrolledTracks.find(t => t.id === switchTargetId);
            if (targetTrack && targetTrack.syllabus.length > 0) {
              const firstUnlocked = targetTrack.syllabus.find((s) => !s.locked);
              setActiveLessonId(firstUnlocked?.contentId || targetTrack.syllabus[0].contentId || "");
            }
          }
          setSwitchTargetId(null);
        }}
        onCancel={() => setSwitchTargetId(null)}
      />
    </div>
  );
}
