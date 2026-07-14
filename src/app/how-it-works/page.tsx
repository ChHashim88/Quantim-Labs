import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { ProcessTimelineClient } from "./ProcessTimelineClient";

export default async function HowItWorksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2] text-[#111] overflow-hidden flex flex-col relative">
      <Navbar user={user} userRole={userRole} />
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px] pointer-events-none opacity-60"></div>
      
      {/* Internship Programs Sub-Navigation (Pill Menu) */}
      <div className="pt-32 pb-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center md:justify-start relative z-20">
        <div className="grid grid-cols-2 md:inline-flex bg-white/80 backdrop-blur-md border border-[#E5E5E5] p-1.5 rounded-3xl md:rounded-full shadow-sm gap-1 md:gap-0 w-full md:w-auto items-stretch md:items-center">
          <Link href="/programs" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-[#555] hover:text-[#111] hover:bg-black/5 transition-all text-center leading-tight">
            Internship Programs
          </Link>
          <Link href="/how-it-works" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold bg-[#111] text-white shadow-md transition-all text-center leading-tight">
            How it Works
          </Link>
          <Link href="/about" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-[#555] hover:text-[#111] hover:bg-black/5 transition-all text-center leading-tight">
            About Us
          </Link>
          {user ? (
            <Link href={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? '/admin' : '/student'} className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-[#555] hover:text-[#111] hover:bg-black/5 transition-all text-center leading-tight">
              {userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? 'Admin Portal' : 'Dashboard'}
            </Link>
          ) : (
            <Link href="/login" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-[#555] hover:text-[#111] hover:bg-black/5 transition-all text-center leading-tight">
              Login
            </Link>
          )}
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-[#E5E5E5] mb-8 shadow-sm">
            <Target className="w-4 h-4 text-[#111]" />
            <span className="text-[10px] font-mono font-bold text-[#111] uppercase tracking-[0.2em]">The Process</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-[#111] tracking-tighter mb-8 leading-tight">
            How It Works
          </h1>
          <p className="text-lg md:text-xl text-[#555] leading-relaxed max-w-2xl mx-auto font-medium">
            A proven, step-by-step methodology designed to transform beginners into enterprise-ready developers.
          </p>
        </div>
      </div>

      {/* Process Section - Futuristic Light Mode Flow */}
      <ProcessTimelineClient />

      {/* CTA */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-32 z-10">
        <div className="mt-16 text-center">
          <Link href="/login" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#111] hover:bg-black text-white font-medium transition-all shadow-md hover:shadow-xl group">
            Begin Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <footer className="py-8 border-t border-[#E5E5E5] mt-auto bg-white relative z-10">
        <div className="container mx-auto px-4 text-center text-[#555] text-sm font-medium">
          &copy; {new Date().getFullYear()} Quantim Labz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
