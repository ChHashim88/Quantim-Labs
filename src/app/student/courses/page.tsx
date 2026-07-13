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
          <h1 className="text-4xl font-heading font-extrabold tracking-tight">
            {showEnrollmentCenter ? "Curriculum Enrollment Center" : "My Active Courses"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {showEnrollmentCenter
              ? "Select an available internship program below to begin your path."
              : "Track your active internship programs and overall progress."}
          </p>
        </div>

        {enrolledIds.length > 0 && (
          <Button
            onClick={() => setShowEnrollmentCenter(!showEnrollmentCenter)}
            className="rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 px-5 flex items-center gap-2"
          >
            {showEnrollmentCenter ? (
              <>
                <ArrowLeft className="w-4 h-4" /> Back to My Courses
              </>
            ) : (
              <>
                <PlusCircleIcon className="w-4 h-4" /> Enroll in New Program
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
                <Card key={prog.id} className="bg-card border-border shadow-xl flex flex-col justify-between overflow-hidden relative group hover:border-primary/40 transition-all duration-300">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-blue-400 opacity-60" />
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                        {prog.category || "Development"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {prog.duration_weeks || 12} Weeks
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">{prog.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="text-xs text-muted-foreground leading-relaxed flex-1">
                    {prog.short_description || "Immersive learning path utilizing Next.js, database structures, and mentorship guidance."}

                    <div className="mt-6 space-y-3 pt-4 border-t border-border/20 font-mono text-[10px]">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        <span>Level: <span className="text-foreground font-semibold">{prog.level || "Intermediate"}</span></span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                        <span className="flex items-center gap-1 font-medium text-foreground"><PlayCircle className="w-3.5 h-3.5 text-primary"/> Lectures</span>
                        <span className="flex items-center gap-1 font-medium text-foreground"><ListTodo className="w-3.5 h-3.5 text-primary"/> Tasks</span>
                        <span className="flex items-center gap-1 font-medium text-foreground"><FileText className="w-3.5 h-3.5 text-primary"/> Assignments</span>
                        <span className="flex items-center gap-1 font-medium text-foreground"><HelpCircle className="w-3.5 h-3.5 text-primary"/> Quizzes</span>
                        <span className="flex items-center gap-1 font-medium text-foreground"><Award className="w-3.5 h-3.5 text-primary"/> Certificates</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/30 pt-4 bg-muted/5">
                    {isEnrolled ? (
                      <Button
                        onClick={() => {
                          setShowEnrollmentCenter(false);
                        }}
                        className="w-full rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-2 border border-border"
                      >
                        <span>Currently Enrolled</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => enrollInProgram(prog.id, prog.title)}
                        className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-bold shadow-md shadow-primary/15 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <span>Enroll & Start Learning</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card border-border shadow-xl p-12 text-center flex flex-col items-center">
            <HelpCircle className="w-12 h-12 text-muted-foreground/60 mb-4" />
            <CardTitle className="text-xl font-bold mb-2">No Programs Available</CardTitle>
            <CardDescription className="max-w-md">
              There are currently no internship programs published in the database.
            </CardDescription>
          </Card>
        )
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledTracks.map((track) => (
            <Card key={track.id} className="bg-card border-border shadow-xl flex flex-col justify-between overflow-hidden relative group hover:border-primary/40 transition-all duration-300">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60" />
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    {track.category || "Development"}
                  </Badge>
                  <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
                    Enrolled
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">{track.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground mb-3 bg-muted/30 p-2.5 rounded-lg border border-border/50">
                  <span className="flex items-center gap-1 font-medium text-foreground"><PlayCircle className="w-3 h-3 text-primary"/> Lectures</span>
                  <span className="flex items-center gap-1 font-medium text-foreground"><ListTodo className="w-3 h-3 text-primary"/> Tasks</span>
                  <span className="flex items-center gap-1 font-medium text-foreground"><FileText className="w-3 h-3 text-primary"/> Assignments</span>
                  <span className="flex items-center gap-1 font-medium text-foreground"><HelpCircle className="w-3 h-3 text-primary"/> Quizzes</span>
                  <span className="flex items-center gap-1 font-medium text-foreground"><Award className="w-3 h-3 text-primary"/> Certificates</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>Overall Progress</span>
                    <span>{track.progress}%</span>
                  </div>
                  <Progress value={track.progress} className="h-1.5 bg-muted" />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/30 pt-4 bg-muted/5">
                <Button
                  onClick={() => router.push("/student/lectures")}
                  className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-bold shadow-md shadow-primary/15 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Go to Lectures</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
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
              className="relative w-full max-w-md overflow-hidden bg-card border border-border shadow-2xl rounded-3xl"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
              <button 
                onClick={() => setShowAlreadyEnrolledModal(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-8 pt-10 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-heading text-foreground">Active Enrollment Detected</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You are already enrolled in an internship program. To maintain quality and focus, you can only participate in one program at a time.
                  </p>
                </div>
                <div className="flex flex-col w-full gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setShowAlreadyEnrolledModal(false)}
                    className="w-full h-12 rounded-xl font-semibold"
                  >
                    Close
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
