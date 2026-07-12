import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { MentorsList } from "./MentorsList";

export default async function MentorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2] pt-32">
      <Navbar user={user} userRole={userRole} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">

        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700 uppercase tracking-widest">World-Class Expertise</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-[#111] tracking-tight mb-6">
            Meet Your <span className="text-[#111]">Mentors</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Learn directly from 58 industry veterans spanning from Pakistan to Silicon Valley, bringing elite academic and practical experience.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <MentorsList />
      </div>

      <footer className="py-8 border-t border-[#DCDCDC] mt-auto bg-[#F2F2F2]">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Quantim Labz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
