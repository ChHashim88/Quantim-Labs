import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ContactSection } from "@/components/landing/ContactSection";
import { createClient } from "@/lib/supabase/server";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  return (
    <main className="min-h-screen bg-background pt-20 flex flex-col selection:bg-primary/30">
      <Navbar user={user} userRole={userRole} />
      
      <div className="flex-1">
        <ContactSection />
      </div>

      <footer className="py-8 border-t border-border mt-auto bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quantim Labz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
