"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Code2, LayoutDashboard, PlaySquare, FileText, CheckCircle, Award, Calendar, Settings, LogOut, ListTodo, BookOpen, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";

const baseSidebarLinks = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "My Courses", href: "/student/courses", icon: BookOpen },
  { name: "Lectures", href: "/student/lectures", icon: PlaySquare, badgeKey: "lectures" },
  { name: "Tasks", href: "/student/tasks", icon: ListTodo, badgeKey: "tasks" },
  { name: "Documents", href: "/student/documents", icon: FileText, badgeKey: "documents" },
  { name: "Assignments", href: "/student/assignments", icon: CheckCircle, badgeKey: "assignments" },
  { name: "Quizzes", href: "/student/quizzes", icon: CheckCircle, badgeKey: "quizzes" },
  { name: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { name: "Certificates", href: "/student/certificates", icon: Award },
  { name: "Calendar", href: "/student/calendar", icon: Calendar },
  { name: "Settings", href: "/student/settings", icon: Settings },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [pendingTasks, setPendingTasks] = useState(0);
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const [pendingQuizzes, setPendingQuizzes] = useState(0);
  const [pendingLectures, setPendingLectures] = useState(0);
  const [pendingDocuments, setPendingDocuments] = useState(0);

  useEffect(() => {
    async function loadBadges() {
      if (typeof window === "undefined") return;
      
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: enrollments } = await supabase
          .from('student_enrollments')
          .select('internship_id')
          .eq('student_id', user.id);

        const enrolled = enrollments ? enrollments.map(e => e.internship_id) : [];
        if (enrolled.length === 0) return;
        
        // Fetch all days for enrolled internships
        const { data: daysData } = await supabase
          .from('days')
          .select('id')
          .in('internship_id', enrolled);

        if (daysData && daysData.length > 0) {
          const dayIds = daysData.map(d => d.id);
          
          // Fetch assignments, quizzes, and tasks
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id, content_type')
            .in('day_id', dayIds)
            .in('content_type', ['ASSIGNMENT', 'QUIZ', 'TASK', 'VIDEO', 'DOCUMENT']);

          // Fetch progress from backend
          const { data: progressData } = await supabase
            .from('student_progress')
            .select('content_type, content_id')
            .eq('student_id', user.id);

          if (lessons) {
            const allTasks = lessons.filter(l => l.content_type === 'TASK').map(l => l.id);
            const allAssignments = lessons.filter(l => l.content_type === 'ASSIGNMENT').map(l => l.id);
            const allQuizzes = lessons.filter(l => l.content_type === 'QUIZ').map(l => l.id);
            const allLectures = lessons.filter(l => l.content_type === 'VIDEO').map(l => l.id);
            const allDocuments = lessons.filter(l => l.content_type === 'DOCUMENT').map(l => l.id);

            const completedTasks = progressData?.filter(p => p.content_type === 'TASK').map(p => p.content_id) || [];
            const completedAssign = progressData?.filter(p => p.content_type === 'ASSIGNMENT').map(p => p.content_id) || [];
            const completedQuizzes = progressData?.filter(p => p.content_type === 'QUIZ').map(p => p.content_id) || [];
            const completedLectures = progressData?.filter(p => p.content_type === 'LESSON').map(p => p.content_id) || [];
            const completedDocuments = progressData?.filter(p => p.content_type === 'DOCUMENT').map(p => p.content_id) || [];

            const pendingTaskCount = allTasks.filter(id => !completedTasks.includes(id)).length;
            const pendingAssignCount = allAssignments.filter(id => !completedAssign.includes(id)).length;
            const pendingQuizCount = allQuizzes.filter(id => !completedQuizzes.includes(id)).length;
            const pendingLectureCount = allLectures.filter(id => !completedLectures.includes(id)).length;
            const pendingDocumentCount = allDocuments.filter(id => !completedDocuments.includes(id)).length;

            setPendingTasks(pendingTaskCount);
            setPendingAssignments(pendingAssignCount);
            setPendingQuizzes(pendingQuizCount);
            setPendingLectures(pendingLectureCount);
            setPendingDocuments(pendingDocumentCount);
          }
        }
      } catch (e) {
        console.error("Failed to load badge counts", e);
      }
    }
    
    loadBadges();
    
    // We want to occasionally refresh badges if localStorage changes (very basic polling or listener)
    const interval = setInterval(loadBadges, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card  flex-shrink-0 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-1 group">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Quantim Labz Logo" 
                width={120} 
                height={32} 
                className="relative object-contain h-9 w-auto z-10 transition-transform duration-500 group-hover:scale-105" 
                style={{ filter: "brightness(0)" }}
                priority 
              />
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-3 transform rotate-12" />
            
            <div className="flex flex-col">
              <span className="text-xl font-heading font-black tracking-tighter text-slate-900 leading-none">
                QUANTIM<span className="text-blue-600">LABS</span>
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {baseSidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            
            let badgeCount = 0;
            if (link.badgeKey === "tasks") badgeCount = pendingTasks;
            if (link.badgeKey === "assignments") badgeCount = pendingAssignments;
            if (link.badgeKey === "quizzes") badgeCount = pendingQuizzes;
            if (link.badgeKey === "lectures") badgeCount = pendingLectures;
            if (link.badgeKey === "documents") badgeCount = pendingDocuments;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <link.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                  <span className="font-medium">{link.name}</span>
                </div>
                {badgeCount > 0 && (
                  <div className="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] rounded-full px-1">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="w-full justify-start text-muted-foreground border-border hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background relative">
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
