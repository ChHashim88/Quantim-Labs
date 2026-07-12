"use client";

import { Code, AppWindow, Smartphone, Search, Megaphone, Palette } from "lucide-react";

const servicesTop = [
  { title: "Web Development", image: "/s1.jpg", icon: Code },
  { title: "Web App Development", image: "/s2.jpg", icon: AppWindow },
  { title: "Mobile App", image: "/s3.jpg", icon: Smartphone },
  { title: "SEO", image: "/s4.jpg", icon: Search },
  { title: "Digital Marketing", image: "/s5.jpg", icon: Megaphone },
  { title: "Graphic Design", image: "/s6.jpg", icon: Palette },
];

const servicesBottom = [
  { title: "Graphic Design", image: "/s6.jpg", icon: Palette },
  { title: "Digital Marketing", image: "/s5.jpg", icon: Megaphone },
  { title: "SEO", image: "/s4.jpg", icon: Search },
  { title: "Mobile App", image: "/s3.jpg", icon: Smartphone },
  { title: "Web App Development", image: "/s2.jpg", icon: AppWindow },
  { title: "Web Development", image: "/s1.jpg", icon: Code },
];

const ServiceCard = ({ title, image, icon: Icon }: { title: string; image: string; icon: any }) => (
  <div className="group rounded-2xl bg-white border border-border hover:border-[#AAAAAA] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col w-[320px] shrink-0 mx-3">
    <div className="h-[200px] w-full relative overflow-hidden border-b border-border shadow-inner">
      <img
        src={image}
        alt={title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />
    </div>
    <div className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
    </div>
  </div>
);

export function ServicesMarquee() {
  return (
    <section className="py-24 bg-background overflow-hidden relative border-b border-border">
      {/* Inject pure CSS animation styles to utilize GPU acceleration */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-left {
          animation: marquee-left 40s linear infinite;
          will-change: transform;
        }
        .animate-marquee-right {
          animation: marquee-right 40s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="text-center max-w-3xl mx-auto mb-16 px-4">
        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
          Our <span className="text-primary">Services</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Elevate your digital presence with our comprehensive solutions built for modern businesses.
        </p>
      </div>

      <div className="relative flex flex-col gap-8 marquee-container">
        {/* Top Marquee (Forward) */}
        <div className="w-full flex">
          <div className="flex w-max shrink-0 animate-marquee-left">
            {[...servicesTop, ...servicesTop].map((service, idx) => (
              <ServiceCard key={idx} title={service.title} image={service.image} icon={service.icon} />
            ))}
          </div>
        </div>

        {/* Bottom Marquee (Backward) */}
        <div className="w-full flex">
          <div className="flex w-max shrink-0 animate-marquee-right">
            {[...servicesBottom, ...servicesBottom].map((service, idx) => (
              <ServiceCard key={idx} title={service.title} image={service.image} icon={service.icon} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
