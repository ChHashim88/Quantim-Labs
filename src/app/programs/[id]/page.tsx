import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { ProgramDetailsClient } from "./ProgramDetailsClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Get user for navbar
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  // Handle dummy IDs from the landing page
  if (id === '1' || id === '2' || id === '3') {
    const dummyPrograms = [
      {
        id: '1',
        title: "Full Stack Development",
        full_description: "Master React, Next.js, Node.js, and PostgreSQL to build scalable web applications from scratch. This intensive 12-week program covers everything from frontend fundamentals to advanced backend architecture.",
        category: "Web Dev",
        duration_weeks: 12,
        program_type: "ONLINE",
        cover_banner_url: "/assets/quantum_core.png"
      },
      {
        id: '2',
        title: "Data Science & AI",
        full_description: "Learn Python, machine learning algorithms, and neural networks to extract insights from data. Build real-world AI models and deploy them to production.",
        category: "AI",
        duration_weeks: 16,
        program_type: "HYBRID",
        cover_banner_url: "/assets/data_nodes.png"
      },
      {
        id: '3',
        title: "Cloud Architecture",
        full_description: "Design and deploy highly available enterprise systems on AWS and Google Cloud. Master Kubernetes, Docker, and CI/CD pipelines.",
        category: "Cloud",
        duration_weeks: 8,
        program_type: "ONLINE",
        cover_banner_url: "/assets/robot_hand.png"
      }
    ];
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar user={user} userRole={userRole} />
        <div className="flex-1">
          <ProgramDetailsClient program={dummyPrograms.find(p => p.id === id)} />
        </div>
      </main>
    );
  }

  // Fetch from DB
  const { data: program, error } = await supabase
    .from('internships')
    .select('*')
    .eq('id', id)
    .single();

  console.log(`[ProgramDetails] Fetched ID ${id}:`, { programId: program?.id, error });

  if (error || !program) {
    console.error("[ProgramDetails] Not Found triggered!", error);
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar user={user} userRole={userRole} />
      <div className="flex-1">
        <ProgramDetailsClient program={program} />
      </div>
      <footer className="py-8 border-t border-border mt-auto bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quantim Labs. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
