"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Blocks, Code, Trophy } from "lucide-react";

const timelineData = [
  {
    id: "structured-learning",
    title: "1. Structured Learning",
    description: "Acquire top-tier theoretical and practical knowledge through structured daily modules. Lessons remain locked until previous parts are fully viewed to guarantee completion.",
    carouselData: [
      {
        title: "Daily Modules",
        desc: "Follow a clear path of sequential lessons. You must complete each concept before unlocking the next, ensuring a solid foundation.",
      }
    ],
    topClass: "md:top-[13.84%]",
    contentTopClass: "md:top-[30.76%]",
    textOrderClass: "order-2 md:order-1",
    visualOrderClass: "order-1 md:order-2",
    visualAlignClass: "justify-center md:justify-end",
    descClass: ""
  },
  {
    id: "practical-development",
    title: "2. Practical Development",
    description: "Apply what you learn in custom coding assignments and projects. Sync code directly in the browser and watch tests pass in real-time under automated AI grading.",
    carouselData: [
      {
        title: "Browser-based Sandbox",
        desc: "Code, test, and debug without leaving the browser. Our AI-powered grading system gives you instant feedback on your assignments.",
      }
    ],
    topClass: "md:top-[47.69%]",
    contentTopClass: "md:top-[64.61%]",
    textOrderClass: "",
    visualOrderClass: "",
    visualAlignClass: "justify-start flex w-full",
    descClass: ""
  },
  {
    id: "verifiable-certification",
    title: "3. Verifiable Certification",
    description: "Receive cryptographically secure, QR-verifiable certificates on graduation. Showcase your verified internship experience and skills to partner employers.",
    carouselData: [
      {
        title: "Industry Recognition",
        desc: "Stand out to top tech companies with a certification that proves you have real-world development experience, not just theoretical knowledge.",
      }
    ],
    topClass: "md:top-[81.53%]",
    contentTopClass: "md:mt-0 md:top-[94.61%]",
    textOrderClass: "order-2 md:order-1",
    visualOrderClass: "order-1 md:order-2",
    visualAlignClass: "justify-center md:justify-end w-full",
    descClass: "opacity-100 mb-0 md:mb-0 text-slate-600"
  }
];

