"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2, ChevronDown, ChevronRight, Calendar, Clock } from "lucide-react";
import { WeeklyGroup } from "@/hooks/useWeeklyData";

interface WeeklySidebarProps {
  weeks: WeeklyGroup[];
  activeId: string;
  onSelect: (lessonId: string) => void;
}

const formatUnlockDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const getDaysRemaining = (unlocksAt: Date | null) => {
  if (!unlocksAt) return 0;
  const now = new Date();
  const diffTime = unlocksAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export function WeeklySidebar({ weeks, activeId, onSelect }: WeeklySidebarProps) {
  // By default expand ALL unlocked weeks so their content is immediately visible
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    weeks.forEach(w => {
      if (w.isUnlocked) initial.add(w.dayId);
    });
    return initial;
  });

  const toggle = (dayId: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const nextLockedWeek = weeks.find(w => !w.isUnlocked && w.unlocksAt);
  const nextDaysLeft = nextLockedWeek ? getDaysRemaining(nextLockedWeek.unlocksAt) : null;

  return (
    <div className="glass-panel p-5 h-full">
      <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1 flex items-center gap-2">
        <span className="w-1 h-1 bg-primary"></span> SYLLABUS_GRID
      </h4>
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-5 border-b border-border/20 pb-4">
        WEEK-BY-WEEK — UNLOCKS EVERY 7 DAYS
      </p>

      <div className="space-y-2 overflow-y-auto max-h-[70vh] pr-1">
        {weeks.map((week) => {
          const isExpanded = expandedWeeks.has(week.dayId);
          const completedCount = week.lessons.filter(l => l.completed).length;
          const hasActive = week.lessons.some(l => l.id === activeId);
          const allDone = week.lessons.length > 0 && completedCount === week.lessons.length;
          const daysLeft = getDaysRemaining(week.unlocksAt);

          return (
            <div key={week.dayId}>
              {/* ── Week Header ── */}
              <button
                onClick={() => week.isUnlocked && toggle(week.dayId)}
                disabled={!week.isUnlocked}
                className={`w-full flex items-center justify-between p-3 rounded-sm border text-xs transition-all ${
                  !week.isUnlocked
                    ? "cursor-not-allowed border-border/30 bg-background/30 opacity-70"
                    : hasActive
                    ? "border-primary/60 bg-primary/5 cursor-pointer"
                    : "border-border/40 bg-background/40 hover:border-primary/30 hover:bg-muted/20 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {/* Status icon */}
                  {!week.isUnlocked ? (
                    <div className="w-5 h-5 rounded-sm border border-border/40 bg-muted/30 flex items-center justify-center shrink-0">
                      <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
                    </div>
                  ) : allDone ? (
                    <CheckCircle2 className="w-4 h-4 text-primary glow-primary shrink-0" />
                  ) : (
                    <div className={`w-5 h-5 rounded-sm border flex items-center justify-center text-[7px] font-bold shrink-0 ${
                      hasActive ? "border-primary text-primary bg-primary/10" : "border-border/60 text-muted-foreground bg-muted/20"
                    }`}>
                      W{week.weekNumber}
                    </div>
                  )}

                  {/* Week label */}
                  <div className="text-left overflow-hidden">
                    <span className={`font-mono text-[10px] uppercase tracking-widest block truncate max-w-[150px] ${
                      !week.isUnlocked
                        ? "text-muted-foreground/50"
                        : hasActive
                        ? "text-primary font-bold"
                        : "text-foreground"
                    }`}>
                      {week.weekTitle}
                    </span>

                    {!week.isUnlocked && week.unlocksAt ? (
                      <span className="text-[8px] font-mono uppercase tracking-widest text-primary/90 flex items-center gap-1 mt-0.5 truncate max-w-[130px] sm:max-w-none">
                        <Clock className="w-2.5 h-2.5 text-primary shrink-0" /> UNLOCKS IN {daysLeft} {daysLeft === 1 ? "DAY" : "DAYS"} ({formatUnlockDate(week.unlocksAt)})
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-0.5 block truncate">
                        {completedCount}/{week.lessons.length} DONE
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand/collapse chevron for unlocked weeks */}
                {week.isUnlocked && (
                  isExpanded
                    ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 ml-1" />
                    : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 ml-1" />
                )}
              </button>

              {/* ── Lessons under this week (only for unlocked + expanded) ── */}
              <AnimatePresence>
                {week.isUnlocked && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 mb-2 space-y-1 pl-2 sm:pl-3 border-l-2 border-primary/20 ml-2 sm:ml-4">
                      {week.lessons.length === 0 ? (
                        <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 py-2.5 pl-2">
                          NO CONTENT YET
                        </p>
                      ) : (
                        week.lessons.map((lesson) => {
                          const isActive = lesson.id === activeId;
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => onSelect(lesson.id)}
                              className={`flex items-center justify-between p-2 sm:p-2.5 rounded-sm border text-xs transition-all cursor-pointer max-w-full overflow-hidden ${
                                isActive
                                  ? "border-primary/50 bg-primary/8 active-glow"
                                  : "border-border/20 hover:bg-muted/30 hover:border-primary/20"
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                                {lesson.completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary glow-primary shrink-0" />
                                ) : (
                                  <div className={`w-3.5 h-3.5 rounded-sm border shrink-0 ${isActive ? "border-primary/60" : "border-border/50"}`} />
                                )}
                                <span className={`font-mono text-[9px] uppercase tracking-widest truncate max-w-[110px] xs:max-w-[130px] sm:max-w-[140px] ${
                                  isActive ? "text-primary font-bold" : lesson.completed ? "text-foreground/60" : "text-foreground/80"
                                }`}>
                                  {lesson.title}
                                </span>
                              </div>

                              {/* Duration badge for videos */}
                              {lesson.durationHours && (
                                <span className="text-[8px] font-mono tracking-widest border border-border/30 px-1.5 py-0.5 rounded-sm shrink-0 text-muted-foreground ml-2">
                                  {Math.round(lesson.durationHours * 60)}m
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
