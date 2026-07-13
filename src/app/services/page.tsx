import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Code, Smartphone, Globe, Search, Megaphone, PenTool, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const services = [
  {
    title: "Web Development",
    description: "Building fast, responsive, and robust websites tailored to your unique business needs using cutting-edge technologies.",
    icon: Globe,
  },
  {
    title: "Web App Development",
    description: "Developing scalable and secure enterprise-grade web applications that drive efficiency and growth.",
    icon: Code,
  },
  {
    title: "Mobile App Development",
    description: "Creating intuitive and engaging native and cross-platform mobile experiences for iOS and Android.",
    icon: Smartphone,
  },
  {
    title: "SEO",
    description: "Optimizing your digital presence to rank higher on search engines and attract organic, high-converting traffic.",
    icon: Search,
  },
  {
    title: "Digital Marketing",
    description: "Executing data-driven marketing campaigns to expand your reach, build brand awareness, and increase ROI.",
    icon: Megaphone,
  },
  {
    title: "Graphic Design",
    description: "Crafting visually stunning designs, from branding to user interfaces, that captivate and resonate with your audience.",
    icon: PenTool,
  },
];

export default async function ServicesPage() {
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
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-24 max-w-7xl mx-auto">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8E8E8] border border-[#DCDCDC] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#111] animate-pulse" />
              <span className="text-sm font-semibold text-[#111] uppercase tracking-widest">Our Expertise</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-foreground mb-6 leading-[1.1] tracking-tight">
              Premium Digital <br className="hidden lg:block" />
              <span className="text-[#111] relative inline-block">
                Services
                <svg className="absolute -bottom-1 left-0 w-full text-[#DCDCDC] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/>
                </svg>
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              From seamless web applications to high-impact digital marketing, we provide end-to-end solutions that elevate your brand and drive measurable results.
            </p>
          </div>

          {/* Creative Image Display */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            {/* Background decorative blur */}
            <div className="absolute inset-0 bg-gray-200 rounded-full blur-3xl opacity-50 -z-10 transform translate-y-10 scale-90" />
            
            <div className="relative aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-[#DCDCDC] shadow-2xl group bg-[#F2F2F2]">
              <Image 
                src="/ser1.png" 
                alt="Premium Digital Services" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Overlay elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111]/50 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md border border-white/50 p-4 rounded-2xl flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-lg">
                 <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Impact</p>
                   <p className="font-bold text-[#111] text-lg leading-none">Innovative Solutions</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center">
                   <ArrowRight className="w-5 h-5 text-white" />
                 </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -left-8 top-12 bg-white border border-[#DCDCDC] shadow-xl rounded-2xl p-4 hidden md:flex items-center gap-4 animate-bounce hover:animate-none transition-transform hover:scale-105 cursor-pointer z-20">
              <div className="w-12 h-12 rounded-xl bg-[#F2F2F2] flex items-center justify-center border border-[#DCDCDC]">
                <Code className="w-6 h-6 text-[#111]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Engineering</p>
                <p className="text-sm font-bold text-[#111]">100% Scalable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-white border border-[#DCDCDC] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:shadow-xl hover:border-[#AAAAAA] transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4 md:mb-0 md:block">
                <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl md:rounded-2xl bg-[#F2F2F2] border border-[#DCDCDC] flex items-center justify-center text-[#111] mb-0 md:mb-8 group-hover:scale-110 group-hover:bg-[#111] group-hover:text-white transition-all duration-300">
                  <service.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-0 md:mb-4">{service.title}</h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8 flex-1">
                {service.description}
              </p>
              <Link 
                href="/about" 
                className="inline-flex items-center gap-2 text-sm font-bold text-[#111] hover:text-gray-600 transition-colors mt-auto w-max"
              >
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="max-w-5xl mx-auto mt-32 bg-[#111] rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden">
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
