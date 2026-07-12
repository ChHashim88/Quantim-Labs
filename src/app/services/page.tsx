import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Code, Smartphone, Globe, Search, Megaphone, PenTool, ArrowRight } from "lucide-react";
import Link from "next/link";

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
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8E8E8] border border-[#DCDCDC] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#111] animate-pulse" />
            <span className="text-sm font-semibold text-[#111] uppercase tracking-widest">Our Expertise</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            Premium Digital <span className="text-[#111]">Services</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            From seamless web applications to high-impact digital marketing, we provide end-to-end solutions that elevate your brand and drive measurable results.
          </p>
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
