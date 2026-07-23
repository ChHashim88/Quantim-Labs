"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle, Clock, BookOpen, Flame, Award, CalendarDays, ArrowRight, ShieldAlert, Loader2, CheckCircle2, CalendarCheck, FileText, CheckCircle, Terminal, FolderOpen, AlertCircle, Bolt, Shield, Activity, Monitor, X, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { VerificationFormModal } from "@/components/student/VerificationFormModal";
import { CelebrationModal } from "@/components/student/CelebrationModal";
import { ShieldCheck } from "lucide-react";

interface DashboardStats {
  internshipName: string;
  progressPercentage: number;
  streakCount: number;
  videos?: { total: number; completed: number; pending: number };
  tasks?: { total: number; completed: number; pending: number };
  assignments?: { total: number; completed: number; pending: number };
  quizzes?: { total: number; completed: number; pending: number };
  documents?: { total: number; completed: number; pending: number };
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    internshipName: "Not Enrolled",
    progressPercentage: 0,
    streakCount: 0,
    videos: { total: 0, completed: 0, pending: 0 },
    tasks: { total: 0, completed: 0, pending: 0 },
    assignments: { total: 0, completed: 0, pending: 0 },
    quizzes: { total: 0, completed: 0, pending: 0 },
    documents: { total: 0, completed: 0, pending: 0 }
  });
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<{ label: string, value: number, isToday: boolean }[]>([]);
  const [attendanceMatrix, setAttendanceMatrix] = useState<{ date: Date, isPresent: boolean }[]>([]);
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const [nextWeekInfo, setNextWeekInfo] = useState<{
    currentWeek: number;
    nextWeekNumber: number;
    daysLeft: number;
    unlocksAt: string;
  } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(`${now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase()} // ${now.toLocaleTimeString('en-US', { hour12: false })}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Initial Load: Fetch Profile & Enrolled Programs
  useEffect(() => {
    async function loadInitialData() {
      if (typeof window === "undefined") return;

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        setProfile(profileData);
        setUserEmail(user.email || "");

        // Fetch verification state
        try {
          const { data: vData } = await supabase.from('student_verifications').select('id').eq('student_id', user.id).single();
          if (vData) setIsVerified(true);
        } catch (e) {
          // ignore error if table doesn't exist yet
        }

        const { data: enrollments } = await supabase
          .from('student_enrollments')
          .select('internship_id')
          .eq('student_id', user.id);

        const enrolled = enrollments ? enrollments.map(e => e.internship_id) : [];

        if (enrolled.length === 0) {
          setHasEnrollments(false);
          setLoading(false);
          return;
        }

        setHasEnrollments(true);

        const { data: internships } = await supabase
          .from('internships')
          .select('*')
          .in('id', enrolled);

        if (internships && internships.length > 0) {
          setEnrolledPrograms(internships);
          setActiveProgramId(internships[0].id); // Default to the first program
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("Error loading initial data:", e);
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // 2. Load Stats for the Active Program
  useEffect(() => {
    async function loadStatsForActiveProgram() {
      if (!activeProgramId || enrolledPrograms.length === 0) return;

      try {
        const supabase = createClient();
        const internship = enrolledPrograms.find(i => i.id === activeProgramId);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: progressData } = await supabase
          .from('student_progress')
          .select('content_type, content_id')
          .eq('student_id', user.id);

        let vTotal = 0, tTotal = 0, aTotal = 0, qTotal = 0, dTotal = 0;
        let vComp = 0, tComp = 0, aComp = 0, qComp = 0, dComp = 0;

        const completedVideos = progressData?.filter(p => p.content_type === 'LESSON' || p.content_type === 'VIDEO').map(p => p.content_id) || [];
        const completedTasks = progressData?.filter(p => p.content_type === 'TASK').map(p => p.content_id) || [];
        const completedAssignments = progressData?.filter(p => p.content_type === 'ASSIGNMENT').map(p => p.content_id) || [];
        const completedQuizzes = progressData?.filter(p => p.content_type === 'QUIZ').map(p => p.content_id) || [];
        const completedDocuments = progressData?.filter(p => p.content_type === 'DOCUMENT').map(p => p.content_id) || [];

        const fetchedTasks: any[] = [];

        const { data: dbDays } = await supabase
          .from('days')
          .select('id, title, order_index')
          .eq('internship_id', activeProgramId)
          .order('order_index', { ascending: true });

        if (dbDays && dbDays.length > 0) {
          const dayIds = dbDays.map(d => d.id);
          const { data: dbLessons } = await supabase
            .from('lessons')
            .select('*')
            .in('day_id', dayIds)
            .order('created_at', { ascending: true });

          if (dbLessons && dbLessons.length > 0) {
            dbLessons.forEach(lesson => {
              if (lesson.content_type === 'VIDEO') {
                vTotal++;
                if (completedVideos.includes(lesson.id)) vComp++;
              } else if (lesson.content_type === 'TASK') {
                tTotal++;
                if (completedTasks.includes(lesson.id)) tComp++;
              } else if (lesson.content_type === 'ASSIGNMENT') {
                aTotal++;
                if (completedAssignments.includes(lesson.id)) aComp++;
              } else if (lesson.content_type === 'QUIZ') {
                qTotal++;
                if (completedQuizzes.includes(lesson.id)) qComp++;
              } else if (lesson.content_type === 'DOCUMENT') {
                dTotal++;
                if (completedDocuments.includes(lesson.id)) dComp++;
              }
            });

            const isLessonCompleted = (l: any) => {
              if (l.content_type === 'VIDEO') return completedVideos.includes(l.id);
              if (l.content_type === 'TASK') return completedTasks.includes(l.id);
              if (l.content_type === 'ASSIGNMENT') return completedAssignments.includes(l.id);
              if (l.content_type === 'QUIZ') return completedQuizzes.includes(l.id);
              if (l.content_type === 'DOCUMENT') return completedDocuments.includes(l.id);
              return false;
            };

            const uncompletedLessons = dbLessons.filter(l => !isLessonCompleted(l));
            const displayLessons = uncompletedLessons.length > 0 ? uncompletedLessons.slice(0, 3) : dbLessons.slice(0, 3);

            displayLessons.forEach((lesson) => {
              const isCompleted = isLessonCompleted(lesson);
              fetchedTasks.push({
                title: lesson.title,
                type: lesson.content_type || "Lecture",
                duration: lesson.duration_hours ? `${Math.round(lesson.duration_hours * 60)} mins` : "15 mins",
                status: isCompleted ? "Completed" : "In Progress"
              });
            });

            let deadlineLessons = uncompletedLessons.filter(l => l.content_type === 'ASSIGNMENT' || l.content_type === 'QUIZ').slice(0, 2);
            if (deadlineLessons.length === 0) {
              deadlineLessons = uncompletedLessons.slice(3, 5);
            }
            const fetchedDeadlines = deadlineLessons.map(lesson => ({
              title: lesson.title,
              type: lesson.content_type,
              timeText: lesson.content_type === 'QUIZ' || lesson.content_type === 'ASSIGNMENT' ? "PHASE_END" : "SUBMIT_REQ"
            }));

            setUpcomingDeadlines(fetchedDeadlines);
          }
        }

        const totalItems = vTotal + tTotal + aTotal + qTotal + dTotal;
        const totalCompleted = vComp + tComp + aComp + qComp + dComp;
        const progressPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

        // Calculate actual streak based on attendance records
        const { data: allAtt } = await supabase
          .from('student_attendance')
          .select('date')
          .eq('student_id', user.id)
          .eq('internship_id', activeProgramId)
          .order('date', { ascending: true });

        let calculatedStreak = 0;
        let checkedInToday = false;
        if (allAtt && allAtt.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const dates = allAtt.map((r: any) => {
            const d = new Date(r.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
          }).sort((a: number, b: number) => b - a);

          checkedInToday = dates.includes(today.getTime());

          let checkDate = today.getTime();
          if (dates.includes(checkDate) || dates.includes(checkDate - 86400000)) {
            if (dates.includes(checkDate)) {
              calculatedStreak++;
              checkDate -= 86400000;
            }
            for (let i = 0; i < dates.length; i++) {
              if (dates.includes(checkDate)) {
                calculatedStreak++;
                checkDate -= 86400000;
              } else {
                break;
              }
            }
          }

          // Generate real-time activity for the last 6 days
          const last6 = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (5 - i));
            const isPresent = dates.includes(d.getTime());

            // Pseudo-random height based on date to make it look like dynamic network activity
            const seed = d.getDate();
            const value = isPresent ? 40 + (seed % 60) : 5 + (seed % 10);

            return {
              label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
              value,
              isToday: i === 5
            };
          });
          setActivityData(last6);

          // Generate 28-day creative attendance matrix
          const last28 = Array.from({ length: 28 }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (27 - i));
            return {
              date: d,
              isPresent: dates.includes(d.getTime())
            };
          });
          setAttendanceMatrix(last28);
        }

        setStats({
          internshipName: internship?.title || "Technology Internship",
          progressPercentage: progressPercent,
          streakCount: calculatedStreak,
          videos: { total: vTotal, completed: vComp, pending: vTotal - vComp },
          tasks: { total: tTotal, completed: tComp, pending: tTotal - tComp },
          assignments: { total: aTotal, completed: aComp, pending: aTotal - aComp },
          quizzes: { total: qTotal, completed: qComp, pending: qTotal - qComp },
          documents: { total: dTotal, completed: dComp, pending: dTotal - dComp }
        });
        setTodayTasks(fetchedTasks);
        setHasCheckedInToday(checkedInToday);

        // Calculate next week unlock countdown
        const { data: enrollmentsData } = await supabase
          .from('student_enrollments')
          .select('enrolled_at')
          .eq('student_id', user.id)
          .eq('internship_id', activeProgramId);

        if (enrollmentsData && enrollmentsData.length > 0 && enrollmentsData[0].enrolled_at) {
          const enrolledAt = new Date(enrollmentsData[0].enrolled_at);
          const now = new Date();
          const daysSinceEnrollment = Math.floor((now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));
          const currentWeek = Math.floor(daysSinceEnrollment / 7) + 1;
          const nextWeekNumber = currentWeek + 1;
          const daysNeeded = (nextWeekNumber - 1) * 7;

          const unlocksAtDate = new Date(enrolledAt);
          unlocksAtDate.setDate(unlocksAtDate.getDate() + daysNeeded);

          const daysLeft = Math.max(0, Math.ceil((unlocksAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

          setNextWeekInfo({
            currentWeek,
            nextWeekNumber,
            daysLeft,
            unlocksAt: unlocksAtDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          });
        }

      } catch (e) {
        console.error("Error loading program stats:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStatsForActiveProgram();
  }, [activeProgramId, enrolledPrograms]);

  const handleManualCheckIn = async () => {
    setCheckingIn(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !activeProgramId) return;

      const dateObj = new Date();
      const todayStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      const { error } = await supabase.from('student_attendance').insert({
        student_id: user.id,
        internship_id: activeProgramId,
        date: todayStr
      });

      if (error && error.code !== '23505') throw error;

      toast.success("Successfully synced session!");
      setHasCheckedInToday(true);
    } catch (e) {
      toast.error("Failed to sync session.");
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return <FuturisticLoader text="Syncing Student Progress..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1400px] mx-auto w-full overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Verification Warning */}
      {!isVerified && (
        <div className="mb-6 sm:mb-8 glass-panel border border-destructive/50 p-4 sm:p-6 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-full overflow-hidden">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-destructive/10 flex items-center justify-center animate-pulse shrink-0">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <div className="overflow-hidden">
              <p className="font-mono font-bold text-destructive uppercase tracking-widest text-xs sm:text-sm truncate">Action Required: Identity Verification</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-1 break-words">System cannot grant full access until profile verification is complete.</p>
            </div>
          </div>
          <button onClick={() => setShowVerificationModal(true)} className="w-full sm:w-auto px-6 py-3 bg-destructive text-destructive-foreground font-mono text-xs font-bold uppercase tracking-widest hover:bg-destructive/80 transition-all glow-primary shrink-0">
            Verify Now
          </button>
        </div>
      )}

      {/* Header: Telemetry Header */}
      <header className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 relative overflow-hidden">
        <div className="space-y-1 max-w-full overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse glow-primary"></span>
            System Online // User: {profile?.first_name || 'Active'}
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tighter text-foreground uppercase break-words">
            {profile?.first_name ? `Welcome, ${profile.first_name}` : 'STUDENT DASHBOARD'}
          </h2>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-muted-foreground pt-1 sm:pt-2">
            <Bolt className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{stats.streakCount > 0 ? `${stats.streakCount}-DAY CONTINUITY STREAK MAINTAINED` : 'NO ACTIVE CONTINUITY STREAK DETECTED'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 sm:gap-6">
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase">Local Timestamp</span>
            <span className="text-xs sm:text-sm font-mono text-foreground">{currentTime}</span>
          </div>
          <div className="hidden sm:block h-10 w-[1px] bg-border"></div>
          <button
            onClick={handleManualCheckIn}
            disabled={hasCheckedInToday || checkingIn}
            className={`h-10 sm:h-12 px-5 sm:px-8 font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${hasCheckedInToday
              ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
              : "bg-primary text-primary-foreground hover:bg-primary/80 active:scale-95 glow-primary"
              }`}
          >
            {checkingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : hasCheckedInToday ? "Session Synced" : "Sync Session"}
          </button>
        </div>
      </header>

      {/* Next Week Unlock Countdown Banner */}
      {nextWeekInfo && (
        <div className="mb-6 sm:mb-8 glass-panel border border-primary/40 p-4 sm:p-6 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/5 shadow-[0_0_30px_rgba(var(--primary),0.05)] max-w-full overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center text-primary glow-primary shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono text-primary uppercase tracking-widest font-bold glow-primary">
                <span>ACTIVE: W{nextWeekInfo.currentWeek}</span>
                <span>&bull;</span>
                <span>NEXT: W{nextWeekInfo.nextWeekNumber}</span>
              </div>
              <h3 className="font-heading text-sm sm:text-lg font-bold uppercase tracking-tight text-foreground mt-0.5 break-words">
                WEEK {nextWeekInfo.nextWeekNumber} UNLOCKS IN {nextWeekInfo.daysLeft} {nextWeekInfo.daysLeft === 1 ? 'DAY' : 'DAYS'} ({nextWeekInfo.unlocksAt})
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 shrink-0">
            <div className="text-right hidden md:block">
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">SYLLABUS ROTATION</div>
              <div className="text-xs font-mono text-primary font-bold uppercase">7-DAY AUTOMATIC UNLOCK</div>
            </div>
            <Link href="/student/lectures" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 glow-primary px-4 sm:px-5 py-4 sm:py-5">
                VIEW SYLLABUS
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Dynamic Grid: Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-4 mb-8 sm:mb-12">
        {/* Metric 1: Videos */}
        <div className="glass-panel corner-accent p-3.5 sm:p-6 rounded-sm group hover:bg-primary/5 transition-colors overflow-hidden">
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className="font-mono text-[8px] sm:text-[10px] text-muted-foreground tracking-[0.2em] truncate">VIDEOS.LOG</span>
            <Play className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-mono font-bold tracking-tighter">{String(stats.videos?.completed || 0).padStart(2, '0')}</span>
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">/ {String(stats.videos?.total || 0).padStart(2, '0')}</span>
          </div>
          <div className="mt-3 sm:mt-4 h-[2px] w-full bg-border">
            <div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-1000" style={{ width: `${stats.videos?.total ? (stats.videos.completed / stats.videos.total) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Metric 2: Tasks */}
        <div className="glass-panel corner-accent p-3.5 sm:p-6 rounded-sm group hover:bg-primary/5 transition-colors overflow-hidden">
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className="font-mono text-[8px] sm:text-[10px] text-muted-foreground tracking-[0.2em] truncate">TASKS.EXE</span>
            <Terminal className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-mono font-bold tracking-tighter">{String(stats.tasks?.completed || 0).padStart(2, '0')}</span>
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">/ {String(stats.tasks?.total || 0).padStart(2, '0')}</span>
          </div>
          <div className="mt-3 sm:mt-4 h-[2px] w-full bg-border">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${stats.tasks?.total ? (stats.tasks.completed / stats.tasks.total) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Metric 3: Assignments */}
        <div className="glass-panel corner-accent p-3.5 sm:p-6 rounded-sm group hover:bg-primary/5 transition-colors overflow-hidden">
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className="font-mono text-[8px] sm:text-[10px] text-muted-foreground tracking-[0.2em] truncate">ASGN.DAT</span>
            <FolderOpen className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-mono font-bold tracking-tighter">{String(stats.assignments?.completed || 0).padStart(2, '0')}</span>
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">/ {String(stats.assignments?.total || 0).padStart(2, '0')}</span>
          </div>
          <div className="mt-3 sm:mt-4 h-[2px] w-full bg-border">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${stats.assignments?.total ? (stats.assignments.completed / stats.assignments.total) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Metric 4: Quizzes */}
        <div className="glass-panel corner-accent p-3.5 sm:p-6 rounded-sm group hover:bg-primary/5 transition-colors overflow-hidden">
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className="font-mono text-[8px] sm:text-[10px] text-muted-foreground tracking-[0.2em] truncate">QUIZ.SYS</span>
            <Activity className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-mono font-bold tracking-tighter">{String(stats.quizzes?.completed || 0).padStart(2, '0')}</span>
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">/ {String(stats.quizzes?.total || 0).padStart(2, '0')}</span>
          </div>
          <div className="mt-3 sm:mt-4 h-[2px] w-full bg-border">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${stats.quizzes?.total ? (stats.quizzes.completed / stats.quizzes.total) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Metric 5: Documents */}
        <div className="glass-panel corner-accent p-3.5 sm:p-6 rounded-sm group hover:bg-destructive/5 transition-colors overflow-hidden col-span-2 md:col-span-1">
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className="font-mono text-[8px] sm:text-[10px] text-destructive tracking-[0.2em] uppercase truncate">Docs.ref</span>
            <AlertCircle className="w-3 h-3 text-destructive animate-pulse shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-mono font-bold tracking-tighter">{String(stats.documents?.completed || 0).padStart(2, '0')}</span>
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">/ {String(stats.documents?.total || 0).padStart(2, '0')}</span>
          </div>
          <div className="mt-3 sm:mt-4 h-[2px] w-full bg-border">
            <div className="h-full bg-destructive shadow-[0_0_10px_rgba(var(--destructive),0.5)] transition-all duration-1000" style={{ width: `${stats.documents?.total ? (stats.documents.completed / stats.documents.total) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Layout Split */}
      <div className="grid grid-cols-12 gap-6 sm:gap-8">

        {/* Left: Active Operations */}
        <div className="col-span-12 xl:col-span-8 space-y-6 sm:space-y-8 max-w-full overflow-hidden">
          <section>
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight uppercase">ACTIVE OPERATIONS</h3>
              <div className="h-[1px] flex-1 bg-border"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {enrolledPrograms.length > 0 ? (
                <>
                  {enrolledPrograms.map((prog, idx) => (
                    <div key={prog.id} className="glass-panel p-5 sm:p-8 rounded-sm group hover:bg-primary/5 transition-all max-w-full overflow-hidden">
                      <div className="flex justify-between items-start mb-6 sm:mb-8 gap-2">
                        <div className="overflow-hidden">
                          <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase mb-1 truncate">Project ID: {prog.id.split('-')[0]}</div>
                          <h4 className="text-base sm:text-xl font-heading font-bold uppercase truncate max-w-[170px] sm:max-w-none">{prog.title}</h4>
                        </div>
                        <span className="px-2 py-1 h-fit border border-primary/20 font-mono text-[9px] uppercase text-primary tracking-widest shrink-0">
                          {prog.id === activeProgramId ? 'Tracking' : 'Standby'}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end text-xs font-mono text-muted-foreground">
                          <span>PHASE_COMPLETION</span>
                          <span className="text-foreground">{prog.id === activeProgramId ? stats.progressPercentage : 0}%</span>
                        </div>
                        <div className="h-1 w-full bg-border relative overflow-hidden">
                          <div className={`h-full ${prog.id === activeProgramId ? 'bg-primary glow-primary' : 'bg-muted-foreground'} transition-all duration-1000`} style={{ width: `${prog.id === activeProgramId ? stats.progressPercentage : 0}%` }}></div>
                        </div>
                      </div>
                      <Link href="/student/courses" className="block mt-8">
                        <button className="w-full h-10 border border-border flex items-center justify-center gap-3 font-mono text-[10px] tracking-widest hover:bg-primary hover:text-primary-foreground transition-all uppercase">
                          <FileText className="w-3.5 h-3.5" /> Access Documentation
                        </button>
                      </Link>
                    </div>
                  ))}
                  
                  {/* Fill empty grid slot with spinning SPD logo if only 1 program */}
                  {enrolledPrograms.length === 1 && (
                    <div className="hidden md:flex justify-center items-center py-4 relative z-10 h-full w-full">
                      {/* Static glow behind the image so it doesn't hurt rotation performance */}
                      <div className="absolute w-32 h-32 bg-primary/20 blur-[40px] rounded-full"></div>
                      
                      {/* Pure CSS GPU-accelerated rotation for maximum smoothness */}
                      <div 
                        className="relative w-48 h-48"
                        style={{ animation: "spin 20s linear infinite", willChange: "transform" }}
                      >
                        <Image src="/SPD.png" alt="SPD" fill className="object-contain" priority />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="col-span-2 glass-panel p-8 text-center border-dashed border-border flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Monitor className="w-8 h-8 opacity-50" />
                  <p className="font-mono text-xs uppercase tracking-widest">No Active Operations Detected</p>
                  <Link href="/programs">
                    <button className="px-6 py-2 border border-primary/50 text-primary font-mono text-xs uppercase hover:bg-primary/10 transition-colors">
                      Initialize Program
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* System Progress & Data Visualization */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Progress Node */}
            <div className="glass-panel p-8 rounded-sm corner-accent">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Aggregate Progress</h4>
                <span className="font-mono text-2xl font-bold text-foreground">{stats.progressPercentage.toFixed(2)}%</span>
              </div>
              <div className="relative py-8 flex justify-center">
                <div className="w-32 h-32 rounded-full border border-border flex items-center justify-center relative">
                  <div className="absolute inset-2 rounded-full border-t-2 border-primary glow-primary animate-[spin_3s_linear_infinite]"></div>
                  <Activity className="w-8 h-8 opacity-20 text-foreground" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground pt-4 border-t border-border mt-4">
                <span>LNK_STATUS: {stats.progressPercentage > 0 ? 'STABLE' : 'IDLE'}</span>
                <span>ETA: {hasEnrollments ? 'TERM END' : 'N/A'}</span>
              </div>
            </div>

            {/* Activity Graph */}
            <div className="glass-panel p-8 rounded-sm overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Weekly Activity Forecast</h4>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-primary"></div>
                  <div className="w-1 h-1 bg-primary/40"></div>
                  <div className="w-1 h-1 bg-primary/10"></div>
                </div>
              </div>
              <div className="relative flex-1 w-full min-h-[128px]">
                {activityData.length > 0 ? (
                  <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#chartGradient)"
                      points={`0,100 ${activityData.map((d, i) => `${(i / 5) * 100},${100 - d.value}`).join(' ')} 100,100`}
                    />
                    <polyline
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="1.5"
                      points={activityData.map((d, i) => `${(i / 5) * 100},${100 - d.value}`).join(' ')}
                    />
                  </svg>
                ) : (
                  <div className="area-chart absolute inset-0 opacity-20"></div>
                )}

                <div className="absolute bottom-0 left-0 w-full flex justify-between px-0">
                  {(activityData.length > 0 ? activityData : [{ label: 'M', isToday: false }, { label: 'T', isToday: false }, { label: 'W', isToday: false }, { label: 'T', isToday: false }, { label: 'F', isToday: false }, { label: 'S', isToday: true }]).map((day: any, i) => (
                    <div key={i} className="w-[1px] h-4 bg-border relative">
                      <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono ${day.isToday ? 'text-primary font-bold glow-primary' : 'text-muted-foreground'}`}>{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: System Feed & Deadlines */}
        <div className="col-span-12 xl:col-span-4 space-y-8">

          {/* Creative Attendance Graph */}
          <div className="glass-panel p-8 rounded-sm relative overflow-hidden group">
            {/* Background ambient glow */}
            <div className="absolute -inset-20 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

            <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-8 flex items-center gap-2 relative z-10">
              <span className="w-1 h-1 bg-primary"></span> ATTENDANCE_MATRIX
            </h4>

            <div className="relative z-10">
              {/* Vertical Bars for Last 7 Days */}
              <div className="flex items-end justify-between h-24 mb-6 border-b border-border/50 pb-2">
                {attendanceMatrix.slice(-7).map((day, i) => (
                  <div key={`bar-${i}`} className="w-full flex flex-col items-center gap-2 group/bar cursor-pointer px-1">
                    <div className="w-full h-20 bg-border/20 rounded-t-sm relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 w-full transition-all duration-1000 ease-out rounded-t-sm ${day.isPresent ? 'bg-primary glow-primary' : 'bg-transparent'}`}
                        style={{ height: day.isPresent ? '100%' : '5%', transitionDelay: `${i * 100}ms` }}
                      ></div>
                    </div>
                    <span className={`text-[8px] font-mono uppercase ${day.isPresent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {day.date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* 28-Day Heatmap Grid */}
              <div className="grid grid-cols-7 gap-2">
                {attendanceMatrix.map((day, i) => (
                  <div
                    key={`matrix-${i}`}
                    className={`aspect-square rounded-[2px] transition-all duration-500 hover:scale-125 hover:z-20 relative ${day.isPresent ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]' : 'bg-border/20 hover:bg-border/40'}`}
                    title={day.date.toDateString()}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase tracking-widest pt-4">
                <span>{attendanceMatrix.filter(d => d.isPresent).length} / 28 DAYS</span>
                <div className="flex gap-2 items-center">
                  <span>IDLE</span>
                  <div className="w-2 h-2 bg-border/20 rounded-[1px]"></div>
                  <div className="w-2 h-2 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] rounded-[1px]"></div>
                  <span>SYNCED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Feed */}
          <div className="glass-panel p-8 rounded-sm">
            <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-8 flex items-center gap-2">
              <span className="w-1 h-1 bg-primary"></span> RECENT_NODES
            </h4>
            <div className="flex gap-4">
              <div className={`w-14 h-14 rounded-sm border ${stats.streakCount >= 1 ? 'border-primary text-primary glow-primary' : 'border-border opacity-20'} flex items-center justify-center transition-all cursor-pointer`}>
                <Award className="w-6 h-6" />
              </div>
              <div className={`w-14 h-14 rounded-sm border ${stats.streakCount >= 5 ? 'border-primary text-primary glow-primary' : 'border-border opacity-20'} flex items-center justify-center transition-all cursor-pointer`}>
                <Flame className="w-6 h-6" />
              </div>
              <div className="w-14 h-14 rounded-sm border border-border flex items-center justify-center opacity-10">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Daily Protocol */}
          <div className="glass-panel p-5 sm:p-8 rounded-sm max-w-full overflow-hidden">
            <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6 sm:mb-8 flex items-center gap-2">
              <span className="w-1 h-1 bg-primary"></span> DAILY_PROTOCOL
            </h4>
            <div className="space-y-3 sm:space-y-4 max-w-full overflow-hidden">
              {todayTasks.length > 0 ? todayTasks.map((task, i) => (
                <Link href="/student/lectures" key={i} className="block max-w-full overflow-hidden">
                  <div className={`group flex flex-col gap-1 p-3 sm:p-4 border border-border hover:border-primary/50 transition-all cursor-pointer mt-2 sm:mt-3 max-w-full overflow-hidden ${task.status === 'Completed' ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
                      <div className={`w-2 h-2 shrink-0 ${task.status === 'Completed' ? 'bg-muted-foreground' : 'bg-primary glow-primary'}`}></div>
                      <span className="font-mono text-[10px] sm:text-[11px] tracking-wide uppercase text-foreground truncate block flex-1">EXEC: {task.title}</span>
                    </div>
                    <div className="font-mono text-[8px] sm:text-[9px] text-muted-foreground pl-4 sm:pl-5 uppercase truncate">{task.type} // {task.duration}</div>
                  </div>
                </Link>
              )) : (
                <div className="text-xs font-mono text-muted-foreground uppercase">All protocols completed.</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {showVerificationModal && (
        <VerificationFormModal
          email={userEmail}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={() => {
            setShowVerificationModal(false);
            setIsVerified(true);
            setShowCelebrationModal(true);
          }}
        />
      )}

      {showCelebrationModal && (
        <CelebrationModal onClose={() => setShowCelebrationModal(false)} />
      )}
    </div>
  );
}
