'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hand, Sliders, Activity, Sparkles, Layers, X, 
  ChevronUp, Move, RefreshCw, Volume2, Sun 
} from 'lucide-react';
import ThreeDemoWorkspace from '@/components/ui/ThreeDemoWorkspace';

export default function AppleDemoWorkspace() {
  const t = useTranslations('AppleDemo');

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Tactile click states
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);

  // Custom 1D/2D Spring parameters
  const [damping, setDamping] = useState(1.0); // Damping Ratio (Apple default for position is 1.0)
  const [response, setResponse] = useState(0.4); // Response in seconds (Apple default is 0.4)

  // Direct Manipulation Card States and Refs
  const cardRef = useRef<HTMLDivElement>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);
  
  // Logical positions
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [momentumActive, setMomentumActive] = useState(false);

  // Velocity tracking
  const pointerHistory = useRef<{ x: number; y: number; time: number }[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const startPointerOffset = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  // Spring physics variables for raw JS spring solver
  const springX = useRef(0);
  const springY = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const vx = useRef(0);
  const vy = useRef(0);

  // Handle pointer down for direct manipulation card (Interruptibility & 1:1 Tracking)
  const handleCardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const card = cardRef.current;
    const container = dragContainerRef.current;
    if (!card || !container) return;

    card.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setMomentumActive(false);
    
    // Stop any active spring animation loop
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    // Get current container coordinates
    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    // Calculate position relative to container
    const currentRelX = cardRect.left - containerRect.left;
    const currentRelY = cardRect.top - containerRect.top;

    // Save offset where pointer grabbed the card
    startPointerOffset.current = {
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top
    };

    // Set initial tracking positions
    springX.current = currentRelX;
    springY.current = currentRelY;
    targetX.current = currentRelX;
    targetY.current = currentRelY;
    
    setPosition({ x: currentRelX, y: currentRelY });

    // Initialize velocity tracking history
    pointerHistory.current = [{
      x: e.clientX,
      y: e.clientY,
      time: performance.now()
    }];
    
    vx.current = 0;
    vy.current = 0;
  };

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = dragContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    
    // Position inside container based on grabbed offset
    const newX = e.clientX - containerRect.left - startPointerOffset.current.x;
    const newY = e.clientY - containerRect.top - startPointerOffset.current.y;

    // Bounds checking
    const maxX = containerRect.width - 128; // card width is w-32 (128px)
    const maxY = containerRect.height - 128; // card height is h-32 (128px)
    
    // Physical resistance outside borders (rubber-banding)
    let finalX = newX;
    let finalY = newY;
    if (newX < 0) finalX = newX * 0.35;
    else if (newX > maxX) finalX = maxX + (newX - maxX) * 0.35;

    if (newY < 0) finalY = newY * 0.35;
    else if (newY > maxY) finalY = maxY + (newY - maxY) * 0.35;

    setPosition({ x: finalX, y: finalY });
    targetX.current = finalX;
    targetY.current = finalY;

    // Track points for velocity calculation
    const now = performance.now();
    pointerHistory.current.push({ x: e.clientX, y: e.clientY, time: now });
    
    // Keep history short (last 100ms)
    if (pointerHistory.current.length > 5) {
      pointerHistory.current.shift();
    }
  };

  const handleCardPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    cardRef.current?.releasePointerCapture(e.pointerId);

    // Calculate release velocity from history
    const history = pointerHistory.current;
    if (history.length >= 2) {
      const oldest = history[0];
      const newest = history[history.length - 1];
      const dt = (newest.time - oldest.time) / 1000; // seconds
      if (dt > 0.01) {
        // px per second
        vx.current = (newest.x - oldest.x) / dt;
        vy.current = (newest.y - oldest.y) / dt;
      }
    }

    // Hand off velocity and trigger Spring solver towards snap point (center of container)
    const container = dragContainerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const targetCenterX = (containerRect.width - 128) / 2;
    const targetCenterY = (containerRect.height - 128) / 2;

    // Use Apple's momentum projection formula to guess where it's throwing
    const decelRate = 0.992; // snappier deceleration
    const project = (v: number) => (v / 1000) * decelRate / (1 - decelRate);
    const projectedX = position.x + project(vx.current);
    const projectedY = position.y + project(vy.current);

    targetX.current = targetCenterX;
    targetY.current = targetCenterY;

    // Trigger spring loop
    springX.current = position.x;
    springY.current = position.y;
    setMomentumActive(true);
    runSpringLoop();
  };

  // Raw JS Spring solver (implements Apple's Damping and Response physics)
  const runSpringLoop = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    const start = performance.now();
    let lastTime = start;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.03); // cap dt at 30ms to avoid explosion
      lastTime = now;

      // Apple spring params mapping to mass-spring-damper coefficients:
      // Response = 2 * PI * sqrt(m / k)
      // Damping Ratio = c / (2 * sqrt(m * k))
      // Assuming mass (m) = 1.0
      const stiffness = Math.pow((2 * Math.PI) / response, 2);
      const dampingCoeff = (2 * damping * Math.sqrt(stiffness));

      // Calculate forces for X spring
      const forceX = -stiffness * (springX.current - targetX.current) - dampingCoeff * vx.current;
      vx.current += forceX * dt;
      springX.current += vx.current * dt;

      // Calculate forces for Y spring
      const forceY = -stiffness * (springY.current - targetY.current) - dampingCoeff * vy.current;
      vy.current += forceY * dt;
      springY.current += vy.current * dt;

      setPosition({ x: springX.current, y: springY.current });

      // Stop condition when distance & velocity are extremely small
      const dist = Math.sqrt(
        Math.pow(springX.current - targetX.current, 2) + 
        Math.pow(springY.current - targetY.current, 2)
      );
      const speed = Math.sqrt(Math.pow(vx.current, 2) + Math.pow(vy.current, 2));

      if (dist < 0.2 && speed < 1.0) {
        setPosition({ x: targetX.current, y: targetY.current });
        setMomentumActive(false);
      } else {
        animationFrameId.current = requestAnimationFrame(tick);
      }
    };

    animationFrameId.current = requestAnimationFrame(tick);
  };

  const handleReset = () => {
    const container = dragContainerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const centerX = (containerRect.width - 128) / 2;
    const centerY = (containerRect.height - 128) / 2;

    targetX.current = centerX;
    targetY.current = centerY;
    springX.current = position.x;
    springY.current = position.y;
    vx.current = 0;
    vy.current = 0;

    setMomentumActive(true);
    runSpringLoop();
  };

  useEffect(() => {
    // Initial centering of card
    const timer = setTimeout(() => {
      handleReset();
    }, 100);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Sliders and Control Center States ---
  const [brightnessVal, setBrightnessVal] = useState(60);
  const [volumeVal, setVolumeVal] = useState(40);
  const [sliderActive, setSliderActive] = useState<string | null>(null);

  // --- Independent X & Y Spring Simulation ---
  const [springTarget, setSpringTarget] = useState({ x: 150, y: 100 });
  
  // Independent springs
  const [indepPos, setIndepPos] = useState({ x: 150, y: 100 });
  const indepVX = useRef(0);
  const indepVY = useRef(0);
  const indepX = useRef(150);
  const indepY = useRef(100);

  // Diagonal linked spring (forces path to stay straight)
  const [linkedPos, setLinkedPos] = useState({ x: 150, y: 100 });
  const linkedVel = useRef(0);
  const linkedX = useRef(150);
  const linkedY = useRef(100);

  const springPlaygroundRef = useRef<HTMLDivElement>(null);

  // Click on Independent Spring sandbox to trigger target reposition
  const handleSpringPlaygroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = springPlaygroundRef.current?.getBoundingClientRect();
    if (!rect) return;
    const targetXVal = e.clientX - rect.left - 16;
    const targetYVal = e.clientY - rect.top - 16;
    setSpringTarget({ x: targetXVal, y: targetYVal });
  };

  // Run Independent Spring logic
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const updatePlaygroundPhysics = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.03);
      lastTime = now;

      // Spring formula parameters
      const stiffness = Math.pow((2 * Math.PI) / response, 2);
      const dampingCoeff = 2 * damping * Math.sqrt(stiffness);

      // 1. Independent solver (X and Y solve separately)
      const forceIndepX = -stiffness * (indepX.current - springTarget.x) - dampingCoeff * indepVX.current;
      indepVX.current += forceIndepX * dt;
      indepX.current += indepVX.current * dt;

      const forceIndepY = -stiffness * (indepY.current - springTarget.y) - dampingCoeff * indepVY.current;
      indepVY.current += forceIndepY * dt;
      indepY.current += indepVY.current * dt;

      setIndepPos({ x: indepX.current, y: indepY.current });

      // 2. Linked/Unified solver (Diagonal distance spring)
      const dx = springTarget.x - linkedX.current;
      const dy = springTarget.y - linkedY.current;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.5) {
        const forceLinked = stiffness * distance - dampingCoeff * linkedVel.current;
        linkedVel.current += forceLinked * dt;
        
        // Move along the exact diagonal vector (rigid line)
        const ratio = (linkedVel.current * dt) / distance;
        linkedX.current += dx * ratio;
        linkedY.current += dy * ratio;
        setLinkedPos({ x: linkedX.current, y: linkedY.current });
      } else {
        linkedX.current = springTarget.x;
        linkedY.current = springTarget.y;
        setLinkedPos({ x: springTarget.x, y: springTarget.y });
        linkedVel.current = 0;
      }

      animId = requestAnimationFrame(updatePlaygroundPhysics);
    };

    animId = requestAnimationFrame(updatePlaygroundPhysics);
    return () => cancelAnimationFrame(animId);
  }, [springTarget, damping, response]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none p-4 md:p-6 font-sans">

      {/* ── 3D Interactive Lab Workspace ── */}
      <ThreeDemoWorkspace />

      {/* Premium Minimalist Header (Emil Style: Pitch Black, White border, Muted typography) */}
      <div className="relative p-8 rounded-3xl border border-zinc-800/80 bg-black shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
              PHYSICS EXPERIMENT
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tighter">
            {t('title')}
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Global Control Tweak Panel (Minimalist black layout) */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 w-full md:w-80 space-y-4">
          <div className="font-bold text-white flex items-center justify-between font-mono text-[10px] tracking-wider">
            <span>SPRING COEFFICIENTS</span>
            <Sliders className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono">
              <span>{t('damping')}:</span>
              <span className="text-white font-bold">{damping.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.3" 
              max="2.0" 
              step="0.05"
              value={damping} 
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[8px] font-mono text-zinc-500">
              <span>Bouncy (0.5)</span>
              <span>Critical (1.0)</span>
              <span>Over (2.0)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono">
              <span>{t('response')} (s):</span>
              <span className="text-white font-bold">{response.toFixed(2)}s</span>
            </div>
            <input 
              type="range" 
              min="0.15" 
              max="1.5" 
              step="0.05"
              value={response} 
              onChange={(e) => setResponse(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[8px] font-mono text-zinc-500">
              <span>Snappy (0.2s)</span>
              <span>Smooth (0.6s)</span>
              <span>Slow (1.5s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Direct Manipulation Zone */}
        <div className="p-6 rounded-3xl border border-zinc-800/80 bg-black shadow-xl flex flex-col justify-between min-h-[420px]">
          <div className="space-y-1.5 mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Hand className="w-4 h-4 text-zinc-300" />
              {t('directTitle')}
            </h2>
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-md">
              {t('directDesc')}
            </p>
          </div>

          {/* Draggable Sandbox Arena */}
          <div 
            ref={dragContainerRef}
            className="flex-1 relative w-full rounded-3xl bg-zinc-950/60 border border-zinc-900 overflow-hidden min-h-[260px] flex items-center justify-center pointer-events-auto"
          >
            {/* Centered target coordinates indicator */}
            <div className="absolute w-6 h-6 border border-dashed border-zinc-700/50 rounded-full flex items-center justify-center pointer-events-none" />

            {/* Apple Fluid Draggable Card (Minimal Pure Black & White) */}
            <div
              ref={cardRef}
              onPointerDown={handleCardPointerDown}
              onPointerMove={handleCardPointerMove}
              onPointerUp={handleCardPointerUp}
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                touchAction: 'none'
              }}
              className={`absolute left-0 top-0 w-32 h-32 rounded-3xl border flex flex-col items-center justify-center p-3 select-none cursor-grab active:cursor-grabbing transition-shadow duration-300 ${
                isDragging 
                  ? "bg-zinc-900 border-zinc-200 text-white shadow-xl scale-[1.01]" 
                  : momentumActive
                  ? "bg-zinc-950 border-zinc-700 text-white"
                  : "bg-black border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 mb-1.5 pointer-events-none">
                <Move className="w-4 h-4 text-white" />
              </div>
              <span className="text-[9px] font-bold font-mono tracking-wider text-center pointer-events-none uppercase">
                {isDragging ? "DRAGGING" : momentumActive ? "SPRINGING" : "GRAB ME"}
              </span>
              <span className="text-[8px] font-mono text-zinc-500 mt-1 pointer-events-none">
                x: {Math.round(position.x)} y: {Math.round(position.y)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center text-xs">
            <span className="text-[9px] font-mono text-zinc-500">
              * Active velocity blended on pointer release
            </span>
            <button 
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 active:scale-95 transition-all flex items-center gap-1.5 font-mono text-[10px]"
            >
              <RefreshCw className="w-3 h-3" />
              {t('reset')}
            </button>
          </div>
        </div>

        {/* 2. Sliders and Control Center Tactility */}
        <div className="p-6 rounded-3xl border border-zinc-800/80 bg-black shadow-xl flex flex-col justify-between min-h-[420px]">
          <div className="space-y-1.5 mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Sliders className="w-4 h-4 text-zinc-300" />
              {t('controlTitle')}
            </h2>
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-md">
              {t('controlDesc')}
            </p>
          </div>

          {/* CC Widgets Grid (Pure Black minimalist capsules) */}
          <div className="flex-1 grid grid-cols-2 gap-4 items-center justify-center p-4 bg-zinc-950/60 rounded-3xl border border-zinc-900">
            
            {/* Brightness Slider */}
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div 
                className={`relative w-16 h-36 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-all duration-200 cursor-row-resize ${
                  sliderActive === 'brightness' ? 'ring-1 ring-white/20 scale-x-[1.06] shadow-lg' : ''
                }`}
                onPointerDown={(e) => {
                  setSliderActive('brightness');
                  e.currentTarget.setPointerCapture(e.pointerId);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const val = Math.max(0, Math.min(100, Math.round(((rect.bottom - e.clientY) / rect.height) * 100)));
                  setBrightnessVal(val);
                }}
                onPointerMove={(e) => {
                  if (sliderActive !== 'brightness') return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const val = Math.max(0, Math.min(100, Math.round(((rect.bottom - e.clientY) / rect.height) * 100)));
                  setBrightnessVal(val);
                }}
                onPointerUp={(e) => {
                  setSliderActive(null);
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }}
              >
                {/* Fill state (Pure White) */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 bg-white"
                  animate={{ height: `${brightnessVal}%` }}
                  transition={{ type: "spring", stiffness: 280, damping: 25 }}
                />
                
                {/* Inside Icon */}
                <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center mix-blend-difference text-white select-none pointer-events-none">
                  <Sun className="w-4 h-4 text-black" />
                  <span className="text-[9px] font-bold font-mono mt-1 text-black">{brightnessVal}%</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 font-mono tracking-wider">BRIGHTNESS</span>
            </div>

            {/* Volume Slider */}
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div 
                className={`relative w-16 h-36 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-all duration-200 cursor-row-resize ${
                  sliderActive === 'volume' ? 'ring-1 ring-white/20 scale-x-[1.06] shadow-lg' : ''
                }`}
                onPointerDown={(e) => {
                  setSliderActive('volume');
                  e.currentTarget.setPointerCapture(e.pointerId);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const val = Math.max(0, Math.min(100, Math.round(((rect.bottom - e.clientY) / rect.height) * 100)));
                  setVolumeVal(val);
                }}
                onPointerMove={(e) => {
                  if (sliderActive !== 'volume') return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const val = Math.max(0, Math.min(100, Math.round(((rect.bottom - e.clientY) / rect.height) * 100)));
                  setVolumeVal(val);
                }}
                onPointerUp={(e) => {
                  setSliderActive(null);
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }}
              >
                {/* Fill state (Pure White) */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 bg-zinc-200"
                  animate={{ height: `${volumeVal}%` }}
                  transition={{ type: "spring", stiffness: 280, damping: 25 }}
                />
                
                {/* Inside Icon */}
                <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center mix-blend-difference text-white select-none pointer-events-none">
                  <Volume2 className="w-4 h-4 text-black" />
                  <span className="text-[9px] font-bold font-mono mt-1 text-black">{volumeVal}%</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 font-mono tracking-wider">VOLUME</span>
            </div>

          </div>

          {/* Tactile Response Grid (Active scale down instant) */}
          <div className="mt-4 flex items-center justify-between border-t border-zinc-900 pt-4">
            <span className="text-[9px] font-mono text-zinc-500">
              * Widget scale swells on drag to widen cushion
            </span>
            <div className="flex gap-2">
              <button 
                onPointerDown={() => setButtonPressed('btn1')}
                onPointerUp={() => setButtonPressed(null)}
                onPointerLeave={() => setButtonPressed(null)}
                style={{ transform: buttonPressed === 'btn1' ? 'scale(0.94)' : 'scale(1)' }}
                className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] font-mono text-[9px] font-bold"
              >
                I
              </button>
              <button 
                onPointerDown={() => setButtonPressed('btn2')}
                onPointerUp={() => setButtonPressed(null)}
                onPointerLeave={() => setButtonPressed(null)}
                style={{ transform: buttonPressed === 'btn2' ? 'scale(0.94)' : 'scale(1)' }}
                className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] font-mono text-[9px] font-bold"
              >
                II
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 3. Fluid Bottom Sheet Trigger */}
        <div className="p-6 rounded-3xl border border-zinc-800/80 bg-black shadow-xl flex flex-col justify-between min-h-[380px]">
          <div className="space-y-1.5 mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Layers className="w-4 h-4 text-zinc-300" />
              {t('sheetTitle')}
            </h2>
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-md">
              {t('sheetDesc')}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-950/60 rounded-3xl border border-zinc-900 min-h-[200px]">
            <button
              onClick={() => setIsSheetOpen(true)}
              className="px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold font-mono tracking-wide text-xs active:scale-97 hover:scale-[1.01] transition-all flex items-center gap-2"
            >
              <ChevronUp className="w-4 h-4" />
              {t('openSheet')}
            </button>
          </div>

          <div className="mt-4 text-[9px] font-mono text-zinc-500 text-center">
            * Drag sheet downward to dismiss (damping: 0.8, response: 0.3s)
          </div>
        </div>

        {/* 4. Independent X and Y Springs Zone */}
        <div className="p-6 rounded-3xl border border-zinc-800/80 bg-black shadow-xl flex flex-col justify-between min-h-[380px]">
          <div className="space-y-1.5 mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Activity className="w-4 h-4 text-zinc-300" />
              {t('springTitle')}
            </h2>
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-md">
              {t('springDesc')}
            </p>
          </div>

          {/* Spring visual playground grid */}
          <div 
            ref={springPlaygroundRef}
            onClick={handleSpringPlaygroundClick}
            className="flex-1 relative w-full rounded-3xl bg-zinc-950/60 border border-zinc-900 overflow-hidden min-h-[200px] cursor-crosshair"
          >
            {/* Click target coordinates indicator */}
            <div 
              style={{ left: springTarget.x, top: springTarget.y }}
              className="absolute w-8 h-8 border border-white/20 rounded-full flex items-center justify-center pointer-events-none -translate-x-0 -translate-y-0"
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>

            {/* Dot A: X and Y solved independently (Apple style - Pure White) */}
            <div 
              style={{ left: indepPos.x, top: indepPos.y }}
              className="absolute w-8 h-8 rounded-full bg-white border border-zinc-300 flex items-center justify-center shadow-lg text-black text-[9px] font-black pointer-events-none select-none"
            >
              XY
            </div>

            {/* Dot B: Unified diagonal path solver (desynced - Muted outline) */}
            <div 
              style={{ left: linkedPos.x, top: linkedPos.y }}
              className="absolute w-8 h-8 rounded-full border border-dashed border-zinc-500 bg-transparent flex items-center justify-center text-zinc-400 text-[9px] font-bold pointer-events-none select-none opacity-60"
            >
              DI
            </div>

            {/* Legend inside playground */}
            <div className="absolute bottom-3 left-3 bg-black/95 border border-zinc-800 p-2 rounded-xl text-[9px] font-mono space-y-1 select-none pointer-events-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-zinc-200">Independent X/Y Spring (Fluid)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full border border-dashed border-zinc-500" />
                <span className="text-zinc-500">Diagonal Vector Spring (Rigid)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[9px] font-mono text-zinc-500 text-center">
            * Click inside the dark canvas above to change target coordinate.
          </div>
        </div>

      </div>

      {/* -------------------- Fluid Bottom Sheet Component (WWDC Damped Sheet) -------------------- */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-black backdrop-blur-sm z-50 pointer-events-auto"
            />

            {/* Bottom Drawer (Pitch Black, white-zinc borders, premium details) */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(event, info) => {
                if (info.velocity.y > 300 || info.offset.y > 150) {
                  setIsSheetOpen(false);
                }
              }}
              className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-black border-t border-zinc-800 rounded-t-[28px] p-8 z-50 text-left pointer-events-auto shadow-2xl flex flex-col"
            >
              {/* Drag Handle Bar */}
              <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-6 shrink-0 cursor-row-resize" />

              {/* Title & Close */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4 shrink-0">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-white tracking-tight font-sans">
                    Apple Fluid bottom-sheet
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                    VELOCITY-AWARE DISMISSAL
                  </p>
                </div>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sheet Body Scroll Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800 py-2 space-y-6 text-sm text-zinc-300 leading-relaxed font-sans">
                
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2">
                  <span className="text-[9px] font-bold tracking-widest text-zinc-400 font-mono uppercase block">WHAT MAKES THIS FLUID?</span>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    Traditional modal sheets open with fixed linear timers and prevent drag interactions. This sheet tracks your vertical finger movement in 1:1 real-time. If you swipe up or down, it calculates the release speed and hands it off directly to the spring solver.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950">
                    <span className="text-[9px] font-bold tracking-widest text-zinc-500 font-mono block mb-1">DAMPING RATIO</span>
                    <span className="text-xl font-bold text-white font-mono">0.80</span>
                    <p className="text-[9px] text-zinc-500 mt-1">Allows a slight natural overshoot and settle bounce on swipe lockouts.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950">
                    <span className="text-[9px] font-bold tracking-widest text-zinc-500 font-mono block mb-1">RESPONSE SPEED</span>
                    <span className="text-xl font-bold text-white font-mono">0.30s</span>
                    <p className="text-[9px] text-zinc-500 mt-1">Instantly follows coordinates, preventing sensory visual delay.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold tracking-widest text-zinc-500 font-mono uppercase block">DEMONSTRATION DETAILS</span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-zinc-450">
                    <li>Try dragging the sheet down quickly (flick) - it dismisses instantly due to speed threshold.</li>
                    <li>Try dragging slowly and letting go above 150px - it snaps back open with a damping bounce.</li>
                    <li>Supports responsive pointer boundary captures.</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3 shrink-0">
                  <button 
                    onClick={() => setIsSheetOpen(false)}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-bold hover:bg-zinc-900 transition-all active:scale-95 text-xs font-mono"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => {
                      setIsSheetOpen(false);
                      setTimeout(() => setIsSheetOpen(true), 250);
                    }}
                    className="px-4 py-2 bg-white text-black font-bold rounded-lg transition-all active:scale-95 text-xs font-mono"
                  >
                    Bouncy Re-open
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
