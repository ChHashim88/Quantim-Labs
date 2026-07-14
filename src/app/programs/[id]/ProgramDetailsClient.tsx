"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Calendar, PlaySquare, CheckCircle2, Trophy, Clock, Check, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface ProgramDetailsClientProps {
  program: any;
}

export function ProgramDetailsClient({ program }: ProgramDetailsClientProps) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledProgramId, setEnrolledProgramId] = useState<string | null>(null);
  const [showAlreadyEnrolledModal, setShowAlreadyEnrolledModal] = useState(false);

  // Check if student is already enrolled in this internship or any other
  useEffect(() => {
    async function checkEnrollment() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("student_enrollments")
        .select("internship_id")
        .eq("student_id", user.id)
        .limit(1)
        .single();
        
      if (data) {
        setEnrolledProgramId(data.internship_id);
        if (data.internship_id === program.id) {
          setIsEnrolled(true);
        }
      }
    }
    checkEnrollment();
  }, [program.id]);

  const handleEnroll = async () => {
    if (isEnrolled) {
      router.push("/student/courses");
      return;
    }

    if (enrolledProgramId && enrolledProgramId !== program.id) {
      setShowAlreadyEnrolledModal(true);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to apply.");
        router.push("/login");
        return;
      }

      // Check verification
      const { data: vData } = await supabase.from('student_verifications').select('id').eq('student_id', user.id).single();
      if (!vData) {
        toast.error("For enrollment please get verified first.");
        router.push("/student");
        return;
      }
      
      const { error } = await supabase.from("student_enrollments").insert({
        student_id: user.id,
        internship_id: program.id
      });
      
      if (error && error.code !== '23505') throw error;

      setIsEnrolled(true);
      toast.success(`Successfully enrolled in ${program.title}!`);
      
      setTimeout(() => {
        router.push("/student/courses");
      }, 1200);
    } catch (e) {
      toast.error("Failed to enroll. Please try again.");
    }
  };

  // Determine fallback image based on a hash of the title or ID if missing
  const fallbacks = ["/assets/quantum_core.png", "/assets/data_nodes.png", "/assets/robot_hand.png"];
  const fallbackImage = fallbacks[0];
  const coverImage = program.thumbnail_url || program.cover_banner_url || fallbackImage;

  return (
    <div className="w-full relative">
      {/* Massive Hero Banner */}
      <div className="h-[60vh] min-h-[500px] w-full relative pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={coverImage} 
            alt={program.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20 backdrop-blur-sm" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-16">
          <Link href="/programs">
            <Button variant="ghost" className="mb-8 w-fit text-muted-foreground hover:text-foreground hover:bg-card/50 backdrop-blur-md">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Programs
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 text-sm font-semibold rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {program.category || "Technology"}
              </Badge>
              {program.status === 'PUBLISHED' && (
                <Badge className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 text-sm font-semibold rounded-full backdrop-blur-md">
                  Enrollment Open
                </Badge>
              )}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight mb-6 max-w-4xl text-white">
              {program.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
              {program.short_description || "An immersive, hands-on internship designed to transform your theoretical knowledge into practical, enterprise-grade skills."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Left Column (Details) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-16"
          >
            {/* Overview */}
            <section className="bg-card/50 border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400" />
              <h2 className="text-3xl font-bold mb-6 font-heading">Program Overview</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground text-lg leading-relaxed">
                {program.full_description ? (
                  <p>{program.full_description}</p>
                ) : (
                  <p>This program is meticulously crafted to bridge the gap between academic learning and industry expectations. You will work on real-world projects, utilizing the latest enterprise tech stacks, guided by senior engineers and industry experts. Gain the hands-on experience you need to launch a successful career in tech.</p>
                )}
              </div>
            </section>

            {/* What you'll learn */}
            <section>
              <h2 className="text-3xl font-bold mb-8 font-heading">What you will achieve</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Master enterprise-grade technologies and frameworks",
                  "Build a comprehensive portfolio of real-world projects",
                  "Learn agile methodologies and professional workflows",
                  "Receive 1-on-1 mentorship from industry veterans",
                  "Prepare for technical interviews and coding assessments",
                  "Earn a verifiable certificate upon successful completion"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 bg-muted/50 p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors shadow-inner">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>

          {/* Right Column (Sidebar) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Enrollment Card */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl sticky top-28 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none" />
              
              <h3 className="text-2xl font-bold mb-8 border-b border-border pb-4 font-heading">Program Stats</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Calendar className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Duration</p>
                    <p className="text-lg font-bold text-foreground">{program.duration_weeks || 12} Weeks</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <PlaySquare className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Format</p>
                    <p className="text-lg font-bold text-foreground">{program.program_type || "Online & Hybrid"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Clock className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Commitment</p>
                    <p className="text-lg font-bold text-foreground">15-20 hrs / week</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Trophy className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Certificate</p>
                    <p className="text-lg font-bold text-foreground">Yes, Verified</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleEnroll}
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  {isEnrolled ? (
                    <>
                      <Check className="w-5 h-5" /> Enrolled
                    </>
                  ) : (
                    "Apply Now"
                  )}
                </Button>
                <p className="text-sm text-center text-muted-foreground font-medium">
                  Spots are limited. Next cohort starts soon.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Already Enrolled Modal */}
      {showAlreadyEnrolledModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden bg-card border border-border shadow-2xl rounded-3xl"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
            <button 
              onClick={() => setShowAlreadyEnrolledModal(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8 pt-10 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-heading text-foreground">Active Enrollment Detected</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You are already enrolled in an internship program. To maintain quality and focus, you can only participate in one program at a time.
                </p>
              </div>
              <div className="flex flex-col w-full gap-3 pt-4">
                <Button 
                  onClick={() => router.push('/student')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-semibold"
                >
                  Go to My Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowAlreadyEnrolledModal(false)}
                  className="w-full h-12 rounded-xl font-semibold"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
