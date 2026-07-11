"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, BookOpen, Flame, Award, CalendarDays, ArrowRight, ShieldAlert, Loader2, CheckCircle2, CalendarCheck, FileText, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { VerificationFormModal } from "@/components/student/VerificationFormModal";
import { CelebrationModal } from "@/components/student/CelebrationModal";
import { ShieldCheck } from "lucide-react";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";

interface DashboardStats {
  internshipName: string;
  hoursLearned?: string;
  lessonsCompletedStr?: string;
  avgQuizScore?: string;
  progressPercentage: number;
  streakCount: number;
  videos?: { total: number; completed: number; pending: number };
  tasks?: { total: number; completed: number; pending: number };
  assignments?: { total: number; completed: number; pending: number };
  quizzes?: { total: number; completed: number; pending: number };
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
    quizzes: { total: 0, completed: 0, pending: 0 }
  });
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

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
              timeText: lesson.content_type === 'QUIZ' || lesson.content_type === 'ASSIGNMENT' ? "End of Module Deadline" : "Upcoming Task"
            }));

            setUpcomingDeadlines(fetchedDeadlines);
          }
        }

        const totalItems = vTotal + tTotal + aTotal + qTotal + dTotal;
        const totalCompleted = vComp + tComp + aComp + qComp + dComp;
        const progressPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

        setStats({
          internshipName: internship?.title || "Technology Internship",
          progressPercentage: progressPercent,
          streakCount: totalCompleted > 0 ? 5 : 0,
          videos: { total: vTotal, completed: vComp, pending: vTotal - vComp },
          tasks: { total: tTotal, completed: tComp, pending: tTotal - tComp },
          assignments: { total: aTotal, completed: aComp, pending: aTotal - aComp },
          quizzes: { total: qTotal, completed: qComp, pending: qTotal - qComp },
          documents: { total: dTotal, completed: dComp, pending: dTotal - dComp }
        });
        setTodayTasks(fetchedTasks);

        const dateObj = new Date();
        const todayStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        const { data: attData } = await supabase
          .from('student_attendance')
          .select('id')
          .eq('internship_id', activeProgramId)
          .eq('date', todayStr)
          .single();
        if (attData) setHasCheckedInToday(true);
        else setHasCheckedInToday(false);

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
      
      toast.success("Successfully checked in for today!");
      setHasCheckedInToday(true);
    } catch (e) {
      toast.error("Failed to check in.");
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return <FuturisticLoader text="Syncing Student Progress..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tight">
            Welcome back, <span className="text-primary">{profile?.first_name || 'Student'}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {stats.streakCount > 0 ? (
              <span className="text-primary font-semibold flex items-center gap-1.5">
                <Flame className="w-5 h-5 inline text-primary animate-pulse" /> {stats.streakCount}-day streak! Keep up the great work.
              </span>
            ) : (
              "Explore courses and start tracking your learning progress."
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isVerified && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-4 h-4" /> Verified
            </Badge>
          )}
          
          {hasEnrollments && (
            <Button 
              onClick={handleManualCheckIn} 
              disabled={hasCheckedInToday || checkingIn}
              className={`rounded-full px-6 transition-all duration-300 flex items-center gap-2 ${
                hasCheckedInToday 
                  ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 cursor-not-allowed shadow-none" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              }`}
            >
              {checkingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : hasCheckedInToday ? (
                <><CheckCircle2 className="w-4 h-4" /> Checked In</>
              ) : (
                <><CalendarCheck className="w-4 h-4" /> Check In Now</>
              )}
            </Button>
          )}

          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-border shrink-0">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </header>

      {!isVerified && (
        <Card className="bg-red-500/5 border-red-500/20 shadow-none">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-red-500">Action Required: Account Verification</p>
                <p className="text-sm text-muted-foreground">You must complete your profile to verify your identity and unlock full access.</p>
              </div>
            </div>
            <Button onClick={() => setShowVerificationModal(true)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 whitespace-nowrap">
              Get Verified Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-card border-border shadow-lg relative overflow-hidden group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Videos</CardTitle>
            <PlayCircle className="w-5 h-5 text-primary opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-foreground">{stats.videos?.completed || 0}</div>
              <div className="text-sm text-muted-foreground mb-1">/ {stats.videos?.total || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg relative overflow-hidden group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
            <BookOpen className="w-5 h-5 text-primary opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-foreground">{stats.tasks?.completed || 0}</div>
              <div className="text-sm text-muted-foreground mb-1">/ {stats.tasks?.total || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg relative overflow-hidden group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
            <Award className="w-5 h-5 text-primary opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-foreground">{stats.assignments?.completed || 0}</div>
              <div className="text-sm text-muted-foreground mb-1">/ {stats.assignments?.total || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg relative overflow-hidden group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes</CardTitle>
            <Award className="w-5 h-5 text-primary opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-foreground">{stats.quizzes?.completed || 0}</div>
              <div className="text-sm text-muted-foreground mb-1">/ {stats.quizzes?.total || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg relative overflow-hidden group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Materials</CardTitle>
            <FileText className="w-5 h-5 text-rose-500 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-foreground">{stats.documents?.completed || 0}</div>
              <div className="text-sm text-muted-foreground mb-1">/ {stats.documents?.total || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Programs Cards */}
      {hasEnrollments && enrolledPrograms.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">My Active Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledPrograms.map((program, idx) => {
              const isActive = program.id === activeProgramId;
              return (
                <Card
                  key={idx}
                  onClick={() => {
                    if (program.id !== activeProgramId) {
                      setSwitchTargetId(program.id);
                    }
                  }}
                  className={`bg-card shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group cursor-pointer border-2 ${isActive ? 'border-primary shadow-primary/20' : 'border-border/50 hover:border-primary/50'}`}
                >
                  <CardHeader>
                    <CardTitle className={`text-lg line-clamp-2 leading-tight transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                      {program.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {program.description || "Comprehensive learning track."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-primary text-white" : "bg-primary/5 text-primary border-primary/20"}>
                        {isActive ? "Viewing Stats" : "Enrolled"}
                      </Badge>
                      <Link href="/student/courses">
                        <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 rounded-full px-4" onClick={(e) => e.stopPropagation()}>
                          Continue <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="border-t border-border pt-3 mt-1">
                      <Link href={`/offer-letter?programId=${program.id}`} target="_blank">
                        <Button variant="outline" className="w-full border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors shadow-sm" onClick={(e) => e.stopPropagation()}>
                          <Award className="w-4 h-4 mr-2 text-blue-600" />
                          View Offer Letter
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Progress Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Overall Progress</CardTitle>
                  <CardDescription>
                    {hasEnrollments ? "Track your curriculum completion path." : "Enroll in a program to see progress."}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-primary border-primary/50 bg-primary/10">{stats.progressPercentage}% Complete</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={stats.progressPercentage} className="h-3 bg-muted" />
              <div className="flex justify-between mt-4 text-sm text-muted-foreground font-mono">
                <span>Start: Dynamic Enrollment</span>
                <span>Expected: Term End</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>Complete these to unlock subsequent lessons.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasEnrollments && todayTasks.length > 0 ? (
                todayTasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 text-primary border border-primary/30`}>
                        <PlayCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">{task.type} &bull; {task.duration}</p>
                      </div>
                    </div>
                    <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'} className={task.status === 'Completed' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                      {task.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
                  <ShieldAlert className="w-8 h-8 text-muted-foreground/60 mb-2" />
                  <span>No active tasks available. Visit the catalog to enroll.</span>
                  <Link href="/programs" className="mt-4">
                    <Button variant="outline" size="sm">Browse Programs</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info Section */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasEnrollments && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((deadline, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border relative overflow-hidden ${deadline.type === 'QUIZ' ? 'bg-red-500/5 border-red-500/10' : 'bg-primary/5 border-primary/10'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${deadline.type === 'QUIZ' ? 'bg-red-500' : 'bg-primary'}`} />
                    <h4 className="font-semibold text-foreground mb-1 text-xs">{deadline.title}</h4>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" /> {deadline.timeText} &bull; {deadline.type}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  No upcoming deadlines.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {hasEnrollments && stats.streakCount > 0 ? (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-[10px] font-medium text-center">Fast Learner</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <Flame className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-[10px] font-medium text-center">Streak Active</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  No achievements earned yet.
                </div>
              )}
            </CardContent>
          </Card>
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
