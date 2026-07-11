import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Programs } from "@/components/landing/Programs";
import { Features } from "@/components/landing/Features";
import { createClient } from "@/lib/supabase/server";

import { RoadmapSpine } from "@/components/landing/RoadmapSpine";

import { Testimonials } from "@/components/landing/Testimonials";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar user={user} userRole={userRole} />
      <Hero />
      <Programs />
      <Features />
      

      {/* Scroll-Driven Journey Roadmap */}
      <RoadmapSpine />



      {/* Student Success Testimonials */}
      <Testimonials />

      {/* Footer Placeholder */}
      <footer className="py-8 border-t border-border mt-auto bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quantim Labs. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
