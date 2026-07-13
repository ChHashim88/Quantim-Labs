import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ServicesMarquee } from "@/components/landing/ServicesMarquee";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { WhoWeServe } from "@/components/landing/WhoWeServe";
import { TechnologyPartner } from "@/components/landing/TechnologyPartner";
import { ProcessMini } from "@/components/landing/ProcessMini";
import { ContactSection } from "@/components/landing/ContactSection";
import { createClient } from "@/lib/supabase/server";

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
      <ServicesMarquee />
      <WhyChooseUs />
      <WhoWeServe />
      <TechnologyPartner />
      <ProcessMini />
      <ContactSection />

      {/* Footer Placeholder */}
      <footer className="py-8 border-t border-border mt-auto bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quantim Labz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
