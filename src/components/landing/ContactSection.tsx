"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ContactSection() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    const supabase = createClient();
    const { error } = await supabase.from('contact_messages').insert([data]);

    setLoading(false);

    if (error) {
      toast.error(`Failed to send message: ${error.message || 'Unknown error occurred'}`);
      console.error("Supabase insert error:", error);
    } else {
      toast.success("Message sent successfully! We will get back to you soon.");
      form.reset();
    }
  };

  return (
    <section id="contact" className="py-24 relative bg-[#F2F2F2] border-t border-[#DCDCDC]">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8E8E8] border border-[#DCDCDC] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#111] animate-pulse" />
            <span className="text-sm font-semibold text-[#111] uppercase tracking-widest">Get In Touch</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-foreground">
            Let's build something <span className="text-primary">extraordinary.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Have a project in mind or want to learn more about our internship programs? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-[#DCDCDC] h-full shadow-sm">
              <h3 className="text-2xl font-bold mb-8 text-[#111]">Contact Information</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCDCDC] flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5 text-[#111]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                    <a href="mailto:hello@quantimlabz.com" className="text-lg font-medium text-[#111] hover:text-gray-600 transition-colors">hello@quantimlabz.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCDCDC] flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="w-5 h-5 text-[#111]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                    <a href="tel:+1234567890" className="text-lg font-medium text-[#111] hover:text-gray-600 transition-colors">+1 (234) 567-890</a>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCDCDC] flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-[#111]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Office</p>
                    <p className="text-lg font-medium text-[#111] leading-snug">123 Innovation Drive<br/>Tech District, CA 90210</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-10 border border-[#DCDCDC] shadow-md h-full flex flex-col">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-bold text-[#333]">First Name</label>
                  <input required id="firstName" name="firstName" type="text" className="w-full px-4 py-3.5 rounded-xl border border-[#DCDCDC] bg-[#F9F9F9] focus:outline-none focus:border-[#111] focus:bg-white transition-all shadow-sm" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-bold text-[#333]">Last Name</label>
                  <input required id="lastName" name="lastName" type="text" className="w-full px-4 py-3.5 rounded-xl border border-[#DCDCDC] bg-[#F9F9F9] focus:outline-none focus:border-[#111] focus:bg-white transition-all shadow-sm" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <label htmlFor="email" className="text-sm font-bold text-[#333]">Email Address</label>
                <input required id="email" name="email" type="email" className="w-full px-4 py-3.5 rounded-xl border border-[#DCDCDC] bg-[#F9F9F9] focus:outline-none focus:border-[#111] focus:bg-white transition-all shadow-sm" placeholder="john@company.com" />
              </div>

              <div className="space-y-2 mb-8 flex-1">
                <label htmlFor="message" className="text-sm font-bold text-[#333]">Message</label>
                <textarea required id="message" name="message" rows={5} className="w-full h-[calc(100%-28px)] min-h-[120px] px-4 py-3.5 rounded-xl border border-[#DCDCDC] bg-[#F9F9F9] focus:outline-none focus:border-[#111] focus:bg-white transition-all resize-none shadow-sm" placeholder="Tell us about your project or inquiry..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 px-8 rounded-xl bg-[#111] text-white font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-auto"
              >
                {loading ? "Sending Message..." : "Send Message"}
                {!loading && <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
