import { Navbar } from "@/components/layout/Navbar";
import { Programs } from "@/components/landing/Programs";
import { Features } from "@/components/landing/Features";
import { RoadmapSpine } from "@/components/landing/RoadmapSpine";
import { Testimonials } from "@/components/landing/Testimonials";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function InternshipProgramsPage() {
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

      {/* Internship Programs Sub-Navigation (Pill Menu) */}
      <div className="pt-28 pb-4 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center md:justify-start overflow-hidden">
        <div className="grid grid-cols-2 md:inline-flex bg-white border border-border p-1.5 rounded-3xl md:rounded-full shadow-sm gap-1 md:gap-0 w-full md:w-auto items-stretch md:items-center">
          <Link href="/internship-programs" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold bg-[#111] text-white shadow-md transition-all text-center leading-tight">
            Internship Programs
          </Link>
          <Link href="/how-it-works" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all text-center leading-tight">
            How it Works
          </Link>
          <Link href="/internships-about" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all text-center leading-tight">
            About Us
          </Link>
          {user ? (
            <Link href={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? '/admin' : '/student'} className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all text-center leading-tight">
              {userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? 'Admin Portal' : 'Dashboard'}
            </Link>
          ) : (
            <Link href="/login" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all text-center leading-tight">
              Login
            </Link>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Programs />
        <Features />
        <RoadmapSpine />
        <Testimonials />
      </div>

      <footer className="py-8 border-t border-border mt-auto bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quantim Labz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
