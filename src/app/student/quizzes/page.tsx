"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Play, CheckCircle2, PlayCircle, Loader2, AlertCircle, HelpCircle, Trophy, RefreshCw, BookOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { SwitchProgramModal } from "@/components/student/SwitchProgramModal";
import { useAttendance } from "@/hooks/useAttendance";

interface Question {
  id: number;
  text: string;
  options: string[];
  answerIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  topic: string;
  duration: string;
  questionsCount: number;
  status: "Completed" | "Pending" | "Locked";
  score?: string;
  questions: Question[];
}

// QUIZZES_DATA mock removed.

export default function QuizzesPage() {
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string>("");
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  useAttendance(activeProgramId || "");

  const [started, setStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(0);

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
        setHasEnrollments(enrolled.length > 0);

        if (enrolled.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch all enrolled programs to build the tabs
        const { data: programsData } = await supabase
          .from('internships')
          .select('*')
          .in('id', enrolled);

        if (programsData) {
          setEnrolledPrograms(programsData);
          if (!activeProgramId && programsData.length > 0) {
            setActiveProgramId(programsData[0].id);
          }
        }

        const currentProgram = activeProgramId || (programsData && programsData.length > 0 ? programsData[0].id : null);
        if (!currentProgram) return;

        // Load persistent completed quizzes
        const { data: progressData } = await supabase
          .from('student_progress')
          .select('content_id')
          .eq('student_id', user.id)
          .eq('content_type', 'QUIZ');
        const completedQuizzes = progressData ? progressData.map(p => p.content_id) : [];

        // Fetch all days for the active internship ONLY
        const { data: daysData } = await supabase
          .from('days')
          .select('id')
          .eq('internship_id', currentProgram);

        if (daysData && daysData.length > 0) {
          const dayIds = daysData.map(d => d.id);

          // Fetch quizzes
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .in('day_id', dayIds)
            .eq('content_type', 'QUIZ');

          if (lessons) {
            const mappedQuizzes = lessons.map(l => {
              const questions = l.metadata?.questions || [];
              const mappedQuestions = questions.map((q: any, idx: number) => ({
                id: idx,
                text: q.text || q.question || "Unknown Question",
                options: q.options || ["True", "False"],
                answerIndex: q.answerIndex !== undefined ? q.answerIndex : 0
              }));

              const isCompleted = completedQuizzes.includes(l.id);
              const isLocked = false;

              return {
                id: l.id,
                title: l.title || "Module Quiz",
                topic: "General Evaluation",
                duration: l.duration_hours ? `${Math.round(l.duration_hours * 60)} mins` : "15 mins",
                questionsCount: mappedQuestions.length,
                status: isCompleted ? "Completed" : isLocked ? "Locked" : "Pending",
                questions: mappedQuestions
              } as Quiz;
            });
            setQuizzes(mappedQuizzes);
          } else {
            setQuizzes([]);
          }
        } else {
          setQuizzes([]);
        }
      } catch (e) {
        console.error("Failed to load quizzes", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeProgramId]);

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);

  const startQuiz = (id: string) => {
    setActiveQuizId(id);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setQuizScore(0);
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optionIndex
    }));
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQIndex < activeQuiz.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    }
  };

  const submitQuizAnswers = async () => {
    if (!activeQuiz || !activeQuizId) return;
    setIsSubmitting(true);

    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) {
        score++;
      }
    });

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const percentage = Math.round((score / activeQuiz.questions.length) * 100);

        // Save to backend database
        await supabase.from('quiz_submissions').insert([
          {
            student_id: user.id,
            quiz_id: activeQuizId,
            score: score,
            total_questions: activeQuiz.questions.length,
            percentage: percentage
          }
        ]);

        // Save completed quiz state persistently in student_progress
        await supabase.from('student_progress').upsert({
          student_id: user.id,
          content_type: 'QUIZ',
          content_id: activeQuizId
        }, { onConflict: 'student_id, content_type, content_id' });

        // Link dynamic status to Day 6 of the active curriculum syllabus!
        if (activeProgramId) {
          const uniqueDayId = `${activeProgramId}-day-6`; // Day 6 is the quiz day!
          await supabase.from('student_progress').upsert({
            student_id: user.id,
            content_type: 'LESSON',
            content_id: uniqueDayId
          }, { onConflict: 'student_id, content_type, content_id' });
        }
      }
    } catch (e) {
      console.error("Failed to save quiz submission to backend:", e);
    }

    setQuizScore(score);
    setIsSubmitted(true);
    setIsSubmitting(false);

    // Update status in the catalog list
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === activeQuizId
          ? {
            ...q,
            status: "Completed",
            score: `${Math.round((score / q.questions.length) * 100)}%`
          }
          : q
      )
    );
  };

  const closeQuizPlayer = () => {
    setActiveQuizId(null);
  };

  if (loading) {
    return <FuturisticLoader text="Loading Assessment Matrix..." />;
  }

  if (!hasEnrollments) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <Card className="bg-card border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mb-2">No Active Quizzes</CardTitle>
          <CardDescription className="max-w-md mx-auto mb-8 text-sm">
            You do not have any quizzes available. Please enroll in an internship program first to load evaluations.
          </CardDescription>
          <Link href="/programs">
            <Button className="rounded-xl px-8 bg-primary text-primary-foreground hover:bg-primary/95 font-bold shadow-lg">
              Explore Programs
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-4xl font-heading font-extrabold tracking-tight">Evaluations & Quizzes</h1>
        <p className="text-muted-foreground mt-2">
          Verify your knowledge in module-level tests and unlock future lessons.
        </p>
      </header>

      {/* Glassmorphic Animated Dock */}
      {hasEnrollments && enrolledPrograms.length > 0 && !activeQuizId && (
        <div className="flex items-center justify-start mb-10 w-full relative z-10">
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
                  className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center outline-none whitespace-nowrap min-w-fit z-20 ${isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="quizzes-active-program-pill"
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

      {activeQuizId && activeQuiz ? (
        /* Quiz Play Sandbox Mode */
        <Card className="bg-card border-border shadow-2xl max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">{activeQuiz.title}</CardTitle>
                <CardDescription>{activeQuiz.topic}</CardDescription>
              </div>
              <Badge variant="outline" className="text-primary border-primary/30">
                Question {currentQIndex + 1} of {activeQuiz.questions.length}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="py-8 space-y-6">
            {!isSubmitted ? (
              /* Question Option Selector */
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground leading-relaxed">
                  {activeQuiz.questions[currentQIndex].text}
                </h3>
                <div className="space-y-3">
                  {activeQuiz.questions[currentQIndex].options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQIndex] === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border/60 hover:bg-muted/40"
                          }`}
                      >
                        <span className="text-sm font-medium text-foreground">{option}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "border-primary bg-primary" : "border-border/80 group-hover:border-foreground"
                            }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Quiz Finish Report Score Card */
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Quiz Completed!</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    You scored <span className="font-bold text-foreground">{quizScore}</span> out of{" "}
                    <span className="font-bold text-foreground">{activeQuiz.questions.length}</span> (
                    {Math.round((quizScore / activeQuiz.questions.length) * 100)}%)
                  </p>
                </div>
                <div className="w-full max-w-md border border-border/40 rounded-2xl p-4 bg-muted/20 text-left text-xs space-y-2 mt-4">
                  <div className="font-bold text-foreground border-b border-border/30 pb-2 mb-2 uppercase tracking-wide">
                    Evaluation Details
                  </div>
                  {activeQuiz.questions.map((q, idx) => {
                    const isCorrect = selectedAnswers[idx] === q.answerIndex;
                    return (
                      <div key={q.id} className="flex justify-between items-start gap-3 py-1">
                        <span className="text-muted-foreground flex-1 truncate">{q.text}</span>
                        <Badge variant={isCorrect ? "default" : "outline"} className={isCorrect ? "bg-blue-500 text-white" : "text-destructive border-destructive/30"}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t border-border/40 pt-4 flex justify-between">
            {!isSubmitted ? (
              <>
                <Button onClick={prevQuestion} disabled={currentQIndex === 0} variant="outline" className="rounded-xl">
                  Previous
                </Button>
                {currentQIndex === activeQuiz.questions.length - 1 ? (
                  <Button
                    onClick={submitQuizAnswers}
                    disabled={selectedAnswers[currentQIndex] === undefined || isSubmitting}
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 px-6 gap-2"
                  >
                    {isSubmitting ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      "Submit Quiz"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={selectedAnswers[currentQIndex] === undefined}
                    className="rounded-xl px-6"
                  >
                    Next
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Retake button removed as per requirements */}
                <Button onClick={closeQuizPlayer} className="rounded-xl px-6">
                  Back to Dashboard
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ) : (
        /* Quiz Catalog Grid List */
        <div className="grid md:grid-cols-2 gap-8">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="bg-card border-border shadow-xl flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.topic}</CardDescription>
                  </div>
                  <Badge variant={quiz.status === "Completed" ? "default" : quiz.status === "Locked" ? "outline" : "secondary"}>
                    {quiz.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 font-mono">
                <div className="flex justify-between">
                  <span>Questions count:</span>
                  <span className="text-foreground font-semibold">{quiz.questionsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard duration:</span>
                  <span className="text-foreground font-semibold">{quiz.duration}</span>
                </div>
                {quiz.score && (
                  <div className="flex justify-between border-t border-border/20 pt-2 mt-2">
                    <span>Graded Score:</span>
                    <span className="text-blue-500 font-bold">{quiz.score}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-border/30 pt-4 mt-4">
                {quiz.status === "Locked" ? (
                  <Button disabled className="w-full rounded-xl flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Locked by Curriculum
                  </Button>
                ) : quiz.status === "Completed" ? (
                  <Button
                    disabled
                    className="w-full rounded-xl bg-muted text-muted-foreground flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Evaluation Completed
                  </Button>
                ) : (
                  <Button
                    onClick={() => startQuiz(quiz.id)}
                    className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Start Evaluation
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
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
