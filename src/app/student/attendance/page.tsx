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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto px-4">
        <div className="glass-panel border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden w-full">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <CalendarIcon className="w-64 h-64 text-primary" />
          </div>
          <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 glow-primary">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight mb-2 uppercase">NO ACTIVE COURSES</h2>
          <p className="max-w-md mx-auto mb-8 text-xs font-mono tracking-widest text-muted-foreground uppercase">
            YOU ARE NOT ENROLLED IN ANY PROGRAMS YET. VISIT THE COURSE DIRECTORY TO INITIALIZE A SYLLABUS AND TRACK ATTENDANCE.
          </p>
        </div>
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
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">SYSTEM SYNC</h1>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2">
            <span className="w-1 h-1 bg-primary"></span> TRACK CONTINUITY AND INITIATE DAILY CHECK-INS
          </p>
        </div>
        <Button 
          onClick={handleManualCheckIn} 
          disabled={hasCheckedInToday || checkingIn}
          className={`rounded-sm px-8 py-6 h-auto font-mono text-[10px] tracking-widest uppercase font-bold transition-all duration-300 flex items-center gap-3 ${
            hasCheckedInToday 
              ? "bg-primary/10 text-primary border border-primary/30 cursor-not-allowed glow-primary" 
              : "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary shadow-[0_0_30px_rgba(var(--primary),0.4)]"
          }`}
        >
          {checkingIn ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> SYNCHRONIZING...</>
          ) : hasCheckedInToday ? (
            <><CheckCircle2 className="w-4 h-4" /> SESSION SYNCED</>
          ) : (
            <><CalendarCheck className="w-4 h-4" /> SYNC SESSION NOW</>
          )}
        </Button>
      </header>

      {/* Program Selector Dock */}
      <div className="flex items-center justify-start w-full relative z-10 mb-8">
        <div className="relative flex p-1 rounded-sm bg-card border border-border overflow-x-auto no-scrollbar max-w-full">
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
                className={`relative px-5 py-2 rounded-sm text-xs font-mono tracking-widest uppercase transition-colors flex items-center justify-center outline-none whitespace-nowrap min-w-fit z-20 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="attendance-active-pill"
                    className="absolute inset-0 bg-primary rounded-sm shadow-lg shadow-primary/20 z-0"
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
            <div className="glass-panel p-6 corner-accent overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transition-transform group-hover:scale-110">
                <Flame className="w-32 h-32 text-orange-500" />
              </div>
              <div className="pb-4 border-b border-border/20 mb-4">
                <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase text-orange-500 flex items-center gap-2">
                  <Flame className="w-4 h-4" /> CONTINUITY_STREAK
                </h3>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-heading font-black tracking-tighter text-foreground">{streak}</span>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">CYCLES</span>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-4 leading-relaxed max-w-[250px]">
                  MAINTAIN DAILY SYSTEM ACCESS TO PRESERVE ACTIVE CONTINUITY STATUS.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-panel p-6 corner-accent overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transition-transform group-hover:scale-110">
                <Trophy className="w-32 h-32 text-primary" />
              </div>
              <div className="pb-4 border-b border-border/20 mb-4">
                <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary flex items-center gap-2 glow-primary">
                  <Trophy className="w-4 h-4" /> TOTAL_SYNCS
                </h3>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-heading font-black tracking-tighter text-foreground">{attendanceRecords.length}</span>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">/ {totalDaysRequired}</span>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                    <span>COMPLETION_RATE</span>
                    <span className="text-primary glow-primary">{progressPercentage}%</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-sm overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-primary rounded-sm glow-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
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
            <div className="glass-panel p-8 corner-accent h-full flex flex-col">
              <div className="border-b border-border/40 pb-6 mb-8">
                <h3 className="text-2xl font-heading font-bold uppercase tracking-tight text-foreground">30-CYCLE ACTIVITY MATRIX</h3>
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mt-2">SYSTEM ACCESS FREQUENCY ANALYSIS</p>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                
                <div className="grid grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
                  {gridDays.map((day, idx) => (
                    <div 
                      key={day.date} 
                      title={day.date}
                      className={`aspect-square rounded-sm flex items-center justify-center font-mono text-[10px] sm:text-xs transition-all duration-300 ${
                        day.isPresent 
                          ? "bg-primary/10 border border-primary/50 text-primary glow-primary font-bold active-glow hover:bg-primary/20" 
                          : "grid-bg text-muted-foreground/30 border border-border/30 hover:border-border/60 hover:text-muted-foreground/60"
                      }`}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 flex items-center justify-end gap-3 text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
                  <span>LOW_FREQ</span>
                  <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-sm grid-bg border border-border/30" />
                    <div className="w-4 h-4 rounded-sm bg-primary/10 border border-primary/30" />
                    <div className="w-4 h-4 rounded-sm bg-primary/20 border border-primary/50" />
                    <div className="w-4 h-4 rounded-sm bg-primary/40 border border-primary/80 glow-primary" />
                  </div>
                  <span>HIGH_FREQ</span>
                </div>

              </div>
            </div>
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
