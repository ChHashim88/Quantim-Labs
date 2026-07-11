"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, ChevronRight, FileText, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";
import { useAttendance } from "@/hooks/useAttendance";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  dayNumber: number;
  status: "Pending" | "Completed";
  documentUrl: string;
}

export default function DocumentsPage() {
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
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

        const { data: progressData } = await supabase
          .from('student_progress')
          .select('content_id')
          .eq('student_id', user.id)
          .eq('content_type', 'DOCUMENT');
          
        const completed = progressData ? progressData.map(p => p.content_id) : [];

        const { data: daysData } = await supabase
          .from('days')
          .select('id, title')
          .eq('internship_id', currentProgram);

        if (daysData && daysData.length > 0) {
          const dayIds = daysData.map(d => d.id);
          const dayMap = Object.fromEntries(daysData.map(d => [d.id, d.title]));

          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .in('day_id', dayIds)
            .eq('content_type', 'DOCUMENT');

          if (lessons) {
            const mappedDocuments = lessons.map((l, index) => {
              const isPassed = completed.includes(l.id);

              return {
                id: l.id,
                title: l.title || `Document ${index + 1}`,
                dayNumber: dayMap[l.day_id] ? parseInt(dayMap[l.day_id].replace("Day ", "")) || index + 1 : index + 1,
                status: isPassed ? "Completed" : "Pending",
                description: l.html_notes || "No description provided.",
                documentUrl: l.metadata?.document_url || l.video_url || ""
              } as DocumentItem;
            });

            mappedDocuments.sort((a, b) => a.dayNumber - b.dayNumber);

            setDocuments(mappedDocuments);
            if (mappedDocuments.length > 0 && !activeId) {
              setActiveId(mappedDocuments[0].id);
            }
          } else {
            setDocuments([]);
          }
        } else {
          setDocuments([]);
        }
      } catch (e) {
        console.error("Failed to load documents", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeTrackId]);

  const activeDocument = documents.find((d) => d.id === activeId);

  const handleComplete = async () => {
    if (!activeDocument) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('student_progress').insert({
      student_id: user.id,
      content_type: 'DOCUMENT',
      content_id: activeId
    });

    setDocuments((prev) =>
      prev.map((d) => (d.id === activeId ? { ...d, status: "Completed" } : d))
    );

    toast.success("Document marked as read!");
  };

  const handleIncomplete = async () => {
    if (!activeDocument) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('student_progress').delete()
      .eq('student_id', user.id)
      .eq('content_type', 'DOCUMENT')
      .eq('content_id', activeId);

    setDocuments((prev) =>
      prev.map((d) => (d.id === activeId ? { ...d, status: "Pending" } : d))
    );
  };

  if (loading) {
    return <FuturisticLoader text="Retrieving Materials..." />;
  }

  if (!hasEnrollments) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <Card className="bg-card border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mb-2">No Active Materials</CardTitle>
          <CardDescription className="max-w-md mx-auto mb-8 text-sm">
            You do not have any active documents. Please enroll in an internship program first.
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
        <h1 className="text-4xl font-heading font-extrabold tracking-tight">Required Reading</h1>
        <p className="text-muted-foreground mt-2">
          Access and review your course documentation.
        </p>
      </header>

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

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 bg-card border border-border shadow-xl rounded-2xl flex flex-col h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Required Reading
            </h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {documents.filter(d => d.status === "Completed").length} / {documents.length} Done
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {documents.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No documents loaded for active curriculum.
              </div>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveId(doc.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeId === doc.id
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold text-sm ${activeId === doc.id ? "text-primary" : "text-foreground"}`}>
                      {doc.title}
                    </h3>
                    {doc.status === "Completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider">Day {doc.dayNumber}</Badge>
                    <span className={doc.status === "Completed" ? "text-green-500 font-medium" : ""}>
                      {doc.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)]">
          {activeDocument ? (
            <div className="flex-1 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading">{activeDocument.title}</h2>
                    <p className="text-sm text-muted-foreground">Day {activeDocument.dayNumber} &bull; Required Reading</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-3xl space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 border-b border-border/50 pb-2">Instructions</h3>
                    <div 
                      className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: activeDocument.description }}
                    />
                  </div>

                  {activeDocument.documentUrl && (
                    <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-1 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] dark:bg-grid-white/5" />
                      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 rounded-xl bg-card/40 backdrop-blur-md p-6">
                        <div className="flex items-center gap-5 text-center sm:text-left">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-primary/20 border border-blue-500/20 text-blue-500 shadow-inner group-hover:scale-105 transition-transform duration-500">
                            <FileText className="h-8 w-8" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold tracking-tight text-foreground">Course Material</h4>
                            <p className="text-sm text-muted-foreground">PDF Document &bull; Opens in a new tab</p>
                          </div>
                        </div>
                        <Button 
                          asChild 
                          size="lg"
                          className="w-full sm:w-auto gap-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <a href={activeDocument.documentUrl} target="_blank" rel="noreferrer">
                            <Download className="w-5 h-5" /> 
                            <span className="font-semibold">Access PDF</span>
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-border/40 bg-muted/20">
                <div className="flex items-center justify-between max-w-3xl">
                  <p className="text-sm text-muted-foreground">Mark this document as read once you have completed it.</p>
                  <Button
                    size="lg"
                    onClick={activeDocument.status === "Completed" ? handleIncomplete : handleComplete}
                    variant={activeDocument.status === "Completed" ? "outline" : "default"}
                    className={`rounded-xl px-8 shadow-md gap-2 ${
                      activeDocument.status === "Completed" 
                        ? "border-green-500/30 text-green-500 hover:bg-green-500/10" 
                        : ""
                    }`}
                  >
                    {activeDocument.status === "Completed" ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Read
                      </>
                    ) : (
                      <>
                        Mark as Read <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-muted-foreground bg-card/20 rounded-2xl border border-border/50">
              <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p>Select a document from the left to view details.</p>
            </div>
          )}
        </div>
      </div>
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