export function RoadmapSpine() {
  const [isVisible, setIsVisible] = useState(false);
  
  const [buildIndex, setBuildIndex] = useState(0);
  const [pushIndex, setPushIndex] = useState(0);
  const [featureIndex, setFeatureIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const pathLength = useTransform(
    scrollYProgress,
    [0, 0.0615, 0.4, 0.7384],
    [0, 0.05, 0.525, 1],
  );

  const [image1Src, setImage1Src] = useState("/lineBox.svg");
  const [image2Src, setImage2Src] = useState("/LinBox2.svg");
  const [image3Src, setImage3Src] = useState("/LinBox3.svg");

  const node1Ref = useRef<HTMLDivElement>(null);
  const node2Ref = useRef<HTMLDivElement>(null);
  const node3Ref = useRef<HTMLDivElement>(null);

  const mobileThresholds = useRef({ n1: 0.05, n2: 0.45, n3: 0.8 });

  const img1Ref = useRef("/lineBox.svg");
  const img2Ref = useRef("/LinBox2.svg");
  const img3Ref = useRef("/LinBox3.svg");

  const isMobileRef = useRef(false);

  useEffect(() => {
    const update = () => { isMobileRef.current = window.innerWidth < 768; };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let s1: string, s2: string, s3: string;
    if (!isMobileRef.current) {
      s1 = latest >= 0.0615 ? "/lbAnimation1.svg" : "/lineBox.svg";
      s2 = latest >= 0.4 ? "/lbAnimation2.svg" : "/LinBox2.svg";
      s3 = latest >= 0.7384 ? "/lbAnimation3.svg" : "/LinBox3.svg";
    } else {
      const { n1, n2, n3 } = mobileThresholds.current;
      s1 = latest >= n1 ? "/lbAnimation1.svg" : "/lineBox.svg";
      s2 = latest >= n2 ? "/lbAnimation2.svg" : "/LinBox2.svg";
      s3 = latest >= n3 ? "/lbAnimation3.svg" : "/LinBox3.svg";
    }

    if (s1 !== img1Ref.current) { img1Ref.current = s1; setImage1Src(s1); }
    if (s2 !== img2Ref.current) { img2Ref.current = s2; setImage2Src(s2); }
    if (s3 !== img3Ref.current) { img3Ref.current = s3; setImage3Src(s3); }
  });

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 768) return;

    const measure = () => {
      const container = timelineRef.current;
      const n1 = node1Ref.current;
      const n2 = node2Ref.current;
      const n3 = node3Ref.current;
      if (!container || !n1 || !n2 || !n3) return;

      const h = container.scrollHeight;
      const lineLength = h - 55; // top-[10px] + bottom-[45px] = 55px inset
      const ctop = container.getBoundingClientRect().top + window.scrollY;

      const nodeToThreshold = (node: HTMLElement) => {
        const nodeY = node.getBoundingClientRect().top + window.scrollY - ctop;

        return Math.min(1, Math.max(0, nodeY / h));
      };

      mobileThresholds.current = {
        n1: nodeToThreshold(n1),
        n2: nodeToThreshold(n2),
        n3: nodeToThreshold(n3),
      };
    };

    let id: number;
    const raf = requestAnimationFrame(() => {
      id = requestAnimationFrame(measure);
    });
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(id); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative w-full bg-white overflow-hidden flex flex-col items-center py-0 md:pt-[5px] md:pb-[100px] pt-[50px] border-t border-slate-100"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none transform-gpu"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1000px] bg-[radial-gradient(circle,rgba(37,99,235,0.05)_0%,transparent_70%)] pointer-events-none transform-gpu"></div>

      <div
        className={`w-full max-w-[1200px] mx-auto px-6 relative z-10 transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="flex flex-col items-center text-center mb-[10px] md:mb-10">
          <div className="flex items-center gap-4 mb-6 mt-16">
            <span className="text-blue-600 text-xs md:text-sm font-semibold tracking-widest uppercase bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              YOUR CAREER PATHWAY
            </span>
          </div>

          <h2 className="text-[25px] md:text-5xl lg:text-6xl font-normal md:font-bold tracking-normal md:tracking-tight text-slate-900 mb-6 w-full max-w-[339px] md:max-w-4xl mx-auto leading-[32px] md:leading-tight font-['Roboto_Condensed'] md:font-sans">
            The <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">Quantim Labs Path</span>
          </h2>

          <p className="text-slate-600 text-[13px] md:text-lg leading-[19px] md:leading-relaxed font-normal text-center w-full max-w-[342px] md:max-w-3xl mx-auto tracking-normal font-sans">
            Our optimized learning methodology designed to bridge the gap between classroom theory and real-world execution.
          </p>
        </div>
        <div ref={timelineRef} className="relative w-full h-auto md:h-[2700px] mt-[10px] md:mt-10 mb-[45px] md:mb-0 flex flex-col gap-[50px] md:block py-[30px] md:py-0">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 transform-gpu">
            <svg
              width="100%"
              height="100%"
              className="absolute inset-0"
              preserveAspectRatio="none"
              viewBox="0 0 1000 2600"
            >
              <defs>
                <linearGradient
                  id="timeline-gradient"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="2600"
                >
                  <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.8" />
                  <stop offset="6.15%" stopColor="#E2E8F0" stopOpacity="0.8" />
                  <stop offset="35%" stopColor="#E2E8F0" stopOpacity="0" />
                  <stop offset="39.9%" stopColor="#E2E8F0" stopOpacity="0" />
                  <stop offset="40%" stopColor="#E2E8F0" stopOpacity="0.8" />
                  <stop offset="68%" stopColor="#E2E8F0" stopOpacity="0" />
                  <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="horizontal-fade"
                  gradientUnits="userSpaceOnUse"
                  x1="350"
                  y1="0"
                  x2="650"
                  y2="0"
                >
                  <stop offset="0%" stopColor="transparent" stopOpacity="0" />
                  <stop offset="50%" stopColor="#E2E8F0" stopOpacity="1" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line
                x1="350"
                y1="0"
                x2="650"
                y2="0"
                stroke="url(#horizontal-fade)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                className="hidden md:block"
                d="M 500 0 L 500 190 A 50 50 0 0 1 450 240 L 200 240 A 50 50 0 0 0 150 290 L 150 430 A 50 50 0 0 0 200 480 L 450 480 A 50 50 0 0 1 500 530 L 500 1070 A 50 50 0 0 0 550 1120 L 800 1120 A 50 50 0 0 1 850 1170 L 850 1310 A 50 50 0 0 1 800 1360 L 550 1360 A 50 50 0 0 0 500 1410 L 500 1920"
                fill="none"
                stroke="url(#timeline-gradient)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <motion.path
                className="hidden md:block"
                d="M 500 0 L 500 190 A 50 50 0 0 1 450 240 L 200 240 A 50 50 0 0 0 150 290 L 150 430 A 50 50 0 0 0 200 480 L 450 480 A 50 50 0 0 1 500 530 L 500 1070 A 50 50 0 0 0 550 1120 L 800 1120 A 50 50 0 0 1 850 1170 L 850 1310 A 50 50 0 0 1 800 1360 L 550 1360 A 50 50 0 0 0 500 1410 L 500 1920"
                fill="none"
                stroke="#2563EB"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ pathLength, willChange: "stroke-dashoffset" }}
              />
            </svg>
          </div>
          <div className="absolute left-[30px] top-[10px] bottom-[45px] w-[2px] block md:hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-slate-200 rounded-full" />
            <motion.div
              className="absolute top-0 bottom-0 left-0 w-full bg-blue-600 origin-top rounded-full shadow-[0_0_8px_#3B82F6]"
              style={{ scaleY: smoothProgress }}
            />
          </div>
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[48px] h-[48px] top-[6.15%]">
            <div className={`w-full h-full flex items-center justify-center rounded-[7px] bg-white border transition-all duration-500 shadow-sm ${image1Src.includes('Animation') ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-200'}`}>
              <Blocks className={`w-6 h-6 ${image1Src.includes('Animation') ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
          </div>
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[48px] h-[48px] top-[40.00%]">
            <div className={`w-full h-full flex items-center justify-center rounded-[7px] bg-white border transition-all duration-500 shadow-sm ${image2Src.includes('Animation') ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-200'}`}>
              <Code className={`w-6 h-6 ${image2Src.includes('Animation') ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
          </div>
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[48px] h-[48px] top-[73.84%]">
            <div className={`w-full h-full flex items-center justify-center rounded-[7px] bg-white border transition-all duration-500 shadow-sm ${image3Src.includes('Animation') ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-200'}`}>
              <Trophy className={`w-6 h-6 ${image3Src.includes('Animation') ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
          </div>
          {timelineData.map((node) => {
            const isStructuredLearning = node.id === "structured-learning";
            const isPracticalDevelopment = node.id === "practical-development";
            const isVerifiableCertification = node.id === "verifiable-certification";

            const currentIndex = isStructuredLearning ? buildIndex : isPracticalDevelopment ? pushIndex : featureIndex;

            const iconSrc = isStructuredLearning ? image1Src : isPracticalDevelopment ? image2Src : image3Src;
            const nodeRef = isStructuredLearning ? node1Ref : isPracticalDevelopment ? node2Ref : node3Ref;
            
            const IconComponent = isStructuredLearning ? Blocks : isPracticalDevelopment ? Code : Trophy;

            return (
              <React.Fragment key={node.id}>
                <div
                  className={`relative md:absolute left-[65px] md:left-1/2 translate-x-0 md:-translate-x-1/2 md:-translate-y-1/2 w-[calc(100%-80px)] md:w-full max-w-2xl px-0 md:px-6 text-left md:text-center z-10 ${node.topClass}`}
                >
                  <div ref={nodeRef} className="absolute left-[-35px] top-[4px] -translate-x-1/2 z-20 w-[36px] h-[36px] block md:hidden">
                    <div className={`w-full h-full flex items-center justify-center rounded-[7px] bg-white border transition-all duration-500 shadow-sm ${iconSrc.includes('Animation') ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-200'}`}>
                      <IconComponent className={`w-4 h-4 ${iconSrc.includes('Animation') ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-[10px] md:mb-6">
                    {node.title}
                  </h3>
                  <p className={`text-slate-600 text-[13px] md:text-lg leading-[19px] md:leading-relaxed font-normal text-left md:text-center w-full max-w-none mx-0 md:mx-auto tracking-normal font-sans ${node.descClass}`}>
                    {node.description}
                  </p>
                </div>

                <div
                  className={`relative md:absolute left-[65px] md:left-0 translate-x-0 md:translate-x-0 right-auto md:right-0 md:-translate-y-1/2 w-[calc(100%-80px)] md:w-full z-10 ${node.contentTopClass}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center px-0 md:px-24">
                    <div className={node.textOrderClass}>
                      <h5 className="text-[22px] max-[360px]:text-[18px] md:text-2xl whitespace-nowrap md:whitespace-normal font-semibold md:font-bold leading-[30px] md:leading-tight tracking-normal text-slate-900 mb-[10px] md:mb-4 text-left font-['Roboto_Condensed'] md:font-sans">{node.carouselData[currentIndex].title}</h5>
                      <p className="text-slate-600 text-[13px] md:text-base leading-[19px] md:leading-relaxed font-normal text-left w-full max-w-none mx-0 tracking-normal font-sans">
                        {node.carouselData[currentIndex].desc}
                      </p>
                    </div>

                    <div className={`relative flex ${node.visualAlignClass} ${node.visualOrderClass}`}>
                      {isStructuredLearning && (
                        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5 w-full max-w-[450px]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                              <span className="font-bold text-slate-900">Module 1: NextJS Core</span>
                              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">Unlocked</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-600 font-medium">1.1 App Router</span>
                                <span className="text-blue-600 text-xs font-semibold">100% Watched</span>
                              </div>
                              <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-600 font-medium">1.2 Server Components</span>
                                <span className="text-blue-500 text-xs font-semibold animate-pulse">Watching Now</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isPracticalDevelopment && (
                        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5 w-full max-w-[450px]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                              <span className="font-bold text-slate-900">Interactive Sandbox</span>
                              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">Live Sync</span>
                            </div>
                            <pre className="text-[10px] md:text-xs bg-slate-900 p-4 rounded-xl text-slate-300 font-mono overflow-x-auto border border-slate-800 shadow-inner">
                              <code>{`// Submit Task 3 for Review\nconst res = await fetch("/api/submit", {\n  method: "POST",\n  body: JSON.stringify({ code })\n});\nif (res.ok) console.log("Passed!");`}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {isVerifiableCertification && (
                        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5 w-full max-w-[450px] flex flex-col items-center text-center justify-center min-h-[220px] mx-auto md:mx-0">
                          <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-4 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                            <Trophy className="w-8 h-8" />
                          </div>
                          <h4 className="font-bold text-slate-900 mb-1">Internship Certified</h4>
                          <p className="text-xs text-slate-500 mb-4 font-mono">ID: INX-2026-9042A</p>
                          <div className="px-6 py-2 bg-slate-900 rounded-xl border border-slate-800 shadow-md">
                            <span className="text-[10px] text-white font-mono font-bold tracking-wider">VERIFIED</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
