import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle, ClipboardCheck, Code2, HelpCircle, ChevronRight, User } from "lucide-react";

export const metadata = { title: "Program Students | Evaluation" };

interface Props {
  params: Promise<{ programId: string }>;
}

export default async function ProgramEvaluationPage({ params }: Props) {
  const { programId } = await params;
  const supabase = await createClient();

  // Fetch internship
  const { data: internship } = await supabase.from('internships').select('*').eq('id', programId).single();
  if (!internship) notFound();

  // Fetch all days and lessons for this program
  const { data: days } = await supabase.from('days').select('id').eq('internship_id', programId);
  const dayIds = (days || []).map(d => d.id);

  let allLessons: any[] = [];
  if (dayIds.length > 0) {
    const { data: lessons } = await supabase.from('lessons').select('id, title, content_type').in('day_id', dayIds);
    allLessons = lessons || [];
  }

  const videoLessons = allLessons.filter(l => l.content_type === 'VIDEO');
  const taskLessons = allLessons.filter(l => l.content_type === 'TASK');
  const assignmentLessons = allLessons.filter(l => l.content_type === 'ASSIGNMENT');
  const quizLessons = allLessons.filter(l => l.content_type === 'QUIZ');
  const allLessonIds = allLessons.map(l => l.id);

  // Get all student progress for this program's lessons
  let progressRows: any[] = [];
  if (allLessonIds.length > 0) {
    const { data: progress } = await supabase
      .from('student_progress')
      .select('student_id, lesson_id, completed, type, score, total')
      .in('lesson_id', allLessonIds)
      .eq('completed', true);
    progressRows = progress || [];
  }

  // Get unique student IDs
  const studentIds = [...new Set(progressRows.map(p => p.student_id))];

  // Fetch student profiles
  const { data: profiles } = studentIds.length > 0
    ? await supabase.from('profiles').select('id, first_name, last_name, email, avatar_url').in('id', studentIds)
    : { data: [] };

  // Build per-student stats
  const students = (profiles || []).map(profile => {
    const studentProgress = progressRows.filter(p => p.student_id === profile.id);
    const completedIds = new Set(studentProgress.map(p => p.lesson_id));

    const videosCompleted = videoLessons.filter(l => completedIds.has(l.id)).length;
    const tasksCompleted = taskLessons.filter(l => completedIds.has(l.id)).length;
    const assignmentsCompleted = assignmentLessons.filter(l => completedIds.has(l.id)).length;
    const quizzesCompleted = quizLessons.filter(l => completedIds.has(l.id)).length;

    const totalItems = allLessons.length;
    const totalCompleted = videosCompleted + tasksCompleted + assignmentsCompleted + quizzesCompleted;
    const overallPct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

    return {
      ...profile,
      videosCompleted, videosTotal: videoLessons.length,
      tasksCompleted, tasksTotal: taskLessons.length,
      assignmentsCompleted, assignmentsTotal: assignmentLessons.length,
      quizzesCompleted, quizzesTotal: quizLessons.length,
      overallPct
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back + Header */}
      <div>
        <Link href="/admin/evaluation">
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Programs
          </Button>
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">{internship.title}</h1>
            <p className="text-muted-foreground mt-1">
              Student evaluation roster — {students.length} enrolled student{students.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2">
            {videoLessons.length}v · {taskLessons.length}t · {assignmentLessons.length}a · {quizLessons.length}q
          </Badge>
        </div>
      </div>

      {students.length === 0 ? (
        <Card className="p-16 text-center">
          <User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <CardTitle className="text-xl mb-2">No Students Yet</CardTitle>
          <p className="text-muted-foreground text-sm">No students have submitted progress for this program yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {students.map(student => (
            <Card key={student.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all">
              <CardContent className="py-4 px-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{student.first_name} {student.last_name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>

                  {/* 4 Metric Badges — clickable */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link href={`/admin/evaluation/${programId}/${student.id}?tab=videos`}>
                      <button className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-full px-4 py-1.5 transition-colors group">
                        <PlayCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-500">{student.videosCompleted}/{student.videosTotal}</span>
                        <span className="text-xs text-muted-foreground">Videos</span>
                      </button>
                    </Link>
                    <Link href={`/admin/evaluation/${programId}/${student.id}?tab=tasks`}>
                      <button className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-full px-4 py-1.5 transition-colors group">
                        <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-500">{student.tasksCompleted}/{student.tasksTotal}</span>
                        <span className="text-xs text-muted-foreground">Tasks</span>
                      </button>
                    </Link>
                    <Link href={`/admin/evaluation/${programId}/${student.id}?tab=assignments`}>
                      <button className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-full px-4 py-1.5 transition-colors group">
                        <Code2 className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-semibold text-orange-500">{student.assignmentsCompleted}/{student.assignmentsTotal}</span>
                        <span className="text-xs text-muted-foreground">Assignments</span>
                      </button>
                    </Link>
                    <Link href={`/admin/evaluation/${programId}/${student.id}?tab=quizzes`}>
                      <button className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-full px-4 py-1.5 transition-colors group">
                        <HelpCircle className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-purple-500">{student.quizzesCompleted}/{student.quizzesTotal}</span>
                        <span className="text-xs text-muted-foreground">Quizzes</span>
                      </button>
                    </Link>
                  </div>

                  {/* Overall % + Detail link */}
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{student.overallPct}%</p>
                      <p className="text-xs text-muted-foreground">Overall</p>
                    </div>
                    <Link href={`/admin/evaluation/${programId}/${student.id}`}>
                      <Button size="sm" variant="outline" className="rounded-xl">
                        Detail <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${student.overallPct}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
