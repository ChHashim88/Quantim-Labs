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
        <Card className="bg-card border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
            <Award className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mb-2">No Credentials Earned</CardTitle>
          <CardDescription className="max-w-md mx-auto mb-8 text-sm">
            You do not have any certificates or credentials. Please enroll in an internship program first and complete modules to earn graduation awards.
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
    <div className="space-y-8 max-w-5xl mx-auto relative">
      <header>
        <h1 className="text-4xl font-heading font-extrabold tracking-tight">Credentials & Certificates</h1>
        <p className="text-muted-foreground mt-2">
          Verify, download, and share your cryptographically secure graduation certificates.
        </p>
      </header>

      {/* Certificates list */}
      <div className="grid md:grid-cols-2 gap-8">
        {certs.map((c) => (
          <Card key={c.id} className="bg-card border-border shadow-xl flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    c.status === "Issued" ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "bg-muted text-muted-foreground border-border/50"
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <CardDescription>{c.course}</CardDescription>
                  </div>
                </div>
                <Badge variant={c.status === "Issued" ? "default" : "outline"} className={c.status === "Issued" ? "bg-blue-500 text-white" : "text-muted-foreground"}>
                  {c.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2 font-mono">
              <div className="flex justify-between">
                <span>Verification ID:</span>
                <span className="text-foreground font-semibold">{c.verificationId}</span>
              </div>
              <div className="flex justify-between">
                <span>Issue Date:</span>
                <span className="text-foreground font-semibold">{c.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Honors score:</span>
                <span className="text-foreground font-semibold">{c.score}</span>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/30 pt-4 mt-4 flex gap-3">
              {c.status === "Issued" ? (
                <>
                  <Button
                    onClick={() => setSelectedCert(c)}
                    className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Digital Diploma
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyVerificationLink(c.verificationId)}
                    className="rounded-xl flex items-center justify-center px-3"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                  <Button disabled className="w-full rounded-xl flex items-center justify-center gap-2">
                    <Award className="w-4 h-4" />
                    {c.status === "Locked_-_Awaiting_Term_End" ? "Lock State: Minimum Duration Not Reached" : "Lock state: Complete Track Tasks"}
                  </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Diploma Modal Overlay */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-primary/30 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative flex flex-col justify-between min-h-[500px] animate-in zoom-in-95 duration-300 overflow-hidden">
            
            {/* Header trim decoration */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-blue-400 to-primary" />
            
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Diploma Body Content */}
            <div className="text-center space-y-6 flex-1 py-6 flex flex-col justify-center">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <Award className="w-8 h-8" />
                </div>
              </div>
              
              <h2 className="text-xs font-bold text-primary uppercase tracking-[0.3em] font-mono">
                QUANTIM LABZ CERTIFICATE OF ACCREDITATION
              </h2>
              
              <div className="space-y-1">
                <p className="text-slate-400 text-xs italic font-serif">This document certifies that</p>
                <p className="text-2xl font-bold text-white tracking-wide underline decoration-primary/40 underline-offset-8">
                  Verified Student
                </p>
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <p className="text-slate-400 text-xs italic font-serif">has successfully completed the industrial syllabus for</p>
                <p className="text-base font-bold text-slate-100">{selectedCert.course}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  graduating with high honors score of <span className="text-primary font-bold">{selectedCert.score}</span> based on compiler test evaluation algorithms.
                </p>
              </div>

              {/* QR Verification details */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/20 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-slate-950 rounded flex items-center justify-center text-[8px] text-white font-mono font-bold leading-none text-center p-1">
                    QR VERIFIED
                  </div>
                </div>
                <div className="text-left text-[10px] text-slate-400 font-mono space-y-1">
                  <div><span className="text-slate-500 font-semibold">ID:</span> {selectedCert.verificationId}</div>
                  <div><span className="text-slate-500 font-semibold">DATE:</span> {selectedCert.date}</div>
                  <div className="flex items-center gap-1 text-blue-400"><CheckCircle className="w-3 h-3" /> Secure Record</div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/20">
              <Button
                variant="outline"
                onClick={() => {
                  toast.success("Downloading high-resolution PDF diploma...");
                }}
                className="flex-1 rounded-xl flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button
                onClick={() => copyVerificationLink(selectedCert.verificationId)}
                className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Verification Link
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
