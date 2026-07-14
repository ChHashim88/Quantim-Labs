"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Eye, Copy, CheckCircle, Download, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { FuturisticLoader } from "@/components/ui/futuristic-loader";

interface Certificate {
  id: string;
  title: string;
  course: string;
  date: string;
  verificationId: string;
  score: string;
  status: "Issued" | "In_Progress" | "Locked_-_Awaiting_Term_End";
}

export default function CertificatesPage() {
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    async function loadCertificates() {
      if (typeof window === "undefined") return;

      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: enrollments } = await supabase
          .from('student_enrollments')
          .select('internship_id')
          .eq('student_id', user.id);

        const enrolled = enrollments ? enrollments.map(e => e.internship_id) : [];
        setHasEnrollments(enrolled.length > 0);

        if (enrolled.length === 0) {
          setLoading(false);
          return;
        }
        
        const { data: internships } = await supabase
          .from('internships')
          .select('*')
          .in('id', enrolled);

        if (!internships) {
          setLoading(false);
          return;
        }

        const { data: progressData } = await supabase
          .from('student_progress')
          .select('content_type, content_id')
          .eq('student_id', user.id);

        const completedVideos = progressData?.filter(p => p.content_type === 'LESSON').map(p => p.content_id) || [];
        const completedTasks = progressData?.filter(p => p.content_type === 'TASK').map(p => p.content_id) || [];
        const completedAssignments = progressData?.filter(p => p.content_type === 'ASSIGNMENT').map(p => p.content_id) || [];
        const completedQuizzes = progressData?.filter(p => p.content_type === 'QUIZ').map(p => p.content_id) || [];
        const storedDates = localStorage.getItem("enrollment_dates");
        const enrollmentDates = storedDates ? JSON.parse(storedDates) : {};

        const loadedCerts: Certificate[] = [];

        for (const internship of internships) {
          const { data: dbDays } = await supabase
            .from('days')
            .select('id')
            .eq('internship_id', internship.id);

          let totalItems = 0;
          let completedItems = 0;

          if (dbDays && dbDays.length > 0) {
            const dayIds = dbDays.map((d: any) => d.id);
            const { data: dbLessons } = await supabase
              .from('lessons')
              .select('id, content_type')
              .in('day_id', dayIds);

            if (dbLessons && dbLessons.length > 0) {
              totalItems = dbLessons.length;
              dbLessons.forEach((l: any) => {
                if (l.content_type === 'VIDEO' && completedVideos.includes(l.id)) completedItems++;
                else if (l.content_type === 'TASK' && completedTasks.includes(l.id)) completedItems++;
                else if (l.content_type === 'ASSIGNMENT' && completedAssignments.includes(l.id)) completedItems++;
                else if (l.content_type === 'QUIZ' && completedQuizzes.includes(l.id)) completedItems++;
              });
            }
          }

          let isTimeCompleted = true;
          const enrolledAtStr = enrollmentDates[internship.id];
          if (enrolledAtStr) {
            const enrolledDate = new Date(enrolledAtStr);
            const weeksRequired = internship.duration_weeks || 12;
            const msRequired = weeksRequired * 7 * 24 * 60 * 60 * 1000;
            const timeElapsed = new Date().getTime() - enrolledDate.getTime();
            isTimeCompleted = timeElapsed >= msRequired;
          } else {
            // For older test accounts without an enrollment date, assume they haven't finished time.
            isTimeCompleted = false;
          }

          const isFullyCompleted = totalItems > 0 && completedItems === totalItems && isTimeCompleted;
          let statusText = "In_Progress";
          if (totalItems > 0 && completedItems === totalItems && !isTimeCompleted) {
             statusText = "Locked_-_Awaiting_Term_End";
          } else if (isFullyCompleted) {
             statusText = "Issued";
          }

          loadedCerts.push({
            id: internship.id,
            title: `${internship.title} Graduation`,
            course: internship.title,
            date: isFullyCompleted ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Pending Completion",
            verificationId: isFullyCompleted ? `INX-${new Date().getFullYear()}-${internship.id.substring(0, 5).toUpperCase()}` : `INX-PENDING`,
            score: isFullyCompleted ? "100%" : "N/A",
            status: statusText as any
          });
        }

        setCerts(loadedCerts);
      } catch (e) {
        console.error("Failed to load certificates:", e);
      } finally {
        setLoading(false);
      }
    }

    loadCertificates();
  }, []);

  const copyVerificationLink = (id: string) => {
    const link = `https://quantimlabs.com/verify/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Verification link copied to clipboard!");
  };

  if (loading) {
    return <FuturisticLoader text="Generating Cryptographic Credentials..." />;
  }

  if (!hasEnrollments) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="glass-panel border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Award className="w-64 h-64 text-primary" />
          </div>
          <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 glow-primary">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight mb-2 uppercase">NO CREDENTIALS EARNED</h2>
          <p className="max-w-md mx-auto mb-8 text-xs font-mono tracking-widest text-muted-foreground uppercase">
            SYSTEM RECORDS INDICATE NO CERTIFICATES OR CREDENTIALS. PLEASE INITIALIZE AN INTERNSHIP PROGRAM AND COMPLETE MODULES TO EARN GRADUATION AWARDS.
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
    <div className="space-y-8 max-w-5xl mx-auto relative">
      <header>
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold tracking-tighter uppercase">CREDENTIALS_AND_CERTIFICATES</h1>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-primary"></span> VERIFY, DOWNLOAD, AND SHARE CRYPTOGRAPHICALLY SECURE GRADUATION CERTIFICATES
        </p>
      </header>

      {/* Certificates list */}
      <div className="grid md:grid-cols-2 gap-8">
        {certs.map((c) => (
          <div key={c.id} className="glass-panel p-6 corner-accent flex flex-col justify-between group hover:border-primary/50 transition-all">
            <div>
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-border/20">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-sm flex items-center justify-center border ${
                    c.status === "Issued" ? "bg-primary/10 text-primary border-primary/30 glow-primary active-glow" : "grid-bg text-muted-foreground/50 border-border/40"
                  }`}>
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{c.title}</h3>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{c.course}</p>
                  </div>
                </div>
                <div className={`text-[9px] font-mono tracking-widest uppercase border px-2 py-1 rounded-sm ${c.status === "Issued" ? "bg-primary/10 text-primary border-primary/30 glow-primary" : "text-muted-foreground border-border/50"}`}>
                  {c.status.replace(/_/g, " ")}
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground space-y-3 font-mono uppercase tracking-widest bg-muted/5 p-4 rounded-sm border border-border/20 mb-6">
                <div className="flex justify-between items-center border-b border-border/20 pb-2">
                  <span>VERIFICATION_ID:</span>
                  <span className="text-foreground font-bold">{c.verificationId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/20 pb-2">
                  <span>ISSUE_DATE:</span>
                  <span className="text-foreground font-bold">{c.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>HONORS_SCORE:</span>
                  <span className={`font-bold ${c.status === "Issued" ? "text-primary glow-primary" : "text-foreground"}`}>{c.score}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border/30 pt-4 mt-auto flex gap-4">
              {c.status === "Issued" ? (
                <>
                  <Button
                    onClick={() => setSelectedCert(c)}
                    className="flex-1 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest glow-primary transition-all duration-300"
                  >
                    <Eye className="w-4 h-4" />
                    VIEW_DIGITAL_DIPLOMA
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyVerificationLink(c.verificationId)}
                    className="rounded-sm flex items-center justify-center px-4 border-primary/30 text-primary hover:bg-primary/10 glow-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                  <Button disabled className="w-full rounded-sm flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest border-border/40 bg-transparent text-muted-foreground/50">
                    <Award className="w-4 h-4" />
                    {c.status === "Locked_-_Awaiting_Term_End" ? "LOCK_STATE: MINIMUM_DURATION_NOT_REACHED" : "LOCK_STATE: COMPLETE_TRACK_TASKS"}
                  </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Diploma Modal Overlay */}
      {selectedCert && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel border-primary/30 rounded-sm p-8 max-w-3xl w-full shadow-2xl relative flex flex-col justify-between min-h-[600px] animate-in zoom-in-95 duration-300 overflow-hidden corner-accent">
            
            {/* Header trim decoration */}
            <div className="absolute top-0 inset-x-0 h-1 bg-primary glow-primary" />
            
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-primary p-2 rounded-sm hover:bg-primary/10 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Diploma Body Content */}
            <div className="text-center space-y-8 flex-1 py-12 flex flex-col justify-center relative z-10 grid-bg border border-border/20 rounded-sm m-4 p-8">
              <div className="absolute inset-0 border border-primary/10 m-2 rounded-sm pointer-events-none" />
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center text-primary glow-primary shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                  <Award className="w-10 h-10" />
                </div>
              </div>
              
              <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] font-mono glow-primary">
                QUANTIM LABZ CERTIFICATE OF ACCREDITATION
              </h2>
              
              <div className="space-y-4">
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-mono">THIS DOCUMENT CERTIFIES THAT</p>
                <p className="text-4xl font-heading font-extrabold text-foreground tracking-widest uppercase border-b-2 border-primary/30 inline-block pb-2 px-8">
                  VERIFIED STUDENT
                </p>
              </div>

              <div className="space-y-4 max-w-lg mx-auto">
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-mono">HAS SUCCESSFULLY COMPLETED THE INDUSTRIAL SYLLABUS FOR</p>
                <p className="text-xl font-heading font-bold text-foreground uppercase tracking-widest">{selectedCert.course}</p>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
                  GRADUATING WITH HIGH HONORS SCORE OF <span className="text-primary font-bold glow-primary">{selectedCert.score}</span> BASED ON COMPILER TEST EVALUATION ALGORITHMS.
                </p>
              </div>

              {/* QR Verification details */}
              <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-border/20 max-w-md mx-auto">
                <div className="w-20 h-20 bg-white p-1 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <div className="w-full h-full bg-background border-2 border-slate-900 rounded-sm flex flex-col items-center justify-center text-slate-900">
                    <div className="text-[8px] font-mono font-bold leading-none text-center">QR</div>
                    <div className="text-[8px] font-mono font-bold leading-none text-center mt-1">VERIFIED</div>
                  </div>
                </div>
                <div className="text-left text-[9px] text-muted-foreground font-mono space-y-2 uppercase tracking-widest">
                  <div className="flex items-center gap-2"><span className="text-foreground font-bold">ID:</span> {selectedCert.verificationId}</div>
                  <div className="flex items-center gap-2"><span className="text-foreground font-bold">DATE:</span> {selectedCert.date}</div>
                  <div className="flex items-center gap-2 text-primary glow-primary mt-2 pt-2 border-t border-primary/20 font-bold"><CheckCircle className="w-3 h-3" /> SECURE_RECORD</div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/20 relative z-10">
              <Button
                variant="outline"
                onClick={() => {
                  toast.success("Downloading high-resolution PDF diploma...");
                }}
                className="flex-1 rounded-sm flex items-center justify-center gap-2 font-mono text-[10px] tracking-widest uppercase border-border/50 hover:text-foreground"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD_PDF
              </Button>
              <Button
                onClick={() => copyVerificationLink(selectedCert.verificationId)}
                className="flex-1 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase glow-primary"
              >
                <Copy className="w-4 h-4" />
                COPY_VERIFICATION_LINK
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
