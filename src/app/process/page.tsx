import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Search, PenTool, Code2, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ProcessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  const steps = [
    {
      id: "01",
      title: "Discovery & Architecture",
      description: "We dive deep into your business objectives, map out user journeys, and architect a robust, scalable technical foundation tailored to your specific enterprise needs.",
      icon: <Search className="w-8 h-8" />,
    },
    {
      id: "02",
      title: "UI/UX & Prototyping",
      description: "Our design team crafts intuitive, human-centered interfaces. We build interactive prototypes to ensure the user experience aligns perfectly with your brand before writing a single line of code.",
      icon: <PenTool className="w-8 h-8" />,
    },
    {
      id: "03",
      title: "Agile Engineering",
      description: "Leveraging cutting-edge AI and enterprise-grade frameworks, our engineers build your product in agile sprints, ensuring continuous delivery, full transparency, and rapid iteration.",
      icon: <Code2 className="w-8 h-8" />,
    },
    {
      id: "04",
      title: "QA & Deployment",
      description: "We subject the software to rigorous automated and manual testing, ensuring zero critical bugs, strict security compliance, and a flawless launch into your production environment.",
      icon: <ShieldCheck className="w-8 h-8" />,
    },
    {
      id: "05",
      title: "Scaling & Support",
      description: "Post-launch, we become your long-term technology partner. We monitor performance, implement continuous optimizations, and seamlessly scale the infrastructure as your user base grows.",
      icon: <TrendingUp className="w-8 h-8" />,
    }
  ];

  return (
    <main className="min-h-screen bg-background flex flex-col selection:bg-primary/30">
      <Navbar user={user} userRole={userRole} />
      
      <div className="flex-1 pt-32 pb-24">
        {/* Header Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8E8E8] border border-[#DCDCDC] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#111] animate-pulse" />
              <span className="text-sm font-semibold text-[#111] uppercase tracking-widest">Our Process</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
              How We Build <span className="text-[#111]">Enterprise Solutions</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              From initial strategy to scalable deployment, our battle-tested methodology ensures we deliver flawless software that drives real business value.
            </p>
          </div>
        </div>

        {/* Process Timeline */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="space-y-12 md:space-y-24 relative">
            {/* Vertical Line for Desktop */}
            <div className="hidden md:block absolute left-12 top-10 bottom-10 w-0.5 bg-[#E8E8E8]" />

            {steps.map((step, index) => (
              <div key={step.id} className="relative flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                
                {/* Node */}
                <div className="hidden md:flex shrink-0 w-24 flex-col items-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-[#F2F2F2] border-4 border-white flex items-center justify-center shadow-sm">
                    <span className="font-bold text-[#111] text-lg font-mono">{step.id}</span>
                  </div>
                </div>

                {/* Mobile Header (Number + Title inline) */}
                <div className="flex md:hidden items-center gap-4 w-full">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#F2F2F2] border-2 border-white flex items-center justify-center shadow-sm">
                    <span className="font-bold text-[#111] text-sm font-mono">{step.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#111]">{step.title}</h3>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-white rounded-3xl p-8 md:p-10 border border-[#DCDCDC] shadow-sm hover:shadow-md hover:border-[#AAAAAA] transition-all group">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#F2F2F2] flex items-center justify-center text-[#111] group-hover:scale-110 group-hover:bg-[#111] group-hover:text-white transition-all duration-300 border border-[#DCDCDC]">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="hidden md:block text-2xl md:text-3xl font-bold text-[#111] mb-4">{step.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-32">
          <div className="max-w-5xl mx-auto bg-[#111] rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to start building?</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Partner with our elite engineering team to bring your next visionary project to life.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center px-8 py-4 bg-white text-[#111] font-bold rounded-full hover:bg-gray-200 transition-colors relative z-10 group"
            >
              Start Your Project
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>

      <footer className="py-8 border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quantim Labz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
