import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, GraduationCap, FileText, CheckCircle2 } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch real statistics
  const [
    { count: studentCount },
    { count: mentorCount },
    { count: internshipCount },
    { count: assignmentCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'MENTOR'),
    supabase.from('internships').select('*', { count: 'exact', head: true }),
    supabase.from('assignments').select('*', { count: 'exact', head: true })
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time statistics from the Quantim Labs database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled across all programs</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mentorCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Supporting your students</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Internship Programs</CardTitle>
            <FileText className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{internshipCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Published courses</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assignmentCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks created for evaluation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system logs and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground p-8 text-center border border-dashed border-border rounded-lg bg-muted/50">
              Activity logging system will be integrated here.
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Database and API status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span className="text-sm font-medium">Supabase Connection</span>
                <span className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
                </span>
             </div>
             <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span className="text-sm font-medium">Storage Bucket</span>
                <span className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
                </span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
