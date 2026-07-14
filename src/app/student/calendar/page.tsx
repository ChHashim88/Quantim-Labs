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
        <div className="glass-panel border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <CalendarDays className="w-64 h-64 text-primary" />
          </div>
          <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 glow-primary">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight mb-2 uppercase">NO ACTIVE CALENDAR</h2>
          <p className="max-w-md mx-auto mb-8 text-xs font-mono tracking-widest text-muted-foreground uppercase">
            SYSTEM RECORDS INDICATE NO SCHEDULED EVENTS. PLEASE INITIALIZE AN INTERNSHIP PROGRAM TO COORDINATE MENTORING AND DEADLINES.
          </p>
          <Link href="/programs">
            <Button className="rounded-sm px-8 py-6 h-auto text-xs font-mono font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              EXPLORE PROGRAMS
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">MENTORING CALENDAR</h1>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2">
            <span className="w-1 h-1 bg-primary"></span> SCHEDULE 1-ON-1 CODE REVIEWS AND TRACK DEADLINES
          </p>
        </div>
        <Button onClick={() => setShowBookingForm(true)} className="rounded-sm px-8 py-6 h-auto bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 glow-primary transition-all duration-300">
          <Plus className="w-4 h-4" />
          BOOK_SESSION
        </Button>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-8 flex flex-col justify-between glass-panel corner-accent p-8 min-h-[500px]">
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-6 mb-8">
              <span className="font-heading font-bold text-2xl uppercase tracking-tight text-foreground">OCTOBER 2026</span>
              <div className="text-[9px] font-mono tracking-widest uppercase bg-primary/10 text-primary border border-primary/30 px-3 py-1.5 rounded-sm glow-primary">
                SCHOOL_TERM_CALENDAR
              </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-4 uppercase">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Monthly Grid */}
            <div className="grid grid-cols-7 gap-3 flex-1">
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
                    className={`aspect-square rounded-sm flex flex-col items-center justify-between p-2 font-mono text-xs border relative transition-all ${
                      !isDayCell
                        ? "border-transparent select-none pointer-events-none opacity-0"
                        : isSelected
                        ? "border-primary bg-primary/10 text-primary cursor-pointer shadow-md font-bold glow-primary active-glow"
                        : "border-border/40 hover:border-primary/50 cursor-pointer text-muted-foreground/70 grid-bg"
                    }`}
                  >
                    {isDayCell && (
                      <>
                        <span className={isSelected ? "text-primary" : "text-foreground"}>{dayNumber}</span>
                        {hasEvent && (
                          <div className="flex gap-1.5 justify-center mt-1">
                            {dayEvents.map((e) => (
                              <div
                                key={e.id}
                                className={`w-1.5 h-1.5 rounded-sm ${
                                  e.type === "Deadline" ? "bg-red-500 glow-red" : e.type === "Mentor_Session" ? "bg-blue-500 glow-blue animate-pulse" : "bg-primary glow-primary"
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
          <div className="glass-panel corner-accent flex-1 flex flex-col justify-between">
            <div className="p-6 border-b border-border/40 mb-2">
              <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary mb-2 flex items-center gap-2 glow-primary">
                <span className="w-1 h-1 bg-primary"></span> AGENDA: OCT {selectedDay}
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">SCHEDULED EVENTS FOR SELECTED DATE.</p>
            </div>
            <div className="px-6 pb-4 space-y-4 flex-1 overflow-y-auto max-h-[300px]">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((e) => (
                  <div
                    key={e.id}
                    className={`p-4 rounded-sm border relative overflow-hidden flex flex-col gap-2 transition-all ${
                      e.type === "Deadline"
                        ? "bg-red-500/5 border-red-500/20 hover:border-red-500/50"
                        : e.type === "Mentor_Session"
                        ? "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/50"
                        : "grid-bg border-border/40 hover:border-border/80"
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      e.type === "Deadline" ? "bg-red-500 glow-red" : e.type === "Mentor_Session" ? "bg-blue-500 glow-blue" : "bg-primary glow-primary"
                    }`} />
                    
                    <div className="flex justify-between items-start gap-2 pl-3">
                      <span className="font-mono text-xs uppercase tracking-widest font-bold text-foreground leading-tight">{e.title}</span>
                      <div className={`text-[9px] font-mono tracking-widest uppercase border px-2 py-0.5 rounded-sm ${
                        e.type === "Deadline" ? "border-red-500/30 text-red-500" : e.type === "Mentor_Session" ? "border-blue-500/30 text-blue-500" : "border-primary/30 text-primary"
                      }`}>
                        {e.type.replace("_", " ")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-3 font-mono tracking-widest uppercase mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{e.time}</span>
                    </div>

                    {e.mentor && (
                      <div className="text-[10px] text-muted-foreground pl-3 font-mono tracking-widest uppercase mt-2 border-t border-border/20 pt-2">
                        MENTOR: <span className="font-bold text-foreground">{e.mentor}</span>
                      </div>
                    )}

                    {e.link && (
                      <a
                        href={e.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-400 pl-3 font-mono tracking-widest uppercase font-bold hover:text-blue-300 transition-colors flex items-center gap-2 mt-2"
                      >
                        <Video className="w-3.5 h-3.5" /> INITIATE_CONNECTION
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center font-mono text-[10px] tracking-widest uppercase text-muted-foreground py-12">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/30 mb-4" />
                  <span>NO_EVENTS_DETECTED</span>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-border/30 bg-muted/5">
              <Button onClick={() => setShowBookingForm(true)} variant="outline" className="w-full rounded-sm font-mono text-[10px] tracking-widest uppercase font-bold border-border/50 text-foreground hover:bg-primary/10 hover:text-primary transition-all">
                ADD_CUSTOM_EVENT
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Booking Dialog Overlay */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="glass-panel corner-accent border-primary/30 p-8 max-w-md w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary glow-primary" />
            <div className="pb-6 mb-6 border-b border-border/40">
              <h3 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">BOOK_MENTORING_CALL</h3>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mt-2">SCHEDULE PROTOCOL ON OCTOBER {selectedDay}.</p>
            </div>
            <form onSubmit={handleBookSession} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="mentor" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">TARGET_MENTOR</Label>
                <select
                  id="mentor"
                  value={bookingMentor}
                  onChange={(e) => setBookingMentor(e.target.value)}
                  className="w-full h-12 rounded-sm grid-bg border border-border/50 font-mono text-[10px] tracking-widest uppercase px-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                >
                  <option value="Muhammad Hashim Dawood">Muhammad Hashim Dawood (Full Stack)</option>
                  <option value="Ali Asghar (AI Engineer)">Ali Asghar (AI Engineer)</option>
                  <option value="Muhammad Dawood (CMS & API)">Muhammad Dawood (CMS & API)</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="topic" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">DISCUSSION_TOPIC</Label>
                <select
                  id="topic"
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  className="w-full h-12 rounded-sm grid-bg border border-border/50 font-mono text-[10px] tracking-widest uppercase px-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                >
                  <option value="Next.js App Routing Code Review">Next.js App Routing Code Review</option>
                  <option value="Zustand State Management Help">Zustand State Management Help</option>
                  <option value="Career & Interview Mentoring">Career & Interview Mentoring</option>
                  <option value="AI Integration & Prompt Review">AI Integration & Prompt Review</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="time" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">PREFERRED_TIMESCALE</Label>
                <select
                  id="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full h-12 rounded-sm grid-bg border border-border/50 font-mono text-[10px] tracking-widest uppercase px-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="4:30 PM">4:30 PM</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6 border-t border-border/20 mt-8">
                <Button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  variant="outline"
                  className="flex-1 rounded-sm font-mono text-[10px] tracking-widest uppercase border-border/50 text-muted-foreground hover:text-foreground"
                >
                  CANCEL_OPERATION
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 glow-primary"
                >
                  <Check className="w-4 h-4" />
                  CONFIRM_BOOKING
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
