import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
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
      
      <div className="flex-1 pt-28 pb-20">
        <ProgramsClient initialPrograms={programs} />
      </div>

      <footer className="py-8 border-t border-border mt-auto bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quantim Labs. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
