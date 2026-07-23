import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface WeeklyLesson {
  id: string;
  title: string;
  contentType: string;
  dayId: string;
  completed: boolean;
  videoUrl?: string;
  documentUrl?: string;
  htmlNotes?: string;
  durationHours?: number;
  metadata?: any;
}

export interface WeeklyGroup {
  weekNumber: number;
  weekTitle: string;
  dayId: string;
  isUnlocked: boolean;
  unlocksAt: Date | null;
  lessons: WeeklyLesson[];
}

export interface WeeklyProgram {
  id: string;
  title: string;
  weeks: WeeklyGroup[];
  enrolledAt: Date;
}

interface UseWeeklyDataOptions {
  contentType: string;        // 'VIDEO' | 'DOCUMENT' | 'TASK' | 'ASSIGNMENT' | 'QUIZ'
  progressType: string;       // 'LESSON' | 'DOCUMENT' | 'TASK' | 'ASSIGNMENT' | 'QUIZ'
}

export function useWeeklyData({ contentType, progressType }: UseWeeklyDataOptions) {
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hasEnrollments, setHasEnrollments] = useState(false);

  const reload = async () => {
    if (typeof window === "undefined") return;
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch enrollments WITH enrolled_at for unlock timing
      const { data: enrollments, error: enrollError } = await supabase
        .from("student_enrollments")
        .select("internship_id, enrolled_at")
        .eq("student_id", user.id);

      const enrolled = enrollments?.map(e => e.internship_id) || [];
      if (enrolled.length === 0) { setHasEnrollments(false); setLoading(false); return; }
      setHasEnrollments(true);

      // Fetch completed progress
      const { data: progressData } = await supabase
        .from("student_progress")
        .select("content_id")
        .eq("student_id", user.id)
        .eq("content_type", progressType);
      const completedIds = new Set(progressData?.map(p => p.content_id) || []);

      // Fetch internships
      const { data: internships } = await supabase
        .from("internships")
        .select("id, title, duration_weeks")
        .in("id", enrolled);

      const assembled: WeeklyProgram[] = [];
      const now = new Date();

      for (const internship of internships || []) {
        const enrollment = enrollments?.find(e => e.internship_id === internship.id);
        const enrolledAt = enrollment?.enrolled_at ? new Date(enrollment.enrolled_at) : new Date();
        const daysSinceEnrollment = Math.floor((now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));

        // Fetch weeks (days) ordered
        const { data: days } = await supabase
          .from("days")
          .select("id, title, order_index")
          .eq("internship_id", internship.id)
          .order("order_index", { ascending: true });

        const weeks: WeeklyGroup[] = [];

        if (days && days.length > 0) {
          const dayIds = days.map(d => d.id);

          // Fetch lessons for this content type
          const { data: lessons } = await supabase
            .from("lessons")
            .select("*")
            .in("day_id", dayIds)
            .eq("content_type", contentType)
            .order("created_at", { ascending: true });

          days.forEach((day, index) => {
            const weekNumber = index + 1;
            const daysNeeded = (weekNumber - 1) * 7;
            const isUnlocked = daysSinceEnrollment >= daysNeeded;

            const unlocksAt = new Date(enrolledAt);
            unlocksAt.setDate(unlocksAt.getDate() + daysNeeded);

            const weekLessons = (lessons || [])
              .filter(l => l.day_id === day.id)
              .map(l => ({
                id: l.id,
                title: l.title || "Untitled",
                contentType: l.content_type,
                dayId: day.id,
                completed: completedIds.has(l.id),
                videoUrl: l.video_url || l.metadata?.video_url || l.metadata?.videoUrl || l.metadata?.url,
                documentUrl: l.metadata?.document_url || l.video_url,
                htmlNotes: l.html_notes,
                durationHours: l.duration_hours,
                metadata: l.metadata,
              }));

            weeks.push({
              weekNumber,
              weekTitle: day.title || `Week ${weekNumber}`,
              dayId: day.id,
              isUnlocked,
              unlocksAt: weekNumber === 1 ? null : unlocksAt,
              lessons: weekLessons,
            });
          });
        }

        const durationWeeks = internship.duration_weeks || 12;
        // Pad with placeholder weeks if the admin hasn't created days for the full duration
        for (let i = weeks.length; i < durationWeeks; i++) {
          const weekNumber = i + 1;
          const daysNeeded = (weekNumber - 1) * 7;
          const isUnlocked = daysSinceEnrollment >= daysNeeded;

          const unlocksAt = new Date(enrolledAt);
          unlocksAt.setDate(unlocksAt.getDate() + daysNeeded);

          weeks.push({
            weekNumber,
            weekTitle: `Week ${weekNumber}`,
            dayId: `placeholder-week-${internship.id}-${weekNumber}`,
            isUnlocked,
            unlocksAt: weekNumber === 1 ? null : unlocksAt,
            lessons: [],
          });
        }

        assembled.push({ id: internship.id, title: internship.title, weeks, enrolledAt });
      }

      setPrograms(assembled);
      if (assembled.length > 0 && !activeProgramId) {
        setActiveProgramId(assembled[0].id);
      }
    } catch (e) {
      console.error("useWeeklyData error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const markComplete = async (lessonId: string, programId: string, isComplete: boolean) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isComplete) {
      await supabase.from("student_progress").insert({ student_id: user.id, content_type: progressType, content_id: lessonId });
    } else {
      await supabase.from("student_progress").delete().eq("student_id", user.id).eq("content_type", progressType).eq("content_id", lessonId);
    }

    setPrograms(prev => prev.map(prog => {
      if (prog.id !== programId) return prog;
      return {
        ...prog,
        weeks: prog.weeks.map(week => ({
          ...week,
          lessons: week.lessons.map(l => l.id === lessonId ? { ...l, completed: isComplete } : l)
        }))
      };
    }));
  };

  const activeProgram = programs.find(p => p.id === activeProgramId);

  return { programs, activeProgramId, setActiveProgramId, activeProgram, loading, hasEnrollments, markComplete, reload };
}
