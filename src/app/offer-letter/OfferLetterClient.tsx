"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { Printer, Download } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function OfferLetterClient({ studentName, programName, fallbackDate, programId }: { studentName: string, programName: string, fallbackDate: string, programId?: string }) {
  const [actualDate, setActualDate] = React.useState(fallbackDate);
  useEffect(() => {
    async function fetchEnrollmentDate() {
      if (programId) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('student_enrollments')
              .select('enrolled_at')
              .eq('student_id', user.id)
              .eq('internship_id', programId)
              .single();
            if (data && data.enrolled_at) {
              const dateObj = new Date(data.enrolled_at);
              setActualDate(dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
            }
          }
        } catch (e) {
          console.error("Failed to fetch date:", e);
        }
      }
      
      const timer = setTimeout(() => {
        window.print();
      }, 800);
    }
    fetchEnrollmentDate();
  }, [programId]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 0; }
          body, html { margin: 0 !important; padding: 0 !important; background-color: white !important; }
        }
      `}} />
      <div className="min-h-screen bg-white print:p-0 print:m-0 print:block overflow-auto flex justify-center">
        {/* Floating Download Button (Hidden during print) */}
        <button 
          onClick={() => window.print()}
          className="fixed top-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-2 font-bold transition-transform hover:scale-105 print:hidden z-50"
        >
          <Printer className="w-5 h-5" />
          Download Offer Letter
        </button>

        {/* A4 Paper Container */}
        <div className="w-full max-w-[210mm] min-h-[297mm] bg-white relative overflow-hidden shrink-0 print:w-[210mm] print:h-[297mm] print:m-0 print:border-none">
          {/* Decorative Header Border */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-600 to-indigo-900 print:bg-blue-600" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
          
          {/* Content Padding */}
          <div className="p-10 sm:p-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-10 mt-2">
              <div className="flex items-center gap-1 group pb-1">
                <div className="relative">
                  <Image 
                    src="/logo.png" 
                    alt="Quantim Labs Logo" 
                    width={160} 
                    height={40} 
                    className="relative object-contain h-10 w-auto z-10" 
                    style={{ filter: "brightness(0)" }}
                    priority 
                  />
                </div>
                
                <div className="h-8 w-px bg-slate-300 mx-3 transform rotate-12" />
                
                <div className="flex flex-col justify-center pb-1">
                  <span className="text-[22px] font-heading font-black tracking-tighter text-slate-900 leading-normal pt-1 pb-1">
                    QUANTIM<span className="text-blue-600" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', color: '#2563eb' }}>LABS</span>
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-3xl font-heading font-black tracking-tight text-slate-900 uppercase">Offer Letter</h2>
                <p className="text-slate-500 font-medium mt-2">Ref: QL-{new Date().getFullYear()}-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
                <p className="text-slate-500 font-medium">{actualDate}</p>
              </div>
            </div>

            {/* Letter Body */}
            <div className="space-y-4 text-slate-800 leading-relaxed text-justify text-[14px]">
              <p className="font-bold text-lg text-slate-900">Dear {studentName},</p>
              
              <p>
                Congratulations! We are thrilled to officially offer you a position in the <span className="font-bold text-blue-700" style={{ color: '#1d4ed8' }}>{programName}</span> Internship Program at <strong className="font-heading text-slate-900">QUANTIM LABS</strong>. 
              </p>

              <p>
                Your selection is a testament to your potential, dedication, and passion for technology. At Quantim Labs, we are committed to bridging the gap between theoretical knowledge and real-world execution. During this program, you will undergo rigorous, structured training, participate in practical hands-on modules, and build enterprise-grade projects under the guidance of our world-class mentors.
              </p>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl my-6" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <p className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Program Details:</p>
                <ul className="space-y-3 list-none p-0 m-0">
                  <li className="flex"><span className="w-32 font-semibold text-slate-600">Role:</span> <span className="font-medium text-slate-900">Intern, {programName}</span></li>
                  <li className="flex"><span className="w-32 font-semibold text-slate-600">Format:</span> <span className="font-medium text-slate-900">Remote / Interactive Sandbox</span></li>
                  <li className="flex"><span className="w-32 font-semibold text-slate-600">Start Date:</span> <span className="font-medium text-slate-900">{actualDate}</span></li>
                  <li className="flex"><span className="w-32 font-semibold text-slate-600">Status:</span> <span className="font-bold text-emerald-600" style={{ color: '#059669' }}>Officially Enrolled</span></li>
                </ul>
              </div>

              <p>
                This is a verified offer of internship. We expect our interns to demonstrate the highest levels of professionalism, curiosity, and commitment. By participating in this program, you agree to adhere to our code of conduct and complete the required modules to earn your final verified certification.
              </p>

              <p>
                We are excited to welcome you to the team and look forward to witnessing your growth into a future tech leader. 
              </p>

              <p className="pt-4 font-bold text-slate-900">
                Welcome to the future of tech.
              </p>
            </div>

            {/* Signature Section */}
            <div className="mt-12 flex justify-between items-end relative">
              <div>
                {/* Fake signature image could go here, using stylized font for now */}
                <div className="font-heading text-4xl text-blue-900/60 -ml-2 mb-2 italic" style={{ fontFamily: 'Brush Script MT, cursive', color: 'rgba(30, 58, 138, 0.6)' }}>Hashim</div>
                <div className="w-48 h-px bg-slate-300 mb-2" />
                <p className="font-bold text-slate-900">Dr. Hashim</p>
                <p className="text-sm text-slate-500">Director of Programs</p>
                <p className="text-sm font-heading font-black tracking-tight text-slate-900 mt-1">QUANTIM LABS</p>
              </div>

              {/* Verified Badge / Stamp */}
              <div className="absolute right-0 bottom-0 w-36 h-36 rounded-full border-[6px] border-blue-600/20 flex flex-col items-center justify-center text-blue-600 transform -rotate-12 opacity-80" style={{ borderColor: 'rgba(37, 99, 235, 0.2)', color: '#2563eb', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <div className="w-32 h-32 rounded-full border border-blue-600/30 flex flex-col items-center justify-center p-2" style={{ borderColor: 'rgba(37, 99, 235, 0.3)' }}>
                  <span className="font-black text-xl tracking-widest uppercase">Verified</span>
                  <span className="text-xs font-bold mt-1 tracking-[0.2em]">OFFICIAL</span>
                  <span className="text-[9px] mt-2 text-blue-800 font-medium" style={{ color: '#1e40af' }}>{actualDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
