"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListTodo, CheckCircle, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";
import { useAttendance } from "@/hooks/useAttendance";

interface TaskItem {
  id: string;
  title: string;
  notes: string;
  status: "Pending" | "Completed";
}

export default function TasksPage() {
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  useAttendance(activeTrackId);

  useEffect(() => {
    async function loadData() {
      if (typeof window === "undefined") return;

      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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

        // Fetch all enrolled programs to build the tabs
        const { data: programsData } = await supabase
          .from('internships')
          .select('*')
          .in('id', enrolled);

        if (programsData) {
          setEnrolledPrograms(programsData);
          if (!activeTrackId && programsData.length > 0) {
            setActiveTrackId(programsData[0].id);
          }
        }

        const currentProgram = activeTrackId || (programsData && programsData.length > 0 ? programsData[0].id : null);
        if (!currentProgram) return;

        // Read completed items
        const { data: progressData } = await supabase
          .from('student_progress')
          .select('content_id')
          .eq('student_id', user.id)
          .eq('content_type', 'TASK');
          
        const completed = progressData ? progressData.map(p => p.content_id) : [];

        // Fetch all days for the active internship ONLY
        const { data: daysData } = await supabase
          .from('days')
          .select('id')
          .eq('internship_id', currentProgram);

        if (daysData && daysData.length > 0) {
          const dayIds = daysData.map(d => d.id);

          // Fetch tasks
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .in('day_id', dayIds)
            .eq('content_type', 'TASK');

          if (lessons) {
            const mappedTasks = lessons.map((l, index) => {
              const isPassed = completed.includes(l.id);

              return {
                id: l.id,
                title: l.title || `Task ${index + 1}`,
                notes: l.html_notes || "No additional instructions provided for this task.",
                status: isPassed ? "Completed" : "Pending",
              } as TaskItem;
            });

            setTasks(mappedTasks);

            if (mappedTasks.length > 0) {
              setActiveId(mappedTasks[0].id);
            } else {
              setTasks([]);
            }
          } else {
            setTasks([]);
          }
        } else {
          setTasks([]);
        }
      } catch (e) {
        console.error("Failed to load tasks", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeTrackId]);

  const activeTask = tasks.find((t) => t.id === activeId);

  const handleComplete = async () => {
    if (!activeTask) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('student_progress').insert({
      student_id: user.id,
      content_type: 'TASK',
      content_id: activeId
    });

    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: "Completed" } : t))
    );

    toast.success("Task marked as completed!");
  };

  const handleIncomplete = async () => {
    if (!activeTask) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('student_progress').delete()
      .eq('student_id', user.id)
      .eq('content_type', 'TASK')
      .eq('content_id', activeId);

    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: "Pending" } : t))
    );
  };

  if (loading) {
    return <FuturisticLoader text="Retrieving Active Tasks..." />;
  }

  if (!hasEnrollments) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <Card className="bg-card border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
            <ListTodo className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mb-2">No Active Tasks</CardTitle>
          <CardDescription className="max-w-md mx-auto mb-8 text-sm">
            You do not have any tasks active. Please enroll in an internship program first.
          </CardDescription>
          <Link href="/student/courses">
            <Button className="rounded-xl px-8 bg-primary text-primary-foreground hover:bg-primary/95 font-bold shadow-lg">
              Explore Programs
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-4xl font-heading font-extrabold tracking-tight">Active Tasks</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your required learning activities.
        </p>
      </header>

      {/* Glassmorphic Animated Dock */}
      {hasEnrollments && enrolledPrograms.length > 0 && (
        <div className="flex items-center justify-start mb-10 w-full relative z-10">
          <div className="relative flex p-1.5 rounded-full bg-background/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-x-auto no-scrollbar max-w-full">
            {enrolledPrograms.map((program) => {
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
                      layoutId="tasks-active-program-pill"
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
      )}

      {activeTask ? (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Tasks List */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-card border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${item.id === activeId
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border/60 hover:bg-muted/40"
                      }`}
                  >
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">{item.title}</h3>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Badge
                        variant={item.status === "Completed" ? "default" : "outline"}
                        className={
                          item.status === "Completed"
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "border-border text-muted-foreground"
                        }
                      >
                        {item.status}
                      </Badge>
                      <Target className={`w-4 h-4 ${item.id === activeId ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Task Instructions Panel */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl border border-border/60 bg-card/45 p-6 backdrop-blur-sm shadow-xl min-h-[500px]">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <ListTodo className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{activeTask.title}</h3>
                    <p className="text-xs text-muted-foreground">Reading / Task Item</p>
                  </div>
                </div>
                {activeTask.status === "Completed" && (
                  <Badge variant="outline" className="text-blue-400 border-blue-400/40 bg-blue-500/5 py-1 px-3 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Completed
                  </Badge>
                )}
              </div>

              {/* Task Content */}
              <div className="bg-slate-950/20 rounded-2xl border border-border/40 p-6 min-h-[300px]">
                <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: activeTask.notes }} />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/30 pt-6 mt-6">
              <span className="text-xs text-muted-foreground">
                Read the instructions thoroughly before marking as complete.
              </span>
              {activeTask.status === "Completed" ? (
                <Button onClick={handleIncomplete} variant="outline" className="rounded-xl px-6">
                  Mark as Pending
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 px-6 shadow-md"
                >
                  Mark as Completed
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No tasks loaded for active curriculum.
        </div>
      )}
      <SwitchProgramModal
        isOpen={!!switchTargetId}
        currentProgramName={enrolledPrograms.find(p => p.id === activeTrackId)?.title || ""}
        targetProgramName={enrolledPrograms.find(p => p.id === switchTargetId)?.title || ""}
        onConfirm={() => {
          if (switchTargetId) setActiveTrackId(switchTargetId);
          setSwitchTargetId(null);
        }}
        onCancel={() => setSwitchTargetId(null)}
      />
    </div>
  );
}
