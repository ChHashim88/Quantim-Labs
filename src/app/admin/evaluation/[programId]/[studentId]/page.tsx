import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle, ClipboardCheck, Code2, HelpCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

export const metadata = { title: "Student Detail | Evaluation" };

interface Props {
  params: Promise<{ programId: string; studentId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

type TabKey = "videos" | "tasks" | "assignments" | "quizzes";

export default async function StudentDetailPage({ params, searchParams }: Props) {
  const { programId, studentId } = await params;
  const { tab = "videos" } = await searchParams;
  const activeTab = (["videos", "tasks", "assignments", "quizzes"].includes(tab) ? tab : "videos") as TabKey;

  const supabase = await createClient();

  const [{ data: internship }, { data: student }] = await Promise.all([
    supabase.from('internships').select('*').eq('id', programId).single(),
    supabase.from('profiles').select('*').eq('id', studentId).single(),
  ]);

  if (!internship || !student) notFound();

  // Get all days for this internship
  const { data: days } = await supabase.from('days').select('id, title, order_index').eq('internship_id', programId).order('order_index');
  const dayIds = (days || []).map(d => d.id);

  // Fetch all lessons
  let allLessons: any[] = [];
  if (dayIds.length > 0) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, content_type, duration_hours, day_id, metadata')
      .in('day_id', dayIds)
      .order('created_at');
    allLessons = lessons || [];
  }

  // Fetch this student's progress
  const lessonIds = allLessons.map(l => l.id);
  let progressMap: Record<string, any> = {};
  if (lessonIds.length > 0) {
    const { data: progress } = await supabase
      .from('student_progress')
      .select('lesson_id, completed, type, score, total')
      .eq('student_id', studentId)
      .in('lesson_id', lessonIds);
    for (const row of (progress || [])) {
      progressMap[row.lesson_id] = row;
    }
  }

  const videos = allLessons.filter(l => l.content_type === 'VIDEO');
  const tasks = allLessons.filter(l => l.content_type === 'TASK');
  const assignments = allLessons.filter(l => l.content_type === 'ASSIGNMENT');
  const quizzes = allLessons.filter(l => l.content_type === 'QUIZ');

  const tabs: { key: TabKey; label: string; icon: any; color: string; lessons: any[] }[] = [
    { key: "videos", label: "Videos", icon: PlayCircle, color: "text-blue-500", lessons: videos },
    { key: "tasks", label: "Tasks", icon: ClipboardCheck, color: "text-emerald-500", lessons: tasks },
    { key: "assignments", label: "Assignments", icon: Code2, color: "text-orange-500", lessons: assignments },
    { key: "quizzes", label: "Quizzes", icon: HelpCircle, color: "text-purple-500", lessons: quizzes },
  ];

  const currentTab = tabs.find(t => t.key === activeTab)!;

  // Overall stats
  const completedAll = allLessons.filter(l => progressMap[l.id]?.completed).length;
  const overallPct = allLessons.length > 0 ? Math.round((completedAll / allLessons.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      {/* Back */}
      <div>
        <Link href={`/admin/evaluation/${programId}`}>
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to {internship.title}
          </Button>
        </Link>

        {/* Student Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {student.first_name?.[0]}{student.last_name?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">{student.first_name} {student.last_name}</h1>
              <p className="text-muted-foreground text-sm">{student.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{internship.title}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-primary">{overallPct}%</p>
            <p className="text-xs text-muted-foreground">Overall Completion</p>
            <div className="mt-2 w-32 h-1.5 bg-muted rounded-full ml-auto">
              <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map(t => {
          const done = t.lessons.filter(l => progressMap[l.id]?.completed).length;
          const pct = t.lessons.length > 0 ? Math.round((done / t.lessons.length) * 100) : 0;
          return (
            <Link key={t.key} href={`/admin/evaluation/${programId}/${studentId}?tab=${t.key}`}>
              <Card className={`cursor-pointer transition-all hover:shadow-md ${activeTab === t.key ? 'border-primary shadow-md ring-1 ring-primary/30' : 'border-border'}`}>
                <CardContent className="py-4 px-4 flex items-center gap-3">
                  <t.icon className={`w-8 h-8 ${t.color} flex-shrink-0`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.label}</p>
                    <p className="font-bold text-lg">{done}<span className="text-muted-foreground font-normal text-sm">/{t.lessons.length}</span></p>
                    <p className={`text-xs font-semibold ${t.color}`}>{pct}%</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Detail Table */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <currentTab.icon className={`w-5 h-5 ${currentTab.color}`} />
            <CardTitle className="text-lg">{currentTab.label} Detail</CardTitle>
            <Badge variant="outline">{currentTab.lessons.length} items</Badge>
          </div>
          <CardDescription>
            {currentTab.lessons.filter(l => progressMap[l.id]?.completed).length} of {currentTab.lessons.length} completed
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {currentTab.lessons.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">No {currentTab.label.toLowerCase()} in this program yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {currentTab.lessons.map((lesson, idx) => {
                const prog = progressMap[lesson.id];
                const isCompleted = prog?.completed === true;
                return (
                  <div key={lesson.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-mono text-muted-foreground flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{lesson.title}</p>
                        {lesson.duration_hours && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {Math.round(lesson.duration_hours * 60)} mins
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeTab === "quizzes" && isCompleted && prog.score !== undefined && (
                        <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/10 text-xs">
                          {prog.score}/{prog.total} — {prog.total > 0 ? Math.round((prog.score / prog.total) * 100) : 0}%
                        </Badge>
                      )}
                      {isCompleted ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground flex items-center gap-1.5">
                          <XCircle className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
