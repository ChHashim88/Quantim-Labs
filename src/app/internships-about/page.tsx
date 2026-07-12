import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Globe, ShieldCheck, Award, Building, Users, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

export default async function InternshipsAboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  return (
    <main className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar user={user} userRole={userRole} />
      
      {/* Internship Programs Sub-Navigation (Pill Menu) */}
      <div className="pt-28 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center md:justify-start overflow-hidden">
        <div className="grid grid-cols-2 md:inline-flex bg-white border border-border p-1.5 rounded-3xl md:rounded-full shadow-sm gap-1 md:gap-0 w-full md:w-auto items-stretch md:items-center">
          <Link href="/internship-programs" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all text-center leading-tight">
            Internship Programs
          </Link>
          <Link href="/how-it-works" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all text-center leading-tight">
            How it Works
          </Link>
          <Link href="/internships-about" className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold bg-[#111] text-white shadow-md transition-all text-center leading-tight">
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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8E8E8] border border-[#DCDCDC] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#111] animate-pulse" />
            <span className="text-sm font-semibold text-[#111] uppercase tracking-widest">About Internships</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Empowering the Next Generation of <span className="text-[#111]">Tech Leaders</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We are bridging the gap between classroom theory and real-world execution. Our platform delivers enterprise-grade software development experience through intensive, interactive internship programs.
          </p>
        </div>

        {/* Global Recognition Section */}
        <div className="relative bg-white border border-[#DCDCDC] rounded-[2.5rem] p-8 md:p-12 shadow-md overflow-hidden mb-24 max-w-6xl mx-auto">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#F2F2F2] text-[#111] rounded-xl border border-[#DCDCDC]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Globally Approved & Recognized</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Quality education and verifiable experience know no borders. Quantim Labz maintains strict compliance and is officially recognized as an approved training and internship provider across multiple international jurisdictions.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { country: "Pakistan", active: true },
                  { country: "United States", active: true },
                  { country: "United Kingdom", active: true },
                  { country: "Canada", active: true },
                  { country: "Australia", active: true },
                  { country: "United Arab Emirates", active: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#F2F2F2] p-3 rounded-xl border border-[#DCDCDC]">
                    <MapPin className="w-5 h-5 text-[#555]" />
                    <span className="font-semibold text-[#333]">{item.country}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex justify-center">
               <div className="absolute inset-0 bg-[#E8E8E8] rounded-full blur-2xl transform scale-75" />
               <Globe className="w-64 h-64 text-[#111] relative z-10 drop-shadow-2xl opacity-60" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Quantim Labz Internships?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We focus on practical, hands-on learning backed by industry standards.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center hover:shadow-md hover:border-[#AAAAAA] transition-all">
              <div className="mx-auto w-14 h-14 bg-[#F2F2F2] rounded-2xl border border-[#DCDCDC] flex items-center justify-center text-[#111] mb-6">
                <Building className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise Standard</h3>
              <p className="text-muted-foreground">
                You work on the same tech stacks and architectures used by top Fortune 500 companies today.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center hover:shadow-md hover:border-[#AAAAAA] transition-all">
              <div className="mx-auto w-14 h-14 bg-[#F2F2F2] rounded-2xl border border-[#DCDCDC] flex items-center justify-center text-[#111] mb-6">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verifiable Credentials</h3>
              <p className="text-muted-foreground">
                Every graduate receives a cryptographically secure, QR-verifiable certificate demonstrating real experience.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center hover:shadow-md hover:border-[#AAAAAA] transition-all">
              <div className="mx-auto w-14 h-14 bg-[#F2F2F2] rounded-2xl border border-[#DCDCDC] flex items-center justify-center text-[#111] mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Mentorship</h3>
              <p className="text-muted-foreground">
                Learn directly from senior engineers who actively code and build large-scale applications daily.
              </p>
            </div>
          </div>
        </div>

      </div>

      <footer className="py-8 border-t border-border mt-32 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quantim Labz. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
