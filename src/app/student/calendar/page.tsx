"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock, Video, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";

interface CalendarEvent {
  id: string;
  title: string;
  date: number; // day of current month (Oct 2026)
  time: string;
  type: "Deadline" | "Mentor_Session" | "Lecture";
  mentor?: string;
  link?: string;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: "e1", title: "Task 1.1 Submission", date: 8, time: "11:59 PM", type: "Deadline" },
  { id: "e2", title: "Live Sync with Hashim Dawood", date: 10, time: "4:00 PM", type: "Mentor_Session", mentor: "Muhammad Hashim Dawood", link: "https://zoom.us/j/mock" },
  { id: "e3", title: "Dynamic Metadata Review", date: 15, time: "2:00 PM", type: "Lecture" },
  { id: "e4", title: "Final Capstone Pitch", date: 28, time: "6:00 PM", type: "Mentor_Session", mentor: "Ali Asghar", link: "https://zoom.us/j/mock2" }
];

export default function CalendarPage() {
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  
  // States for Booking Session
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingTopic, setBookingTopic] = useState("React Code Review");
  const [bookingMentor, setBookingMentor] = useState("Muhammad Hashim Dawood");

  useEffect(() => {
    async function loadEnrollments() {
      if (typeof window === "undefined") return;

      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: enrollments } = await supabase
          .from('student_enrollments')
          .select('internship_id')
          .eq('student_id', user.id);

        const enrolled = enrollments ? enrollments.map(e => e.internship_id) : [];
        setHasEnrollments(enrolled.length > 0);
      } catch (e) {
        console.error("Failed to load enrollments", e);
      } finally {
        setLoading(false);
      }
    }
    loadEnrollments();
  }, []);

  const selectedEvents = events.filter((e) => e.date === selectedDay);

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: CalendarEvent = {
      id: `booking-${Date.now()}`,
      title: bookingTopic,
      date: selectedDay,
      time: bookingTime,
      type: "Mentor_Session",
      mentor: bookingMentor,
      link: "https://zoom.us/j/mock-meeting"
    };

    setEvents((prev) => [...prev, newEvent]);
    setShowBookingForm(false);
    toast.success("Mentorship session successfully booked!");

    // Web Audio Synthesizer Beep
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {}
  };

  const daysInMonth = 31;
  const startOffset = 4; // empty cells at beginning of grid
  const gridCells = Array.from({ length: daysInMonth + startOffset });

  if (loading) {
    return <FuturisticLoader text="Syncing Temporal Data..." />;
  }

  if (!hasEnrollments) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <Card className="bg-card border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
            <CalendarDays className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mb-2">No Active Calendar</CardTitle>
          <CardDescription className="max-w-md mx-auto mb-8 text-sm">
            You do not have a course schedule. Please enroll in an internship program first to coordinate mentoring calls and deadlines.
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
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tight">Mentoring Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Schedule 1-on-1 code reviews and track assignment deadlines.
          </p>
        </div>
        <Button onClick={() => setShowBookingForm(true)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Book Mentor Session
        </Button>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl border border-border/60 bg-card/45 p-6 backdrop-blur-sm shadow-xl min-h-[500px]">
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
              <span className="font-bold text-base text-foreground">October 2026</span>
              <Badge variant="outline" className="text-primary border-primary/30">
                School Term Calendar
              </Badge>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Monthly Grid */}
            <div className="grid grid-cols-7 gap-2 flex-1">
              {gridCells.map((_, index) => {
                const isDayCell = index >= startOffset;
                const dayNumber = index - startOffset + 1;
                const isSelected = dayNumber === selectedDay;
                const dayEvents = events.filter((e) => e.date === dayNumber);
                const hasEvent = dayEvents.length > 0;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (isDayCell) setSelectedDay(dayNumber);
                    }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-2 text-xs border relative transition-all ${
                      !isDayCell
                        ? "border-transparent select-none pointer-events-none opacity-0"
                        : isSelected
                        ? "border-primary bg-primary/10 text-foreground cursor-pointer shadow-md font-bold"
                        : "border-border/40 hover:bg-muted/40 cursor-pointer text-muted-foreground/90 bg-slate-900/10"
                    }`}
                  >
                    {isDayCell && (
                      <>
                        <span className="text-foreground">{dayNumber}</span>
                        {hasEvent && (
                          <div className="flex gap-1 justify-center mt-1">
                            {dayEvents.map((e) => (
                              <div
                                key={e.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  e.type === "Deadline" ? "bg-red-400" : e.type === "Mentor_Session" ? "bg-blue-400 animate-pulse" : "bg-slate-400"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Schedule / Event Details */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          
          {/* Active Date Agenda Card */}
          <Card className="bg-card border-border shadow-xl flex-1 flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg">Agenda: Oct {selectedDay}</CardTitle>
              <CardDescription>Scheduled events and tasks for selected date.</CardDescription>
            </CardHeader>
            <CardContent className="py-4 space-y-4 flex-1 overflow-y-auto max-h-[300px]">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((e) => (
                  <div
                    key={e.id}
                    className={`p-3.5 rounded-2xl border relative overflow-hidden flex flex-col gap-2 ${
                      e.type === "Deadline"
                        ? "bg-red-500/5 border-red-500/20"
                        : e.type === "Mentor_Session"
                        ? "bg-blue-500/5 border-blue-500/20"
                        : "bg-muted/30 border-border/50"
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      e.type === "Deadline" ? "bg-red-400" : e.type === "Mentor_Session" ? "bg-blue-400" : "bg-slate-400"
                    }`} />
                    
                    <div className="flex justify-between items-start gap-2 pl-2">
                      <span className="font-bold text-xs text-foreground leading-tight">{e.title}</span>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                        {e.type.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pl-2 font-mono mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{e.time}</span>
                    </div>

                    {e.mentor && (
                      <div className="text-[10px] text-slate-300 pl-2 mt-1">
                        Mentor: <span className="font-semibold">{e.mentor}</span>
                      </div>
                    )}

                    {e.link && (
                      <a
                        href={e.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-400 pl-2 font-semibold hover:underline flex items-center gap-1 mt-1"
                      >
                        <Video className="w-3 h-3" /> Join Room
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-muted-foreground py-12">
                  <CalendarDays className="w-8 h-8 text-slate-500 mb-2 opacity-50" />
                  <span>No events scheduled for today.</span>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t border-border/30 pt-4 bg-muted/10">
              <Button onClick={() => setShowBookingForm(true)} variant="outline" className="w-full text-xs rounded-xl">
                Add Event
              </Button>
            </CardFooter>
          </Card>
        </div>

      </div>

      {/* Booking Dialog Overlay */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="bg-slate-900 border-2 border-primary/20 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-border/40">
              <CardTitle className="text-xl">Book Mentoring Call</CardTitle>
              <CardDescription>Schedule a call on October {selectedDay}.</CardDescription>
            </CardHeader>
            <form onSubmit={handleBookSession} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mentor">Select Mentor</Label>
                <select
                  id="mentor"
                  value={bookingMentor}
                  onChange={(e) => setBookingMentor(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-950 border border-border/50 text-xs px-3 text-slate-300 focus:outline-none focus:border-primary"
                >
                  <option value="Muhammad Hashim Dawood">Muhammad Hashim Dawood (Full Stack)</option>
                  <option value="Ali Asghar (AI Engineer)">Ali Asghar (AI Engineer)</option>
                  <option value="Muhammad Dawood (CMS & API)">Muhammad Dawood (CMS & API)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic of Discussion</Label>
                <select
                  id="topic"
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-950 border border-border/50 text-xs px-3 text-slate-300 focus:outline-none focus:border-primary"
                >
                  <option value="Next.js App Routing Code Review">Next.js App Routing Code Review</option>
                  <option value="Zustand State Management Help">Zustand State Management Help</option>
                  <option value="Career & Interview Mentoring">Career & Interview Mentoring</option>
                  <option value="AI Integration & Prompt Review">AI Integration & Prompt Review</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time slot</Label>
                <select
                  id="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-950 border border-border/50 text-xs px-3 text-slate-300 focus:outline-none focus:border-primary"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="4:30 PM">4:30 PM</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/20 mt-6">
                <Button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm Booking
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
