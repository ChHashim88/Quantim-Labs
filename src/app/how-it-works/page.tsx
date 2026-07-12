import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Code2, Trophy, Rocket, ArrowRight, Laptop } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HowItWorksPage() {
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
      title: "Enroll & Onboard",
      description: "Join Quantim Labz and get immediate access to your personalized dashboard. Choose your preferred tech stack and internship track.",
      icon: <Rocket className="w-8 h-8" />,
      color: "from-blue-400 to-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      textColor: "text-blue-600"
    },
    {
      id: "02",
      title: "Master the Theory",
      description: "Progress through our structured daily modules. Each lesson is carefully crafted to build your foundation before moving to complex concepts.",
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-indigo-400 to-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      textColor: "text-indigo-600"
    },
    {
      id: "03",
      title: "Build Real Projects",
      description: "Apply your knowledge in our browser-based interactive sandbox. Write code, pass automated tests, and receive AI-driven feedback instantly.",
      icon: <Laptop className="w-8 h-8" />,
      color: "from-purple-400 to-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      textColor: "text-purple-600"
    },
    {
      id: "04",
      title: "Get Certified",
      description: "Upon successful completion of all modules and projects, receive a cryptographically secure, verifiable certificate to showcase to employers.",
      icon: <Trophy className="w-8 h-8" />,
      color: "from-emerald-400 to-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      textColor: "text-emerald-600"
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar user={user} userRole={userRole} />
      
      {/* Internship Programs Sub-Navigation (Pill Menu) */}
      <div className="pt-28 pb-4 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center md:justify-start overflow-hidden">
        <div className="grid grid-cols-2 md:inline-flex bg-white border border-border p-1.5 rounded-3xl md:rounded-full shadow-sm gap-1 md:gap-0 w-full md:w-auto items-stretch md:items-center">
          <Link href="/internship-programs" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all text-center leading-tight">
            Internship Programs
          </Link>
          <Link href="/how-it-works" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold bg-[#111] text-white shadow-md transition-all text-center leading-tight">
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
      
      {/* Hero */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="max-w-4xl mx-auto text-center relative z-10">

          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8E8E8] border border-[#DCDCDC] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#111] animate-pulse" />
            <span className="text-sm font-semibold text-[#111] uppercase tracking-widest">The Process</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-slate-900 tracking-tight mb-8">
            How It <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Works</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A proven, step-by-step methodology designed to transform beginners into enterprise-ready developers.
          </p>
        </div>
      </div>

      {/* Process Section */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Background Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-100 via-indigo-100 to-emerald-100 hidden md:block -translate-x-1/2 rounded-full opacity-50" />

        <div className="max-w-6xl mx-auto space-y-24">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={step.id} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24`}>
                
                {/* Center Node */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-slate-50 shadow-xl items-center justify-center z-10 transition-transform hover:scale-110 duration-300">
                  <div className={`w-full h-full rounded-full bg-gradient-to-tr ${step.color} p-0.5`}>
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-slate-900 font-bold font-heading text-lg">
                      {step.id}
                    </div>
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-full md:w-1/2 ${isEven ? 'md:text-right' : 'md:text-left'} text-center`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg border border-slate-100 mb-6 md:hidden ${step.textColor}`}>
                    <div className={`w-full h-full rounded-2xl bg-gradient-to-tr ${step.color} opacity-10 absolute inset-0`} />
                    {step.icon}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto md:mx-0 inline-block">
                    {step.description}
                  </p>
                </div>

                {/* Visual Card */}
                <div className="w-full md:w-1/2">
                  <div className={`relative w-full aspect-[4/3] md:aspect-video rounded-[2rem] p-8 ${step.bg} border ${step.border} overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    <div className={`absolute inset-0 flex items-center justify-center opacity-20 transform group-hover:scale-110 transition-transform duration-700 ${step.textColor}`}>
                      {React.cloneElement(step.icon as React.ReactElement<any>, { className: "w-64 h-64" })}
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-end items-start">
                      <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${step.color} text-white flex items-center justify-center font-bold text-xs`}>
                            {step.id}
                          </div>
                          <p className="font-bold text-slate-900 text-lg">{step.title}</p>
                        </div>
                        <p className="text-sm text-slate-600">The essential next step in your journey.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-32 text-center">
          <div className="inline-block bg-white p-2 rounded-full shadow-2xl shadow-blue-900/10 border border-slate-100 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-20" />
            <Link href="/login" className="relative block">
              <Button className="rounded-full px-10 py-8 h-auto text-xl bg-slate-900 hover:bg-slate-800 text-white group">
                Begin Your Journey
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-8 border-t border-slate-200 mt-auto bg-white">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Quantim Labz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
