"use client";

import { useRef, useState, MouseEvent } from "react";
import { Cpu, Globe, Rocket, Shield, Terminal } from "lucide-react";

interface TechCurve {
  id: string;
  name: string;
  category: string;
  growth: string;
  status: string;
  color: string;
  icon: any;
  points: number[];
  basePercentage: number[];
}

const CURVES_DATA: TechCurve[] = [
  {
    id: "ai",
    name: "AI & LLM Engines",
    category: "Artificial Intelligence",
    growth: "+240%",
    status: "Hyper-Growth",
    color: "#3b82f6", // Blue
    icon: Cpu,
    points: [270, 250, 190, 110, 50, 20],
    basePercentage: [10, 16, 36, 63, 83, 93],
  },
  {
    id: "agents",
    name: "AI Agent Orchestration",
    category: "Autonomous Systems",
    growth: "+180%",
    status: "Trending",
    color: "#2563eb", // Dark Blue
    icon: Terminal,
    points: [290, 280, 230, 160, 90, 40],
    basePercentage: [3, 6, 23, 46, 70, 86],
  },
  {
    id: "nextjs",
    name: "Next.js & React 19",
    category: "Frontend Stack",
    growth: "+95%",
    status: "Standard",
    color: "#60a5fa", // Sky Blue
    icon: Globe,
    points: [160, 150, 130, 100, 80, 70],
    basePercentage: [46, 50, 56, 66, 73, 76],
  },
  {
    id: "supabase",
    name: "Supabase & Postgres",
    category: "Database & Auth",
    growth: "+110%",
    status: "Scaling Fast",
    color: "#0ea5e9", // Cyan Blue
    icon: Shield,
    points: [220, 210, 180, 140, 120, 90],
    basePercentage: [26, 30, 40, 53, 60, 70],
  },
  {
    id: "cloud",
    name: "Cloud Architecture",
    category: "DevOps & Scaling",
    growth: "+85%",
    status: "Enterprise",
    color: "#94a3b8", // Slate Gray
    icon: Rocket,
    points: [110, 105, 95, 80, 75, 55],
    basePercentage: [63, 65, 68, 73, 75, 81],
  }
];

const lerp = (start: number, end: number, t: number) => {
  return (1 - t) * start + t * end;
};

