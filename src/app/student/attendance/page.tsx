"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Flame, Trophy, Calendar as CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";

interface AttendanceRecord {
  date: string;
}

interface EnrolledProgram {
  id: string;
  title: string;
  durationWeeks: number;
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [enrolledPrograms, setEnrolledPrograms] = useState<EnrolledProgram[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string>("");
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const loadData = async () => {
    if (typeof window === "undefined") return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('internship_id')
        .eq('student_id', user.id);
        
      const enrolledIds = enrollments ? enrollments.map(e => e.internship_id) : [];
      if (enrolledIds.length === 0) {
        setLoading(false);
        return;
      }
      
      const { data: internships } = await supabase
        .from('internships')
        .select('id, title, duration_weeks')
        .in('id', enrolledIds);
        
      if (internships) {
        setEnrolledPrograms(internships.map(i => ({
          id: i.id,
          title: i.title,
          durationWeeks: i.duration_weeks || 12
        })));
        
        if (!activeProgramId && internships.length > 0) {
          setActiveProgramId(internships[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load programs:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async (programId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('student_attendance')
        .select('date')
        .eq('student_id', user.id)
        .eq('internship_id', programId)
        .order('date', { ascending: true });
        
      if (!error && data) {
        setAttendanceRecords(data);
      } else {
        // Mock data if table fails (e.g. missing RLS / doesn't exist yet)
        console.warn("Could not load attendance (maybe table doesn't exist yet):", error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeProgramId) {
      loadAttendance(activeProgramId);
    }
  }, [activeProgramId]);

  const handleManualCheckIn = async () => {
    setCheckingIn(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !activeProgramId) {
        setCheckingIn(false);
        return;
      }

      const dateObj = new Date();
      const todayStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      const { error } = await supabase.from('student_attendance').insert({
        student_id: user.id,
        internship_id: activeProgramId,
        date: todayStr
      });

      if (error && error.code !== '23505') throw error;
      
      toast.success("Successfully checked in for today!");
      await loadAttendance(activeProgramId);
    } catch (e) {
      toast.error("Failed to check in. Make sure the database table exists.");
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return <FuturisticLoader text="Syncing Check-in Records..." />;
  }

  if (enrolledPrograms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CalendarIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Active Courses</h2>
        <p className="text-muted-foreground max-w-md">You are not enrolled in any programs yet. Visit the My Courses page to enroll and start tracking attendance.</p>
      </div>
    );
  }

  // Calculate Streak
  let streak = 0;
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const dates = attendanceRecords.map(r => {
    const d = new Date(r.date);
    d.setHours(0,0,0,0);
    return d.getTime();
  }).sort((a,b) => b - a); // descending

  if (dates.length > 0) {
    let checkDate = today.getTime();
    if (dates.includes(checkDate) || dates.includes(checkDate - 86400000)) {
      if (dates.includes(checkDate)) {
        streak++;
        checkDate -= 86400000;
      }
      for (let i = 0; i < dates.length; i++) {
        if (dates.includes(checkDate)) {
          streak++;
          checkDate -= 86400000;
        } else {
          break;
        }
      }
    }
  }

  const hasCheckedInToday = dates.includes(today.getTime());
  const activeProgram = enrolledPrograms.find(p => p.id === activeProgramId);
  const totalDaysRequired = activeProgram ? activeProgram.durationWeeks * 7 : 0;
  const progressPercentage = totalDaysRequired > 0 ? Math.min(100, Math.round((attendanceRecords.length / totalDaysRequired) * 100)) : 0;

  // Generate Calendar Grid (Last 30 days)
  const gridDays = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const isPresent = dates.includes(d.getTime());
    gridDays.push({ date: dateStr, isPresent, label: d.getDate() });
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tight">Attendance Center</h1>
          <p className="text-muted-foreground mt-2">
            Track your daily activity, view streaks, and check in.
          </p>
        </div>
        <Button 
          onClick={handleManualCheckIn} 
          disabled={hasCheckedInToday || checkingIn}
          className={`rounded-full px-8 py-6 h-auto text-lg font-bold shadow-2xl transition-all duration-300 flex items-center gap-3 ${
            hasCheckedInToday 
              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          }`}
        >
          {checkingIn ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : hasCheckedInToday ? (
            <><CheckCircle2 className="w-6 h-6" /> Checked In for Today</>
          ) : (
            <><CalendarCheck className="w-6 h-6" /> Check In Now</>
          )}
        </Button>
      </header>

      {/* Program Selector Dock */}
      <div className="flex items-center justify-start w-full relative z-10 mb-8">
        <div className="relative flex p-1.5 rounded-full bg-background/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-x-auto no-scrollbar max-w-full">
          {enrolledPrograms.map((program) => {
            const isActive = program.id === activeProgramId;
            return (
              <button
                key={program.id}
                onClick={() => {
                  if (program.id !== activeProgramId) {
                    setSwitchTargetId(program.id);
                  }
                }}
                className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center outline-none whitespace-nowrap min-w-fit z-20 ${
                  isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="attendance-active-pill"
                    className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-500 rounded-full shadow-lg shadow-primary/25 z-0"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{program.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card border-border shadow-xl overflow-hidden relative border-orange-500/20">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Flame className="w-32 h-32 text-orange-500" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-500">
                  <Flame className="w-5 h-5" /> Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter text-foreground">{streak}</span>
                  <span className="text-muted-foreground font-semibold">Days</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed max-w-[200px]">
                  Log in and check your course material every day to keep your streak burning hot!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Trophy className="w-32 h-32 text-blue-500" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-500">
                  <Trophy className="w-5 h-5" /> Total Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter text-foreground">{attendanceRecords.length}</span>
                  <span className="text-muted-foreground font-semibold">/ {totalDaysRequired}</span>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span>Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Grid Map */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <Card className="bg-card border-border shadow-2xl h-full flex flex-col">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-xl">30-Day Activity Graph</CardTitle>
                <CardDescription>Your attendance heatmap for the last month.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center p-8">
                
                <div className="grid grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
                  {gridDays.map((day, idx) => (
                    <div 
                      key={day.date} 
                      title={day.date}
                      className={`aspect-square rounded-xl flex items-center justify-center font-mono text-xs sm:text-sm shadow-sm transition-all duration-300 ${
                        day.isPresent 
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20 font-bold transform hover:scale-110" 
                          : "bg-slate-900/50 text-muted-foreground/40 border border-border/50 hover:bg-muted/40"
                      }`}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 flex items-center justify-end gap-3 text-xs text-muted-foreground font-mono">
                  <span>Less</span>
                  <div className="flex gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-sm bg-slate-900/50 border border-border/50" />
                    <div className="w-3.5 h-3.5 rounded-sm bg-blue-500/40" />
                    <div className="w-3.5 h-3.5 rounded-sm bg-blue-500/70" />
                    <div className="w-3.5 h-3.5 rounded-sm bg-indigo-600" />
                  </div>
                  <span>More</span>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <SwitchProgramModal
        isOpen={!!switchTargetId}
        currentProgramName={enrolledPrograms.find(p => p.id === activeProgramId)?.title || ""}
        targetProgramName={enrolledPrograms.find(p => p.id === switchTargetId)?.title || ""}
        onConfirm={() => {
          if (switchTargetId) setActiveProgramId(switchTargetId);
          setSwitchTargetId(null);
        }}
        onCancel={() => setSwitchTargetId(null)}
      />
    </div>
  );
}
