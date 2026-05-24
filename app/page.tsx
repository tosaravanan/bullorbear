"use client";

import React, { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

interface SlashEffect {
  x: number;
  y: number;
  type: "bull" | "bear";
  alpha: number;
  points: Array<{dx: number; dy: number}>;
}

export default function MarketFightArena() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Market State
  const [niftyPrice, setNiftyPrice] = useState<number>(23711.90);
  const [priceChange, setPriceChange] = useState<number>(11.90);
  const [changePercent, setChangePercent] = useState<number>(0.05);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Animation Engine Refs
  const engineRef = useRef({
    bullX: 220,
    bearX: 580,
    targetBullX: 220,
    targetBearX: 580,
    baseBullX: 220,
    baseBearX: 580,
    screenShake: 0,
    particles: [] as Particle[],
    slashes: [] as SlashEffect[],
    globalTime: 0
  });

  // Simulation Data Feed (Swap this loop out for Option B API when ready!)
  useEffect(() => {
    const simulateMarketTicks = () => {
      const isUpTick = Math.random() > 0.45; // Balanced with slight movement variance
      const tickSize = (Math.random() * 12) + 2;

      setNiftyPrice((prev) => {
        const nextPrice = isUpTick ? prev + tickSize : prev - tickSize;
        const change = nextPrice - 23700.00;
        const percent = (change / 23700.00) * 100;

        setPriceChange(change);
        setChangePercent(percent);

        // Trigger heavy kinetic animations based on tick directions
        if (isUpTick && tickSize > 5) {
          triggerStrike("bull");
        } else if (!isUpTick && tickSize > 5) {
          triggerStrike("bear");
        }

        return nextPrice;
      });
      setLastUpdated(new Date().toLocaleTimeString());
    };

    const interval = setInterval(simulateMarketTicks, 2500);
    return () => clearInterval(interval);
  }, []);

  const triggerStrike = (aggressor: "bull" | "bear") => {
    const e = engineRef.current;
    e.screenShake = 15;

    const midX = (e.bullX + e.bearX) / 2;
    const midY = 220;

    if (aggressor === "bull") {
      e.targetBullX = e.baseBullX + 110;
      e.targetBearX = e.baseBearX + 40;
      
      // Generate energetic neon green shockwave particles
      for (let i = 0; i < 25; i++) {
        e.particles.push({
          x: midX,
          y: midY + (Math.random() - 0.5) * 40,
          vx: (Math.random() * 8) - 1,
          vy: (Math.random() - 0.5) * 10,
          size: Math.random() * 4 + 2,
          alpha: 1,
          color: Math.random() > 0.3 ? "#22c55e" : "#e2e8f0",
          decay: Math.random() * 0.02 + 0.015
        });
      }

      // Add a kinetic slice effects
      e.slashes.push({
        x: midX - 20,
        y: midY,
        type: "bull",
        alpha: 1,
        points: [{dx: -40, dy: -60}, {dx: 20, dy: 0}, {dx: -40, dy: 60}]
      });
    } else {
      e.targetBearX = e.baseBearX - 110;
      e.targetBullX = e.baseBullX - 40;

      // Generate crimson bear claw slash particles
      for (let i = 0; i < 25; i++) {
        e.particles.push({
          x: midX,
          y: midY + (Math.random() - 0.5) * 40,
          vx: (Math.random() * -8) + 1,
          vy: (Math.random() - 0.5) * 10,
          size: Math.random() * 4 + 2,
          alpha: 1,
          color: Math.random() > 0.3 ? "#ef4444" : "#b91c1c",
          decay: Math.random() * 0.02 + 0.015
        });
      }

      e.slashes.push({
        x: midX + 20,
        y: midY,
        type: "bear",
        alpha: 1,
        points: [{dx: 40, dy: -50}, {dx: -20, dy: 10}, {dx: 40, dy: 50}]
      });
    }
  };

  // Main Canvas Vector Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const drawLowPolyBull = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      // Breathing idle scale modification
      const breathe = Math.sin(time * 0.08) * 2;
      
      // Outer Glow Aura
      ctx.shadowBlur = 25;
      ctx.shadowColor = "rgba(34, 197, 94, 0.6)";
      ctx.fillStyle = "rgba(22, 101, 52, 0.85)";
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2;

      // Low poly structural points map
      ctx.beginPath();
      ctx.moveTo(-110, 20); // Tail area
      ctx.lineTo(-70, -25 + breathe);
      ctx.lineTo(-20, -40 + breathe); // Hump
      ctx.lineTo(20, -35); // Shoulder
      ctx.lineTo(55, -15); // Neck top
      ctx.lineTo(80, -20); // Head crown
      ctx.lineTo(90, 5);   // Snout
      ctx.lineTo(50, 25);   // Jaw
      ctx.lineTo(30, 45);   // Front leg attachment
      ctx.lineTo(10, 15);
      ctx.lineTo(-50, 20);  // Belly
      ctx.lineTo(-80, 50);  // Back leg
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sharp Geometric Highlights (Low-poly facets inside body)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(134, 239, 172, 0.4)";
      ctx.beginPath();
      ctx.moveTo(-20, -40 + breathe); ctx.lineTo(20, -35); ctx.lineTo(10, 15); ctx.closePath();
      ctx.moveTo(20, -35); ctx.lineTo(55, -15); ctx.lineTo(50, 25); ctx.closePath();
      ctx.stroke();

      // Bright Neon Horns
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#22c55e";
      ctx.beginPath();
      ctx.moveTo(60, -18);
      ctx.quadraticCurveTo(85, -45, 110, -45);
      ctx.quadraticCurveTo(85, -25, 68, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    const drawLowPolyBear = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      const breathe = Math.sin(time * 0.07 + 2) * 2.5;

      // Red Threat Glow Aura
      ctx.shadowBlur = 25;
      ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
      ctx.fillStyle = "rgba(153, 27, 27, 0.85)";
      ctx.strokeStyle = "#f87171";
      ctx.lineWidth = 2;

      // Heavy Bear Geometry structural map
      ctx.beginPath();
      ctx.moveTo(90, 35); // Rear hind
      ctx.lineTo(70, -20 + breathe); // Thick spine
      ctx.lineTo(20, -45 + breathe); // Shoulder hump
      ctx.lineTo(-30, -25); // Heavy neck
      ctx.lineTo(-75, -20); // Upper brow
      ctx.lineTo(-90, -2);  // Muzzle tip
      ctx.lineTo(-70, 18);  // Open jaw line
      ctx.lineTo(-40, 15);  // Neck bottom
      ctx.lineTo(-25, 45);  // Front massive paw
      ctx.lineTo(10, 20);   // Underbelly
      ctx.lineTo(50, 55);   // Rear heavy foot
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sharp internal geometric muscle separation paths
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(252, 165, 165, 0.35)";
      ctx.beginPath();
      ctx.moveTo(20, -45 + breathe); ctx.lineTo(-30, -25); ctx.lineTo(-40, 15); ctx.closePath();
      ctx.moveTo(70, -20 + breathe); ctx.lineTo(20, -45 + breathe); ctx.lineTo(10, 20); ctx.closePath();
      ctx.stroke();

      ctx.restore();
    };

    const renderLoop = () => {
      const e = engineRef.current;
      e.globalTime++;      

      // Handle Screen Shake calculation
      let dx = 0; let dy = 0;
      if (e.screenShake > 0) {
        dx = (Math.random() - 0.5) * e.screenShake;
        dy = (Math.random() - 0.5) * e.screenShake;
        e.screenShake *= 0.88; // Quick damping cascade
      }

      // Base Canvas Clean Up
      ctx.fillStyle = "#020617"; // Ultra deep slate background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(dx, dy);

      // --- PERSPECTIVE FLOOR GRID SYSTEM ---
      ctx.strokeStyle = "rgba(30, 41, 59, 0.6)";
      ctx.lineWidth = 1;
      const horizonY = 160;
      
      // Horizontal vanishing grid lines
      for (let i = horizonY; i < canvas.height; i += 22) {
        const ratio = (i - horizonY) / (canvas.height - horizonY);
        ctx.strokeStyle = `rgba(30, 41, 59, ${ratio * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      
      // Vanishing perspective rays coming from horizon center
      ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
      const centerX = canvas.width / 2;
      for (let x = -400; x <= canvas.width + 400; x += 60) {
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Center Line indicator division ring
      ctx.strokeStyle = "rgba(239, 68, 68, 0.2)";
      ctx.beginPath();
      ctx.arc(centerX, 280, 160, Math.PI, 0);
      ctx.stroke();

      // Smooth Position Vector Spring Calculations
      e.bullX += (e.targetBullX - e.bullX) * 0.12;
      e.bearX += (e.targetBearX - e.bearX) * 0.12;

      // Recover to baseline resting state naturally
      if (Math.abs(e.bullX - e.targetBullX) < 4) e.targetBullX = e.baseBullX;
      if (Math.abs(e.bearX - e.targetBearX) < 4) e.targetBearX = e.baseBearX;

      // --- RENDER LOW-POLY WARRIORS ---
      drawLowPolyBull(ctx, e.bullX, 220, e.globalTime);
      drawLowPolyBear(ctx, e.bearX, 220, e.globalTime);

      // --- ENERGY SLASH TRACES ---
      e.slashes.forEach((s) => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.shadowBlur = 30;
        ctx.shadowColor = s.type === "bull" ? "#4ade80" : "#ef4444";
        ctx.strokeStyle = s.type === "bull" ? "rgba(255,255,255,0.9)" : "rgba(255,230,230,0.9)";
        ctx.lineWidth = 5;
        ctx.globalAlpha = s.alpha;
        
        ctx.beginPath();
        if (s.points.length > 0) {
          ctx.moveTo(s.points[0].dx, s.points[0].dy);
          for(let p=1; p<s.points.length; p++) {
            ctx.lineTo(s.points[p].dx, s.points[p].dy);
          }
        }
        ctx.stroke();
        ctx.restore();
        
        s.alpha -= 0.12; // Hyper fast dissipation
      });
      e.slashes = e.slashes.filter(s => s.alpha > 0);

      // --- KINETIC PARTICLES SYSTEMS ---
      e.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        
        // Square polygonal sparks instead of soft round balls
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });
      e.particles = e.particles.filter(p => p.alpha > 0);

      ctx.restore();
      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animId);
  }, []);

  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 antialiased selection:bg-emerald-500/30">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800/80 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Cinematic Data Monitor Header */}
        <div className="flex flex-wrap justify-between items-center p-6 border-b border-slate-800/60 bg-gradient-to-b from-slate-900 to-slate-950">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400">
              NIFTY 50 LIVE ARENA
            </h1>
            <p className="text-xs font-mono tracking-widest text-slate-400 uppercase mt-0.5">
              Phase I • Low-Poly Battle Screen
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold tracking-tight text-white drop-shadow-md">
              {niftyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-bold font-mono tracking-wide mt-0.5 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
              {isPositive ? "▲ +" : "▼ "} {priceChange.toFixed(2)} ({changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Node */}
        <div className="relative bg-slate-950 flex justify-center items-center overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={400} 
            className="w-full max-w-full aspect-[2/1] block"
          />
          
          {/* Status Real-time Hud Tags */}
          <div className="absolute pointer-events-none inset-0 flex flex-col justify-between items-center py-6">
            <div className={`px-4 py-1 rounded-md text-xs font-black uppercase tracking-widest border backdrop-blur-md shadow-lg ${
              isPositive 
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-emerald-950/20" 
                : "bg-rose-950/40 text-rose-400 border-rose-500/30 shadow-rose-950/20"
            }`}>
              {isPositive ? "Bulls Dominating (Bullish Tick Pattern)" : "Bears Retaliating (Bearish Tick Pattern)"}
            </div>
            
            <div className="flex gap-16 text-center">
              <div className="bg-slate-900/90 px-4 py-1.5 rounded-lg border border-slate-800/80 backdrop-blur-sm min-w-[140px]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Battle Status</span>
                <span className="text-xs font-black tracking-wide text-slate-200">
                  {isPositive ? "Power Clash" : "Heavy Assault"}
                </span>
              </div>
              <div className="bg-slate-900/90 px-4 py-1.5 rounded-lg border border-slate-800/80 backdrop-blur-sm min-w-[140px]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Live Data Feed</span>
                <span className="text-xs font-mono font-bold text-emerald-400 animate-pulse">OK ({lastUpdated || "--:--"})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Subtext */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-800/50 text-xs text-slate-500 text-center font-medium font-mono">
          Interactive Canvas Engine rendered at 60FPS via vector coordinates.
        </div>
      </div>
    </div>
  );
}