import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ProgramsClient } from "./ProgramsClient";

export default async function ProgramsPage() {
  const supabase = await createClient();
  
  // Get user for navbar
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  // Fetch actual programs from the DB (using internships table)
  let programs = [];
  try {
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      programs = data;
    }
  } catch (err) {
    console.warn("Error fetching programs:", err);
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
      <Navbar user={user} userRole={userRole} />
      
      {/* Internship Programs Sub-Navigation (Pill Menu) */}
      <div className="pt-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center md:justify-start relative z-20 w-full">
        <div className="grid grid-cols-2 md:inline-flex bg-card/80 backdrop-blur-md border border-border p-1.5 rounded-3xl md:rounded-full shadow-sm gap-1 md:gap-0 w-full md:w-auto items-stretch md:items-center">
          <Link href="/programs" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold bg-primary text-primary-foreground shadow-md transition-all text-center leading-tight">
            Internship Programs
          </Link>
          <Link href="/how-it-works" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-center leading-tight">
            How it Works
          </Link>
          <Link href="/about" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-center leading-tight">
            About Us
          </Link>
          {user ? (
            <Link href={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? '/admin' : '/student'} className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-center leading-tight">
              {userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? 'Admin Portal' : 'Dashboard'}
            </Link>
          ) : (
            <Link href="/login" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-center leading-tight">
              Login
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 pt-12 pb-20">
        <ProgramsClient initialPrograms={programs} />
      </div>

      <footer className="py-8 border-t border-border mt-auto bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quantim Labz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
