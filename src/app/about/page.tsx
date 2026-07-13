import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Globe, ShieldCheck, Award, Building, Users, Code, Cpu, LineChart } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import Image from "next/image";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role ? profile.role.toUpperCase().replace(' ', '_') : null;
  }

  return (
    <main className="min-h-screen bg-background flex flex-col selection:bg-primary/30">
      <Navbar user={user} userRole={userRole} />
      
      <div className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8E8E8] border border-[#DCDCDC] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#111] animate-pulse" />
            <span className="text-sm font-semibold text-[#111] uppercase tracking-widest">Our Company</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            Pioneering the Future of <span className="text-[#111]">Intelligent Digital Ecosystems</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Quantim Labz is a premier technology partner dedicated to building highly scalable, AI-enabled software solutions that empower the world's leading brands to transform their digital infrastructure.
          </p>
        </div>

        {/* Core Solutions Section */}
        <div className="relative bg-white border border-[#DCDCDC] rounded-[2.5rem] p-8 md:p-12 shadow-md overflow-hidden mb-24 max-w-6xl mx-auto">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#F2F2F2] text-[#111] rounded-xl border border-[#DCDCDC]">
                  <Cpu className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">AI-First Technology Solutions</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                We specialize in deep domain expertise, offering implementation support and process optimization. Our secure, composable platforms seamlessly integrate with your existing systems, simplify complex asset lifecycles, and deliver measurable operational efficiency at scale.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Fintech Solutions", icon: LineChart },
                  { label: "Enterprise Software", icon: Building },
                  { label: "Data Engineering", icon: Code },
                  { label: "Cloud Infrastructure", icon: Globe },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#F2F2F2] p-3 rounded-xl border border-[#DCDCDC] hover:border-[#AAAAAA] transition-colors">
                    <item.icon className="w-5 h-5 text-[#111]" />
                    <span className="font-semibold text-[#333]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex justify-center py-10 lg:py-0 items-center">
               <div className="absolute inset-0 bg-gradient-to-bl from-gray-200 to-transparent rounded-full blur-3xl opacity-50 transform scale-90 -z-10" />
               
               <div className="relative w-full aspect-[4/5] max-w-md rounded-[2.5rem] overflow-hidden border border-[#DCDCDC] shadow-2xl group bg-[#F2F2F2]">
                 <Image 
                   src="/Aboutus1.png" 
                   alt="Quantim Labz Team" 
                   fill 
                   className="object-contain transition-transform duration-700 group-hover:scale-105"
                   priority
                 />
                 
                 {/* Inner Overlay */}
                 <div className="absolute inset-0 bg-gradient-to-t from-[#111]/60 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                 {/* Interactive bottom card */}
                 <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md border border-white/50 p-5 rounded-2xl flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-xl">
                   <div>
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Our Mission</p>
                     <p className="font-bold text-[#111] text-lg leading-none">Empowering Innovation</p>
                   </div>
                   <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center">
                     <Users className="w-6 h-6 text-white" />
                   </div>
                 </div>
               </div>

               {/* Floating Badge */}
               <div className="absolute -right-6 md:-right-12 top-20 bg-white border border-[#DCDCDC] shadow-xl rounded-2xl p-4 hidden md:flex items-center gap-4 animate-pulse hover:animate-none transition-transform hover:scale-105 cursor-pointer z-20">
                 <div className="w-12 h-12 rounded-xl bg-[#F2F2F2] flex items-center justify-center border border-[#DCDCDC]">
                   <Building className="w-6 h-6 text-[#111]" />
                 </div>
                 <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Established</p>
                   <p className="text-sm font-bold text-[#111]">Industry Leaders</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Philosophy</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our mission is built around long-term partnerships, cutting-edge innovation, and uncompromised quality.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center hover:shadow-md hover:border-[#AAAAAA] transition-all">
              <div className="mx-auto w-14 h-14 bg-[#F2F2F2] rounded-2xl border border-[#DCDCDC] flex items-center justify-center text-[#111] mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
              <p className="text-muted-foreground">
                We design robust infrastructures with security at the foundation, ensuring compliance with global data protection standards.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center hover:shadow-md hover:border-[#AAAAAA] transition-all">
              <div className="mx-auto w-14 h-14 bg-[#F2F2F2] rounded-2xl border border-[#DCDCDC] flex items-center justify-center text-[#111] mb-6">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Commitment to Quality</h3>
              <p className="text-muted-foreground">
                Every line of code and architectural decision undergoes rigorous quality assurance for flawless execution.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center hover:shadow-md hover:border-[#AAAAAA] transition-all">
              <div className="mx-auto w-14 h-14 bg-[#F2F2F2] rounded-2xl border border-[#DCDCDC] flex items-center justify-center text-[#111] mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Human-Centered Experiences</h3>
              <p className="text-muted-foreground">
                We believe technology should seamlessly empower people. Our UX focuses entirely on intuitive interactions and accessibility.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-5xl mx-auto mt-32 bg-[#111] rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to transform your vision?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Partner with Quantim Labz to leverage cutting-edge technology and innovative design for your next big project.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center px-8 py-4 bg-white text-[#111] font-bold rounded-full hover:bg-gray-200 transition-colors relative z-10"
          >
            Start Your Project
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
