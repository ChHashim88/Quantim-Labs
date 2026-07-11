import React from "react";
import Image from "next/image";
import { Globe, ShieldCheck, Award, Building, Users, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  return (
    <main className="min-h-screen bg-background pt-28 pb-20">
      <Navbar user={user} userRole={userRole} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest">About Quantim Labs</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Empowering the Next Generation of <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Tech Leaders</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We are bridging the gap between classroom theory and real-world execution. Our platform delivers enterprise-grade software development experience through intensive, interactive internship programs.
          </p>
        </div>

        {/* Global Recognition Section */}
        <div className="relative bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-blue-900/5 overflow-hidden mb-24 max-w-6xl mx-auto">
          {/* Decorative background gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Globally Approved & Recognized</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Quality education and verifiable experience know no borders. Quantim Labs maintains strict compliance and is officially recognized as an approved training and internship provider across multiple international jurisdictions.
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
                  <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-slate-700">{item.country}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex justify-center">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-2xl transform scale-75" />
               <Globe className="w-64 h-64 text-blue-600 relative z-10 drop-shadow-2xl opacity-90" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Quantim Labs?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We focus on practical, hands-on learning backed by industry standards.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center">
              <div className="mx-auto w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                <Building className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise Standard</h3>
              <p className="text-muted-foreground">
                You work on the same tech stacks and architectures used by top Fortune 500 companies today.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center">
              <div className="mx-auto w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verifiable Credentials</h3>
              <p className="text-muted-foreground">
                Every graduate receives a cryptographically secure, QR-verifiable certificate demonstrating real experience.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center">
              <div className="mx-auto w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
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
          &copy; {new Date().getFullYear()} Quantim Labs. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
