"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Play, ShieldAlert, Cpu, Sparkles } from "lucide-react";

// Pentatonic scale frequencies for harmonious sound synthesis (C minor pentatonic)
const NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

// 3D vertices for a holographic cube projection
const VERTICES = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
];

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0], // Back face
  [4, 5], [5, 6], [6, 7], [7, 4], // Front face
  [0, 4], [1, 5], [2, 6], [3, 7]  // Connectors
];

export default function CoreTerminal() {
  const [logs, setLogs] = useState<string[]>([
    "QUANTIM-CORE v1.0.4 loaded successfully.",
    "Initializing neural node network... OK",
    "System standby. Awaiting interface input..."
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [matrixActive, setMatrixActive] = useState(false);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);

  const holoRef = useRef<HTMLCanvasElement>(null);
  const matrixRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 3D rotation angles
  const angleRef = useRef({ x: 0.4, y: 0.3, z: 0 });
  const mouseVelocity = useRef({ x: 0.01, y: 0.01 });

  // Native Web Audio Synthesizer Node
  const playSynthesizerNote = (frequency: number, type: OscillatorType = "sine", duration = 0.3) => {
    if (typeof window === "undefined") return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      // Resume context if browser suspended it
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Lowpass filter to give it a warm sci-fi sound
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      // Attack-Decay envelope to prevent popping/clicking
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext initialization blocked:", e);
    }
  };

  // Sound sweep effect for System Override
  const playScanSweep = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = audioCtxRef.current || (AudioContextClass ? new AudioContextClass() : null);
      if (!ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.8);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  };

  // Hologram 3D Wireframe Projection loop
  useEffect(() => {
    const canvas = holoRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;
    let isRunning = true;
    let isIntersecting = false;

    const project = (x: number, y: number, z: number) => {
      // 3D rotation math
      // Rotate Y
      const cosY = Math.cos(angleRef.current.y);
      const sinY = Math.sin(angleRef.current.y);
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;

      // Rotate X
      const cosX = Math.cos(angleRef.current.x);
      const sinX = Math.sin(angleRef.current.x);
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      // Project onto 2D viewport
      const distance = 3.5;
      const scale = width * 0.28;
      const xp = (x1 * scale) / (z2 + distance) + width / 2;
      const yp = (y2 * scale) / (z2 + distance) + height / 2;

      return { x: xp, y: yp };
    };

    const animate = () => {
      if (!isRunning || !isIntersecting) return;

      ctx.clearRect(0, 0, width, height);

      // Increment rotation angles based on speed
      angleRef.current.x += mouseVelocity.current.x;
      angleRef.current.y += mouseVelocity.current.y;

      // Slow deceleration down to baseline speed
      mouseVelocity.current.x += (0.006 - mouseVelocity.current.x) * 0.05;
      mouseVelocity.current.y += (0.008 - mouseVelocity.current.y) * 0.05;

      // Draw projected edges
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.lineWidth = 1;

      EDGES.forEach(([f, t]) => {
        const p1 = project(VERTICES[f][0], VERTICES[f][1], VERTICES[f][2]);
        const p2 = project(VERTICES[t][0], VERTICES[t][1], VERTICES[t][2]);

        // Draw edge line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Node points with faint outer halos
        ctx.fillStyle = "rgba(59, 130, 246, 0.75)";
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        isIntersecting = entries[0].isIntersecting;
        if (isIntersecting && isRunning) {
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    return () => {
      isRunning = false;
      observer.disconnect();
    };
  }, []);

  // Matrix Digital Rain effect loop
  useEffect(() => {
    if (!matrixActive) return;

    const canvas = matrixRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / 20);
    const rainDrops: number[] = Array(columns).fill(1);
    let isRunning = true;

    const drawMatrix = () => {
      if (!isRunning) return;

      // Semi-transparent black background to create trails
      ctx.fillStyle = "rgba(15, 23, 42, 0.09)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(59, 130, 246, 0.65)"; // Neon Blue Matrix Text
      ctx.font = "15px monospace";

      for (let i = 0; i < rainDrops.length; i++) {
        // Random binary/katakana characters
        const text = Math.random() > 0.5 ? "1" : "0";
        const x = i * 20;
        const y = rainDrops[i] * 20;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }

      requestAnimationFrame(drawMatrix);
    };

    const interval = setTimeout(() => {
      // Self-terminate after 4 seconds
      setMatrixActive(false);
    }, 4000);

    drawMatrix();

    return () => {
      isRunning = false;
      clearTimeout(interval);
    };
  }, [matrixActive]);

  // Handle hologram drag to change velocity
  const handleMouseMoveHolo = (e: React.MouseEvent) => {
    mouseVelocity.current = {
      x: e.movementX * 0.005,
      y: e.movementY * 0.005
    };
  };

  // Run mock Diagnostic Scan
  const runDiagnostics = () => {
    if (isScanning) return;
    setIsScanning(true);
    playSynthesizerNote(440, "sine", 0.15);

    const stages = [
      { msg: "Connecting core processors to LLM modules...", delay: 600, freq: 523 },
      { msg: "Synthesizing custom agent routing metrics...", delay: 1300, freq: 587 },
      { msg: "Testing sandbox environment database locks...", delay: 2000, freq: 659 },
      { msg: "Diagnostics complete: SYSTEM STABLE. 0 errors found.", delay: 2800, freq: 783 }
    ];

    setLogs(["Initiating full diagnostics scan..."]);

    stages.forEach((stage) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, stage.msg]);
        playSynthesizerNote(stage.freq, "sine", 0.08);
        if (stage.msg.includes("complete")) {
          setIsScanning(false);
        }
      }, stage.delay);
    });
  };

  const triggerMatrixOverride = () => {
    playScanSweep();
    setMatrixActive(true);
    setLogs((prev) => [
      ...prev,
      ">> WARNING: GENERAL SECURITY MATRIX OVERRIDE ACTIVATED.",
      ">> Rendering visual matrix simulation... OK"
    ]);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-background border-t border-border select-none">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Global Matrix Overlay */}
      {matrixActive && (
        <div className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-1000">
          <canvas ref={matrixRef} className="block w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-sm font-semibold text-primary">Core Command Center</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Quantim Labz <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Core Controller</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Interact with the core systems below. Sweep your mouse across the grid to play sounds, rotate the hologram, or run diagnostics.
          </p>
        </div>

        {/* Console Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Card 1: Interactive Audio Synthesizer Matrix Grid */}
          <div className="lg:col-span-6 rounded-3xl border border-border/60 bg-card/40 p-6 flex flex-col justify-between backdrop-blur-sm shadow-xl relative overflow-hidden">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Holographic Sound Matrix</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Hover or slide your mouse across the grid cells below to trigger real-time synthesized audio waves (0 payload lag).
              </p>
            </div>

            {/* Frequencies Grid Matrix */}
            <div className="grid grid-cols-8 gap-2 aspect-[8/4] w-full">
              {Array.from({ length: 4 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => {
                  const freq = NOTES[c] * (1 - r * 0.12);
                  const isCellHovered = activeCell?.r === r && activeCell?.c === c;
                  return (
                    <div
                      key={`${r}-${c}`}
                      onMouseEnter={() => {
                        setActiveCell({ r, c });
                        playSynthesizerNote(freq, "triangle", 0.25);
                      }}
                      onMouseLeave={() => setActiveCell(null)}
                      style={{
                        backgroundColor: isCellHovered ? `hsla(${c * 45}, 85%, 65%, 0.35)` : "rgba(255,255,255,0.02)",
                        borderColor: isCellHovered ? `hsla(${c * 45}, 85%, 65%, 0.5)` : "rgba(255,255,255,0.06)"
                      }}
                      className="border rounded-xl transition-all duration-100 flex items-center justify-center cursor-pointer shadow-inner"
                    />
                  );
                })
              )}
            </div>
            
            <div className="mt-6 text-[10px] text-muted-foreground font-mono text-center">
              * Generates C-Minor Pentatonic scale frequencies dynamically on client thread.
            </div>
          </div>

          {/* Card 2: 3D Hologram Projection */}
          <div className="lg:col-span-3 rounded-3xl border border-border/60 bg-card/40 p-6 flex flex-col justify-between items-center backdrop-blur-sm shadow-xl">
            <div className="w-full text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Core Hologram</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Drag to spin the system node projection.
              </p>
            </div>

            {/* 3D Wireframe Canvas */}
            <div 
              onMouseMove={handleMouseMoveHolo}
              className="w-full aspect-square relative cursor-grab active:cursor-grabbing max-w-[200px]"
            >
              <canvas
                ref={holoRef}
                width={200}
                height={200}
                className="block w-full h-full"
              />
            </div>

            <div className="text-[10px] text-muted-foreground font-mono select-none">
              Node Projection Matrix [OK]
            </div>
          </div>

          {/* Card 3: Diagnostics Console Terminal */}
          <div className="lg:col-span-3 rounded-3xl border border-border/60 bg-card/40 p-6 flex flex-col justify-between backdrop-blur-sm shadow-xl font-mono relative overflow-hidden">
            {/* Holographic scanning overlay */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/20 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-primary font-bold">
                <TerminalIcon className="w-4 h-4 animate-pulse" />
                <span>Diagnostics</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Online</span>
            </div>

            {/* Logs Output */}
            <div className="flex-1 text-[11px] text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] space-y-2 mb-4 pr-1 select-text scrollbar-thin">
              {logs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap border-l-2 border-primary/40 pl-2">
                  {log}
                </div>
              ))}
            </div>

            {/* Diagnostic Actions */}
            <div className="space-y-2">
              <button
                onClick={runDiagnostics}
                disabled={isScanning}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                {isScanning ? "Scanning..." : "Run Diagnostics"}
              </button>

              <button
                onClick={triggerMatrixOverride}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 border bg-slate-500/10 text-slate-300 border-slate-500/20 hover:bg-slate-500/20"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Matrix Override
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
