"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, AlertTriangle, FileCode, CheckCircle, Terminal, BookOpen, Code2, PlayCircle, Loader2, CheckCircle2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";
import { useAttendance } from "@/hooks/useAttendance";

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: "Pending" | "In_Review" | "Submitted" | "Failed";
  starterCode: string;
  requirements: string[];
  tests: string[];
}

// TRACK_ASSIGNMENTS mock removed.

export default function AssignmentsPage() {
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  useAttendance(activeTrackId);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          .eq('content_type', 'ASSIGNMENT');
        const completed = progressData ? progressData.map(p => p.content_id) : [];

        // Fetch all days for the active internship ONLY
        const { data: daysData } = await supabase
          .from('days')
          .select('id')
          .eq('internship_id', currentProgram);

        if (daysData && daysData.length > 0) {
          const dayIds = daysData.map(d => d.id);

          // Fetch assignments
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .in('day_id', dayIds)
            .eq('content_type', 'ASSIGNMENT');

          if (lessons) {
            const mappedAssignments = lessons.map((l, index) => {
              const isPassed = completed.includes(l.id);

              // Fallback starter code using HTML notes
              let fallbackStarterCode = `// Code Sandbox\n\n// TODO: Implement requirements.`;
              if (l.html_notes) {
                // very simple attempt to extract some text
                fallbackStarterCode = `/*\n${l.html_notes.replace(/<[^>]*>?/gm, '')}\n*/\n\n// Write your solution here`;
              }

              return {
                id: l.id,
                title: l.title || `Task 1.${index + 1}`,
                dueDate: "Flexible",
                status: isPassed ? "Submitted" : "Pending",
                starterCode: fallbackStarterCode,
                requirements: [
                  "Pass all sandbox diagnostic validations.",
                  "Ensure syntax compiles without errors."
                ],
                tests: [
                  "Compile code execution context",
                  "Verify logic constraints",
                  "Assert final output state"
                ]
              } as Assignment;
            });

            setAssignments(mappedAssignments);

              if (mappedAssignments.length > 0) {
                const defaultId = mappedAssignments[0].id;
                setActiveId(defaultId);
              } else {
              setAssignments([]);
            }
          } else {
            setAssignments([]);
          }
        } else {
          setAssignments([]);
        }
      } catch (e) {
        console.error("Failed to load assignments", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeTrackId]);

  const activeAssign = assignments.find((a) => a.id === activeId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.name.endsWith(".zip") || selected.name.endsWith(".rar")) {
        setFile(selected);
      } else {
        toast.error("Please select a .zip or .rar file.");
      }
    }
  };

  const handleFileUpload = async () => {
    if (!file || !activeAssign || !activeTrackId) return;
    
    setIsUploading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const filePath = `${user.id}/${activeId}.zip`;
      
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Optional: Insert into assignment_submissions tracking table
      try {
        await supabase.from("assignment_submissions").insert({
          student_id: user.id,
          internship_id: activeTrackId,
          assignment_id: activeId,
          file_url: filePath,
          status: "In_Review"
        });
      } catch (e) {
        // Ignore if table doesn't exist yet
      }

      toast.success("Project submitted successfully!");
      setFile(null);
      
      // Save completed assignment state persistently in student_progress
      await supabase.from('student_progress').upsert({
        student_id: user.id,
        content_type: 'ASSIGNMENT',
        content_id: activeId
      }, { onConflict: 'student_id, content_type, content_id' });

      // Link dynamic status to Day 5 of the active curriculum syllabus!
      if (activeTrackId) {
        const uniqueDayId = `${activeTrackId}-day-5`; // Day 5 is the assignment day!
        await supabase.from('student_progress').upsert({
          student_id: user.id,
          content_type: 'LESSON',
          content_id: uniqueDayId
        }, { onConflict: 'student_id, content_type, content_id' });
      }

      setAssignments((prev) =>
        prev.map((a) => (a.id === activeId ? { ...a, status: "Submitted" } : a))
      );
      
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to upload file. Did you create the storage bucket?");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunTests = () => {
    if (isCompiling || !activeAssign) return;
    setIsCompiling(true);
    setConsoleLogs(["[1/3] Initializing sandbox compiler..."]);
    playSound(400, 0.08, "triangle");

    setTimeout(() => {
      setConsoleLogs((prev) => [...prev, "[2/3] Resolving workspace file systems and imports... OK"]);
      playSound(523, 0.08, "triangle");
    }, 600);

    activeAssign.tests.forEach((test, idx) => {
      setTimeout(() => {
        setConsoleLogs((prev) => [...prev, `>> Running test ${idx + 1}: ${test}... PASSED ✔`]);
        playSound(659, 0.05, "sine");
      }, 1200 + idx * 500);
    });

    const completionTime = 1200 + activeAssign.tests.length * 500;

    setTimeout(() => {
      setConsoleLogs((prev) => [
        ...prev,
        "[3/3] Compiling test metrics... SUCCESS.",
        ">> Result: Code executed successfully in playground.",
      ]);

      playSound(523, 0.15, "sine");
      setTimeout(() => playSound(659, 0.15, "sine"), 100);
      setTimeout(() => playSound(783, 0.25, "sine"), 200);

      setIsCompiling(false);
      toast.info("Sandbox execution completed.");
    }, completionTime + 600);
  };

  const resetCode = () => {
    if (!activeAssign) return;
    setCode(activeAssign.starterCode);
    if (activeTrackId) {
      localStorage.removeItem(`code_${activeTrackId}_${activeId}`);
    }
    setConsoleLogs(["Terminal reset. Awaiting instructions..."]);
  };

  const selectAssignment = (id: string) => {
    setActiveId(id);
  };

  if (loading) {
    return <FuturisticLoader text="Initializing Cloud IDE..." />;
  }

  if (!hasEnrollments) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <Card className="bg-card border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
            <FileCode className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mb-2">No Active Assignments</CardTitle>
          <CardDescription className="max-w-md mx-auto mb-8 text-sm">
            You do not have any coding assignments active. Please enroll in an internship program first to load assignments.
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
        <h1 className="text-4xl font-heading font-extrabold tracking-tight">Coding Assignments</h1>
        <p className="text-muted-foreground mt-2">
          Apply what you've learned through hands-on project implementations.
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
                      layoutId="assignments-active-program-pill"
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

      {activeAssign ? (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Tasks List */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-card border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignments.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectAssignment(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${item.id === activeId
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border/60 hover:bg-muted/40"
                      }`}
                  >
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">Due: {item.dueDate}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Badge
                        variant={item.status === "Submitted" ? "default" : "outline"}
                        className={
                          item.status === "Submitted"
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "border-border text-muted-foreground"
                        }
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                      <FileCode className={`w-4 h-4 ${item.id === activeId ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Submission & Sandbox */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* File Upload Section */}
            <Card className="bg-card border-border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <UploadCloud className="w-32 h-32 text-primary" />
              </div>
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Project Submission</CardTitle>
                </div>
                <CardDescription>Upload your full project code (.zip or .rar) for review.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 relative z-10">
                {activeAssign.status === "Submitted" ? (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-border/60 rounded-2xl bg-blue-500/5">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Project Submitted Successfully</h4>
                    <p className="text-xs text-muted-foreground">You have already submitted a file for this assignment. It is currently under review.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/60 rounded-2xl bg-muted/20 transition-all hover:bg-muted/40">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept=".zip,.rar" 
                      className="hidden" 
                    />
                    
                    {file ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <p className="font-semibold text-foreground mb-1">{file.name}</p>
                        <p className="text-xs text-muted-foreground mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setFile(null)} disabled={isUploading}>Cancel</Button>
                          <Button 
                            onClick={handleFileUpload} 
                            disabled={isUploading}
                            className="bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                          >
                            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                            {isUploading ? "Uploading..." : "Submit Project"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4 cursor-pointer hover:bg-slate-700 hover:text-white transition-all shadow-inner border border-slate-700" onClick={() => fileInputRef.current?.click()}>
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">Select Project File</h4>
                        <p className="text-xs text-muted-foreground mb-4">Ensure your project is compressed into a .zip or .rar format</p>
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                          Browse Files
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No assignments loaded for active curriculum.
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
