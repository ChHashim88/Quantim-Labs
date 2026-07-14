"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, ChevronRight, HelpCircle, Award, Calendar, Layers, ArrowLeft, PlusCircleIcon, ListTodo, FileText, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";

interface EnrolledTrackOverview {
  id: string;
  title: string;
  category: string;
  durationWeeks: number;
  level: string;
  progress: number;
}

export default function CoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrolledTracks, setEnrolledTracks] = useState<EnrolledTrackOverview[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [showEnrollmentCenter, setShowEnrollmentCenter] = useState(false);
  const [showAlreadyEnrolledModal, setShowAlreadyEnrolledModal] = useState(false);

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
      const { data: dbInternships } = await supabase.from('internships').select('*');
      setAvailablePrograms(dbInternships || []);

      if (enrolled.length === 0) {
        setShowEnrollmentCenter(true);
        setLoading(false);
        return;
      }

      const userInternships = (dbInternships || []).filter(i => enrolled.includes(i.id));
      const assembledTracks: EnrolledTrackOverview[] = [];

      for (const i of userInternships) {
        const { data: dbDays } = await supabase.from('days').select('*').eq('internship_id', i.id).order('order_index', { ascending: true });

        let processedLessonsCount = 0;
        let completedDays = 0;

        if (dbDays && dbDays.length > 0) {
          const dayIds = dbDays.map(d => d.id);
          const { data: dbLessons } = await supabase.from('lessons')
            .select('id')
            .in('day_id', dayIds)
            .eq('content_type', 'VIDEO');

          if (dbLessons) {
            processedLessonsCount = dbLessons.length;
            completedDays = dbLessons.filter(l => completed.includes(l.id)).length;
          }
        }

        const progress = processedLessonsCount > 0 ? Math.round((completedDays / processedLessonsCount) * 100) : 0;

        assembledTracks.push({
          id: i.id,
          title: i.title,
          category: i.category || "Development",
          durationWeeks: i.duration_weeks || 12,
          level: i.level || "Intermediate",
          progress
        });
      }

      setEnrolledTracks(assembledTracks);
    } catch (e) {
      console.error("Error loading database details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const enrollInProgram = async (programId: string, programTitle: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login first.");
        return;
      }

      if (enrolledIds.length >= 1) {
        setShowAlreadyEnrolledModal(true);
        return;
      }

      // Check verification
      const { data: vData } = await supabase.from('student_verifications').select('id').eq('student_id', user.id).single();
      if (!vData) {
        toast.error("For enrollment please get verified first.");
        router.push("/student");
        return;
      }

      const { error } = await supabase.from('student_enrollments').insert({
        student_id: user.id,
        internship_id: programId
      });

      if (error && error.code !== '23505') throw error;
      playChime();
      toast.success(`Successfully enrolled in ${programTitle}!`);

      setShowEnrollmentCenter(false);
      await loadData();
    } catch (e) {
      toast.error("Failed to enroll in program.");
    }
  };

  if (loading) {
    return <FuturisticLoader text="Loading course environment..." />;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">
            {showEnrollmentCenter ? "CURRICULUM ENROLLMENT" : "ACTIVE PROGRAMS"}
          </h1>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2">
            <span className="w-1 h-1 bg-primary"></span>
            {showEnrollmentCenter
              ? "SELECT A LEARNING PATH TO INITIALIZE SYSTEM PROTOCOLS."
              : "TRACK YOUR ACTIVE INTERNSHIP PROGRAMS AND OVERALL PROGRESS."}
          </p>
        </div>

        {enrolledIds.length > 0 && (
          <Button
            onClick={() => setShowEnrollmentCenter(!showEnrollmentCenter)}
            className="rounded-sm border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 px-6 py-4 font-mono text-[10px] tracking-widest font-bold uppercase flex items-center gap-2 glow-primary transition-all duration-300"
          >
            {showEnrollmentCenter ? (
              <>
                <ArrowLeft className="w-4 h-4" /> RETURN_TO_DASHBOARD
              </>
            ) : (
              <>
                <PlusCircleIcon className="w-4 h-4" /> INITIALIZE_NEW_PROGRAM
              </>
            )}
          </Button>
        )}
      </header>

      {showEnrollmentCenter ? (
        availablePrograms.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availablePrograms.map((prog) => {
              const isEnrolled = enrolledIds.includes(prog.id);
              return (
                <div key={prog.id} className="glass-panel p-6 corner-accent flex flex-col justify-between group hover:border-primary/50 transition-colors">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="text-[9px] font-mono tracking-widest uppercase bg-primary/10 text-primary border border-primary/30 px-2 py-1 rounded-sm glow-primary">
                        {prog.category || "Development"}
                      </div>
                      <div className="text-[9px] font-mono tracking-widest uppercase border border-border/50 text-muted-foreground px-2 py-1 rounded-sm">
                        {prog.duration_weeks || 12} WEEKS
                      </div>
                    </div>
                    <h3 className="text-xl font-heading font-bold uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{prog.title}</h3>
                    <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase leading-relaxed mb-6">
                      {prog.short_description || "IMMERSIVE LEARNING PATH UTILIZING NEXT.JS, DATABASE STRUCTURES, AND MENTORSHIP GUIDANCE."}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-border/20 font-mono text-[9px] tracking-widest uppercase mb-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Layers className="w-3.5 h-3.5 text-primary glow-primary" />
                        <span>COMPLEXITY_LEVEL: <span className="text-foreground">{prog.level || "Intermediate"}</span></span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[9px] text-muted-foreground grid-bg p-3 rounded-sm border border-border/40">
                        <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3 text-primary glow-primary" /> LECTURES</span>
                        <span className="flex items-center gap-1"><ListTodo className="w-3 h-3 text-primary glow-primary" /> TASKS</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-primary glow-primary" /> ASSIGNMENTS</span>
                        <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-primary glow-primary" /> QUIZZES</span>
                        <span className="flex items-center gap-1"><Award className="w-3 h-3 text-primary glow-primary" /> CERTIFICATES</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/30 pt-4 mt-auto">
                    {isEnrolled ? (
                      <Button
                        onClick={() => {
                          setShowEnrollmentCenter(false);
                        }}
                        className="w-full rounded-sm font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-border/50 bg-transparent text-muted-foreground hover:text-foreground"
                      >
                        <span>SYSTEM_INITIALIZED</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => enrollInProgram(prog.id, prog.title)}
                        className="w-full rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-[10px] uppercase font-bold tracking-widest glow-primary transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <span>INITIALIZE_ENROLLMENT</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center flex flex-col items-center corner-accent max-w-2xl mx-auto">
            <HelpCircle className="w-16 h-16 text-muted-foreground/30 mb-6" />
            <h3 className="text-xl font-heading font-bold uppercase tracking-widest mb-2 text-foreground">NO_PROGRAMS_DETECTED</h3>
            <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              SYSTEM RECORDS INDICATE NO INTERNSHIP PROGRAMS ARE CURRENTLY PUBLISHED IN THE DATABASE.
            </p>
          </div>
        )
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledTracks.map((track) => (
            <div key={track.id} className="glass-panel p-6 corner-accent flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-[9px] font-mono tracking-widest uppercase bg-primary/10 text-primary border border-primary/30 px-2 py-1 rounded-sm glow-primary">
                    {track.category || "Development"}
                  </div>
                  <div className="text-[9px] font-mono tracking-widest uppercase bg-blue-500/10 text-blue-500 border border-blue-500/30 px-2 py-1 rounded-sm">
                    ACTIVE_SYNC
                  </div>
                </div>
                <h3 className="text-xl font-heading font-bold uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">{track.title}</h3>
                <div className="space-y-6 mb-6">
                  <div className="flex flex-wrap gap-2 text-[9px] text-muted-foreground grid-bg p-3 rounded-sm border border-border/40 font-mono uppercase tracking-widest">
                    <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3 text-primary glow-primary" /> LECTURES</span>
                    <span className="flex items-center gap-1"><ListTodo className="w-3 h-3 text-primary glow-primary" /> TASKS</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-primary glow-primary" /> ASSIGNMENTS</span>
                    <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-primary glow-primary" /> QUIZZES</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3 text-primary glow-primary" /> CERTIFICATES</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                      <span>COMPLETION_RATE</span>
                      <span className="text-primary glow-primary">{track.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-border rounded-sm overflow-hidden">
                      <div className="h-full bg-primary rounded-sm glow-primary" style={{ width: `${track.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border/30 pt-4 mt-auto">
                <Button
                  onClick={() => router.push("/student/lectures")}
                  className="w-full rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-[10px] font-bold uppercase tracking-widest shadow-md shadow-primary/15 glow-primary transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>ACCESS_LECTURES</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Already Enrolled Modal */}
      <AnimatePresence>
        {showAlreadyEnrolledModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden glass-panel corner-accent border-amber-500/30"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 glow-primary" />
              <button
                onClick={() => setShowAlreadyEnrolledModal(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-8 pt-10 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-amber-500/10 rounded-sm flex items-center justify-center border border-amber-500/30">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold font-heading uppercase tracking-tighter text-foreground">SYSTEM_CONFLICT_DETECTED</h3>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground leading-relaxed">
                    ACTIVE ENROLLMENT ALREADY EXISTS IN DATABANKS. SIMULTANEOUS PROGRAM EXECUTION IS PROHIBITED TO MAINTAIN OPTIMAL PROCESSING EFFICIENCY.
                  </p>
                </div>
                <div className="flex flex-col w-full gap-3 pt-6 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={() => setShowAlreadyEnrolledModal(false)}
                    className="w-full rounded-sm font-mono text-[10px] uppercase tracking-widest border-border/50 hover:bg-muted/30"
                  >
                    ACKNOWLEDGE_AND_CLOSE
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