export default function InteractiveConstellation() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeCurves, setActiveCurves] = useState<{ [key: string]: boolean }>({
    ai: true,
    agents: true,
    nextjs: true,
    supabase: true,
    cloud: true
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const cursorLineRef = useRef<SVGLineElement>(null);
  
  // Refs to mutate DOM elements directly (bypassing React re-renders for mouse movements)
  const dotsRefs = useRef<{ [key: string]: SVGGElement | null }>({});
  const tooltipValsRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const tooltip = tooltipRef.current;
    const line = cursorLineRef.current;
    if (!svg || !tooltip || !line) return;

    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const yMouse = ((e.clientY - rect.top) / rect.height) * 300;

    const clampedX = Math.max(0, Math.min(500, x));
    const segmentWidth = 100;
    const index = Math.floor(clampedX / segmentWidth);
    const nextIndex = Math.min(index + 1, 5);
    const t = (clampedX % segmentWidth) / segmentWidth;

    // Show indicator elements
    line.style.opacity = "1";
    tooltip.style.opacity = "1";

    // Set cursor line X positions
    line.setAttribute("x1", clampedX.toString());
    line.setAttribute("x2", clampedX.toString());

    // Update tooltip position
    tooltip.style.left = `${clampedX > 320 ? clampedX - 170 : clampedX + 20}px`;
    tooltip.style.top = `${Math.min(180, Math.max(10, yMouse - 60))}px`;

    // Direct DOM mutation for intersection dots & text values
    CURVES_DATA.forEach((curve) => {
      const y = lerp(curve.points[index], curve.points[nextIndex], t);
      const pct = Math.round(lerp(curve.basePercentage[index], curve.basePercentage[nextIndex], t));

      // Mutate intersection dot positions directly
      const dotGroup = dotsRefs.current[curve.id];
      if (dotGroup) {
        dotGroup.style.opacity = activeCurves[curve.id] ? "1" : "0";
        const circles = dotGroup.querySelectorAll("circle");
        circles.forEach((circle) => circle.setAttribute("cy", y.toString()));
      }

      // Mutate tooltip text value directly
      const valSpan = tooltipValsRefs.current[curve.id];
      if (valSpan) {
        valSpan.innerText = `${pct}%`;
        const itemRow = valSpan.parentElement;
        if (itemRow) {
          itemRow.style.display = activeCurves[curve.id] ? "flex" : "none";
        }
      }
    });
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
    if (cursorLineRef.current) cursorLineRef.current.style.opacity = "0";
    
    CURVES_DATA.forEach((curve) => {
      const dotGroup = dotsRefs.current[curve.id];
      if (dotGroup) dotGroup.style.opacity = "0";
    });
  };

  const toggleCurve = (id: string) => {
    setActiveCurves((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      // Hide dot immediately if toggled off
      const dotGroup = dotsRefs.current[id];
      if (dotGroup) dotGroup.style.opacity = updated[id] ? "1" : "0";
      return updated;
    });
  };

  return (
    <div className="grid lg:grid-cols-12 gap-12 items-stretch">
      {/* Left Column: Tech Selection & Description */}
      <div className="lg:col-span-5 flex flex-col justify-between py-2">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 w-fit">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">Live Stack Velocity Index</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Quantim Labz <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Trending Index</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Interactive metrics of global stack momentum. Hover over the waves to see current indices, and toggle components to customize your dashboard.
          </p>
        </div>

        {/* Custom Toggle List */}
        <div className="space-y-3">
          {CURVES_DATA.map((item) => {
            const Icon = item.icon;
            const isHovered = item.id === hoveredId;
            const isActive = activeCurves[item.id];
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => toggleCurve(item.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                  !isActive 
                    ? "opacity-40 hover:opacity-60 border-border/20 bg-card/10" 
                    : isHovered
                    ? "bg-card border-border shadow-lg -translate-x-1"
                    : "bg-card/40 border-border/50 hover:bg-card/85"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? `${item.color}15` : "rgba(255,255,255,0.02)",
                      color: isActive ? item.color : "gray",
                      border: `1px solid ${isActive ? `${item.color}30` : "transparent"}`
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground transition-colors group-hover:text-primary">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="text-sm font-bold block"
                    style={{ color: isActive ? item.color : "gray" }}
                  >
                    {item.growth}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Interactive SVG Area Wave Chart */}
      <div className="lg:col-span-7 relative w-full bg-card/30 border border-border/50 rounded-3xl p-6 shadow-2xl backdrop-blur-sm flex flex-col justify-between min-h-[500px]">
        {/* Y Axis Indicators */}
        <div className="absolute left-6 top-6 bottom-12 flex flex-col justify-between text-[10px] text-muted-foreground font-mono select-none pointer-events-none">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* SVG Container */}
        <div className="flex-1 w-full pl-8 pb-6 relative">
          <svg
            ref={svgRef}
            className="w-full h-full cursor-crosshair overflow-visible"
            viewBox="0 0 500 300"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid Lines */}
            <line x1="0" y1="0" x2="500" y2="0" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="225" x2="500" y2="225" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="2 4" />
            <line x1="0" y1="300" x2="500" y2="300" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

            {/* Vertical grid lines */}
            <line x1="100" y1="0" x2="100" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="400" y1="0" x2="400" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

            {/* Render Curves */}
            {CURVES_DATA.map((curve) => {
              const isActive = activeCurves[curve.id];
              if (!isActive) return null;

              const isHighlighted = hoveredId === curve.id;
              const isOtherHighlighted = hoveredId !== null && hoveredId !== curve.id;

              // Generate Bezier path string
              const pathD = `M 0,${curve.points[0]} 
                             C 50,${curve.points[0]} 50,${curve.points[1]} 100,${curve.points[1]} 
                             C 150,${curve.points[1]} 150,${curve.points[2]} 200,${curve.points[2]} 
                             C 250,${curve.points[2]} 250,${curve.points[3]} 300,${curve.points[3]} 
                             C 350,${curve.points[3]} 350,${curve.points[4]} 400,${curve.points[4]} 
                             C 450,${curve.points[4]} 450,${curve.points[5]} 500,${curve.points[5]}`;

              // Generate Area path closed to the bottom
              const areaD = `${pathD} L 500,300 L 0,300 Z`;

              return (
                <g 
                  key={curve.id} 
                  className="transition-all duration-300"
                  style={{ opacity: isOtherHighlighted ? 0.15 : 1 }}
                >
                  {/* Glowing wide stroke (Zero GPU Cost Glow Layer) */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={curve.color}
                    strokeWidth={isHighlighted ? 8 : 4}
                    strokeLinecap="round"
                    className="opacity-20"
                  />

                  {/* Sharp core stroke */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={curve.color}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeLinecap="round"
                  />

                  {/* Gradient Area Fill */}
                  <path
                    d={areaD}
                    fill={`url(#area-grad-${curve.id})`}
                    className="opacity-5 group-hover:opacity-10 transition-opacity"
                  />

                  {/* Definitions for Gradients */}
                  <defs>
                    <linearGradient id={`area-grad-${curve.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={curve.color} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={curve.color} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </g>
              );
            })}

            {/* Mouse Tracking Indicator Line */}
            <line
              ref={cursorLineRef}
              x1="250"
              y1="0"
              x2="250"
              y2="300"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              strokeDasharray="4 4"
              style={{ opacity: 0, transition: "opacity 0.2s" }}
            />

            {/* Dynamic Intersection Nodes */}
            {CURVES_DATA.map((curve) => (
              <g
                key={curve.id}
                ref={(el) => { dotsRefs.current[curve.id] = el; }}
                style={{ opacity: 0, transition: "opacity 0.2s" }}
              >
                {/* Outer Glow Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={7}
                  fill={curve.color}
                  className="opacity-30"
                />
                {/* Core Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={3.5}
                  fill="#ffffff"
                  stroke={curve.color}
                  strokeWidth="2.5"
                />
              </g>
            ))}
          </svg>

          {/* Floating Tooltip Card (Mutated directly in DOM on hover) */}
          <div
            ref={tooltipRef}
            className="absolute pointer-events-none bg-card/90 border border-border/80 backdrop-blur-md rounded-2xl p-4 shadow-xl z-30 flex flex-col gap-2 min-w-[170px]"
            style={{
              opacity: 0,
              left: "0px",
              top: "0px",
              transition: "opacity 0.2s, left 0.05s ease-out, top 0.05s ease-out"
            }}
          >
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              Trend Index Stats
            </div>
            <div className="flex flex-col gap-1.5">
              {CURVES_DATA.map((curve) => (
                <div 
                  key={curve.id} 
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: curve.color }} />
                    {curve.name.split(" ")[0]}
                  </div>
                  <span 
                    ref={(el) => { tooltipValsRefs.current[curve.id] = el; }}
                    className="font-mono font-bold" 
                    style={{ color: curve.color }}
                  >
                    0%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* X Axis Labels */}
        <div className="w-full pl-8 flex justify-between text-[10px] text-muted-foreground font-mono select-none pointer-events-none">
          <span>Q1 2025</span>
          <span>Q2 2025</span>
          <span>Q3 2025</span>
          <span>Q4 2025</span>
          <span>Q1 2026</span>
          <span>Present</span>
        </div>
      </div>
    </div>
  );
}
