import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, ChevronRight, ClipboardList } from "lucide-react";

export const metadata = { title: "Evaluation | Admin" };

export default async function EvaluationPage() {
  const supabase = await createClient();

  // Fetch all internships
  const { data: internships } = await supabase
    .from('internships')
    .select('*')
    .order('created_at', { ascending: false });

  // For each internship, count enrolled students via student_progress table
  const enriched = await Promise.all(
    (internships || []).map(async (internship) => {
      const { data: days } = await supabase.from('days').select('id').eq('internship_id', internship.id);
      const dayIds = (days || []).map(d => d.id);

      let enrolledCount = 0;
      if (dayIds.length > 0) {
        const { data: lessons } = await supabase.from('lessons').select('id').in('day_id', dayIds);
        const lessonIds = (lessons || []).map(l => l.id);
        if (lessonIds.length > 0) {
          const { data: progress } = await supabase
            .from('student_progress')
            .select('student_id')
            .in('lesson_id', lessonIds);
          const unique = new Set((progress || []).map(p => p.student_id));
          enrolledCount = unique.size;
        }
      }

      return { ...internship, enrolledCount };
    })
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Evaluation Center</h1>
          </div>
          <p className="text-muted-foreground">
            Select an internship program to view student progress and evaluations.
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          {enriched.length} Programs
        </Badge>
      </div>

      {enriched.length === 0 ? (
        <Card className="p-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <CardTitle className="text-xl mb-2">No Programs Found</CardTitle>
          <CardDescription>Create internship programs first to use the evaluation center.</CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enriched.map((internship) => (
            <Card
              key={internship.id}
              className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <div className="h-1.5 bg-gradient-to-r from-primary to-blue-500 opacity-80" />
              <CardHeader className="pb-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                    {internship.category || "General"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {internship.level || "All Levels"}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {internship.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1 text-sm">
                  {internship.short_description || internship.description || "Comprehensive internship program."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                    <Users className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-muted-foreground">Students</p>
                      <p className="font-bold text-foreground text-base">{internship.enrolledCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-bold text-foreground text-base">{internship.duration_weeks || 12}w</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-5 pt-0">
                <Link href={`/admin/evaluation/${internship.id}`}>
                  <Button className="w-full rounded-xl font-semibold flex items-center gap-2">
                    View Students
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
