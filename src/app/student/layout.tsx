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
  { name: "InternShip Program", href: "/student/courses", icon: BookOpen },
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
          .select('internship_id, enrolled_at')
          .eq('student_id', user.id);

        const enrolledMap = new Map<string, Date>();
        if (enrollments) {
          enrollments.forEach(e => {
            enrolledMap.set(e.internship_id, new Date(e.enrolled_at || new Date()));
          });
        }
        const enrolled = Array.from(enrolledMap.keys());
        if (enrolled.length === 0) return;

        // Fetch all days with order_index for enrolled internships
        const { data: daysData } = await supabase
          .from('days')
          .select('id, internship_id, order_index')
          .in('internship_id', enrolled)
          .order('order_index', { ascending: true });

        if (daysData && daysData.length > 0) {
          const now = new Date();
          const unlockedDayIds = new Set<string>();

          const daysByInternship: Record<string, any[]> = {};
          daysData.forEach(d => {
            if (!daysByInternship[d.internship_id]) daysByInternship[d.internship_id] = [];
            daysByInternship[d.internship_id].push(d);
          });

          Object.keys(daysByInternship).forEach(internshipId => {
            const enrolledAt = enrolledMap.get(internshipId)!;
            const daysSinceEnrollment = Math.floor((now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));

            daysByInternship[internshipId].forEach((day, index) => {
              const weekNumber = index + 1;
              const daysNeeded = (weekNumber - 1) * 7;
              if (daysSinceEnrollment >= daysNeeded) {
                unlockedDayIds.add(day.id);
              }
            });
          });

          // Fetch assignments, quizzes, and tasks only from UNLOCKED days
          const dayIdsArr = Array.from(unlockedDayIds);
          if (dayIdsArr.length === 0) {
            setPendingTasks(0);
            setPendingAssignments(0);
            setPendingQuizzes(0);
            setPendingLectures(0);
            setPendingDocuments(0);
            return;
          }

          const { data: lessons } = await supabase
            .from('lessons')
            .select('id, content_type')
            .in('day_id', dayIdsArr)
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
    <div className="bg-background text-foreground min-h-screen overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar: Command Strip */}
      <aside className="!fixed left-0 top-0 h-full w-[80px] lg:w-[240px] glass-panel border-r border-border z-50 flex flex-col items-center lg:items-stretch transition-all duration-500">

        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 mb-8 mt-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={56}
            height={56}
            className="w-14 h-14 object-contain shrink-0"
            priority
          />
          <span className="hidden lg:block -ml-3 font-heading font-extrabold tracking-tighter text-lg uppercase ">Uantim Labz</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar w-full">
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
                className={`group flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg transition-all relative ${isActive
                  ? "bg-primary/10 text-primary active-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
              >
                <link.icon className="w-5 h-5 shrink-0" />
                <span className="hidden lg:block text-xs font-mono tracking-wider truncate uppercase">
                  {link.name}
                </span>

                {badgeCount > 0 && (
                  <>
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full glow-primary lg:hidden" />
                    <span className={`hidden lg:flex ml-auto text-[10px] font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto w-full">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg text-muted-foreground hover:text-destructive transition-all group"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:text-destructive" />
            <span className="hidden lg:block text-xs font-mono tracking-wider uppercase">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="ml-[80px] lg:ml-[240px] h-screen overflow-y-auto custom-scrollbar relative grid-bg">
        <div className="relative z-10 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
