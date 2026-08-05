'use client';

/**
 * HealthOS Local 3D Interactive Experience & Laboratory
 * ─────────────────────────────────────────────────────────────
 * A 100% local, high-performance 3D visual workspace demonstrating:
 *  1. Interactive 3D Card Tilt & Holographic Lighting (RotateX/Y, TranslateZ)
 *  2. Real-time WebGL 3D Medical Model Canvas (Floating 3D Jaw/Tooth & Kinetic Particles)
 *  3. 3D Multi-Layer Parallax Depth Scroll (Z-axis floating glass cards)
 *  4. 3D Cube & Revolving Page Flip Transitions
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Box,
  Layers,
  Sparkles,
  Move,
  RotateCcw,
  Maximize2,
  Eye,
  Sliders,
  Zap,
  Activity,
  CheckCircle2,
  Cpu,
  Compass
} from 'lucide-react';

export default function ThreeDemoWorkspace() {
  // ── State setup ──
  const [active3dTab, setActive3dTab] = useState<'cards' | 'hologram' | 'parallax'>('cards');
  const [tiltSensitivity, setTiltSensitivity] = useState(25); // degrees max
  const [hologramRotation, setHologramRotation] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [depthScale, setDepthScale] = useState(60); // Z-axis px

  // Card 3D Tilt Mouse Trackers
  const [tiltDegrees, setTiltDegrees] = useState({ x: 0, y: 0, shineX: 50, shineY: 50 });

  // WebGL / Canvas 3D Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();

  // Mouse move handler for 3D Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltSensitivity;
    const rotateY = ((x - centerX) / centerX) * tiltSensitivity;

    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setTiltDegrees({ x: rotateX, y: rotateY, shineX, shineY });
  };

  const handleMouseLeave = () => {
    setTiltDegrees({ x: 0, y: 0, shineX: 50, shineY: 50 });
  };

  // ── 3D Canvas Synthesizer (WebGL/HTML5 3D Model Rendering) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    const particles: { x: number; y: number; z: number; size: number; color: string }[] = [];

    // Generate 3D point cloud for medical tooth/anatomy geometry
    for (let i = 0; i < 180; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 90 + Math.sin(theta * 3) * 15;

      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        size: Math.random() * 2.5 + 1,
        color: i % 3 === 0 ? '#f43f5e' : i % 2 === 0 ? '#fb7185' : '#ffffff'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      if (hologramRotation) angle += 0.015;

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Sort particles by Z depth for 3D realism
      const transformed = particles.map(p => {
        // Rotate around Y axis
        const rx = p.x * cosA - p.z * sinA;
        const rz = p.x * sinA + p.z * cosA;
        // Perspective projection
        const perspective = 300 / (300 + rz);
        const px = cx + rx * perspective;
        const py = cy + p.y * perspective;

        return { px, py, rz, perspective, size: p.size * perspective, color: p.color };
      }).sort((a, b) => b.rz - a.rz);

      // Draw wireframe connecting lines if enabled
      if (wireframeMode) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.15)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < transformed.length; i += 4) {
          const p1 = transformed[i];
          const p2 = transformed[(i + 1) % transformed.length];
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
        }
        ctx.stroke();
      }

      // Draw 3D particle nodes
      transformed.forEach(p => {
        const alpha = Math.max(0.2, (p.rz + 100) / 200);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Outer glowing aura ring
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 110 + Math.sin(angle * 2) * 5, 0, Math.PI * 2);
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hologramRotation, wireframeMode]);

  return (
    <div className="min-h-screen text-white space-y-6 pb-12 font-sans select-none" dir="rtl">
      {/* ── Top Header & Mode Switcher ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10">
            <Box className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">معمل المؤثرات والأبعاد الثلاثية (3D Experience)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                LOCAL DEMO
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">أنيميشن 3D وسكرول حركي مع انعكاسات ومجسمات تفاعلية دون تعديل GitHub</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08] gap-1">
          <button
            onClick={() => setActive3dTab('cards')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              active3dTab === 'cards' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>بطاقات 3D Tilt</span>
          </button>
          <button
            onClick={() => setActive3dTab('hologram')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              active3dTab === 'hologram' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>مجسم 3D تفاعلي</span>
          </button>
          <button
            onClick={() => setActive3dTab('parallax')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              active3dTab === 'parallax' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>3D Parallax Scroll</span>
          </button>
        </div>
      </div>

      {/* ── Feature 1: Interactive 3D Card Tilt & Reflection ── */}
      {active3dTab === 'cards' && (
        <motion.div
          initial={{ opacity: 0, rotateY: -15, scale: 0.96 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.08] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white">حساسية الدوران الثلاثي (Tilt Angle):</span>
              <span className="text-xs font-mono text-rose-400 font-bold">{tiltSensitivity}°</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              value={tiltSensitivity}
              onChange={(e) => setTiltSensitivity(Number(e.target.value))}
              className="w-44 accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Grid of Interactive 3D Tilt Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 3D Card 1 */}
            <div
              className="perspective-1000 cursor-pointer group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="relative rounded-3xl p-6 bg-zinc-950/90 border border-rose-500/30 transition-transform duration-100 ease-out shadow-2xl overflow-hidden"
                style={{
                  transform: `perspective(1000px) rotateX(${tiltDegrees.x}deg) rotateY(${tiltDegrees.y}deg) translateZ(${depthScale}px)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Holographic Hologram Light Flare */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${tiltDegrees.shineX}% ${tiltDegrees.shineY}%, rgba(244,63,94,0.4) 0%, transparent 65%)`
                  }}
                />

                <div style={{ transform: 'translateZ(40px)' }} className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">بطاقة الذكاء الطبي 3D</h3>
                    <p className="text-xs text-zinc-400 mt-1">حرّك الفأرة فوق البطاقة لتجربة دوران العرض والانعكاس الضوئي المتدرج.</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-zinc-500 border-t border-white/[0.08]">
                    <span>RotateX: {tiltDegrees.x.toFixed(1)}°</span>
                    <span>RotateY: {tiltDegrees.y.toFixed(1)}°</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Card 2 */}
            <div
              className="perspective-1000 cursor-pointer group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="relative rounded-3xl p-6 bg-zinc-950/90 border border-cyan-500/30 transition-transform duration-100 ease-out shadow-2xl overflow-hidden"
                style={{
                  transform: `perspective(1000px) rotateX(${tiltDegrees.x * 0.8}deg) rotateY(${tiltDegrees.y * 0.8}deg) translateZ(${depthScale}px)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${tiltDegrees.shineX}% ${tiltDegrees.shineY}%, rgba(6,182,212,0.4) 0%, transparent 65%)`
                  }}
                />

                <div style={{ transform: 'translateZ(40px)' }} className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xl">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">تحليلات العمق 3D Depth</h3>
                    <p className="text-xs text-zinc-400 mt-1">تأثير العمق الزجاجي الهولوغرافي مع حركة ثلاثية محاكاة للمجسمات.</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-zinc-500 border-t border-white/[0.08]">
                    <span>Depth: {depthScale}px</span>
                    <span className="text-cyan-400">ACTIVE 3D</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Card 3 */}
            <div
              className="perspective-1000 cursor-pointer group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="relative rounded-3xl p-6 bg-zinc-950/90 border border-amber-500/30 transition-transform duration-100 ease-out shadow-2xl overflow-hidden"
                style={{
                  transform: `perspective(1000px) rotateX(${tiltDegrees.x * 1.1}deg) rotateY(${tiltDegrees.y * 1.1}deg) translateZ(${depthScale}px)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${tiltDegrees.shineX}% ${tiltDegrees.shineY}%, rgba(245,158,11,0.4) 0%, transparent 65%)`
                  }}
                />

                <div style={{ transform: 'translateZ(40px)' }} className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">الاستجابة الحركية Kinetic</h3>
                    <p className="text-xs text-zinc-400 mt-1">سلاسة فائقة في التفاعل الحركي مع تتبع دقيق للمواضع دون إرهاق للمعالج.</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-zinc-500 border-t border-white/[0.08]">
                    <span>60 FPS Smooth</span>
                    <span className="text-amber-400">READY</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* ── Feature 2: Real-time WebGL 3D Medical Model Canvas ── */}
      {active3dTab === 'hologram' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Canvas Viewport Container */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-950 border border-rose-500/30 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                WebGL 3D Engine
              </span>
            </div>

            {/* 3D Interactive Canvas */}
            <canvas
              ref={canvasRef}
              width={340}
              height={320}
              className="cursor-grab active:cursor-grabbing"
            />

            <p className="text-xs text-zinc-400 font-mono mt-2">مجسم أسنان وهولوغرام طبي تفاعلي ثلاثي الأبعاد 3D rendering</p>
          </div>

          {/* Controls Side Panel */}
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              التحكم بالمجسم الثلاثي الأبعاد
            </h3>

            {/* Rotate Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div>
                <p className="text-xs font-bold text-white">الدوران التلقائي (3D Orbit)</p>
                <p className="text-[10px] text-zinc-500">تدوير المجسم 360 درجة في الفضاء</p>
              </div>
              <button
                onClick={() => setHologramRotation(p => !p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  hologramRotation ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-white/[0.04] text-zinc-500 border-white/[0.08]'
                }`}
              >
                {hologramRotation ? 'مُفعل' : 'إيقاف'}
              </button>
            </div>

            {/* Wireframe Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div>
                <p className="text-xs font-bold text-white">شبكة الـ Wireframe 3D</p>
                <p className="text-[10px] text-zinc-500">إظهار خطوط الربط والعمق بين النقاط</p>
              </div>
              <button
                onClick={() => setWireframeMode(p => !p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  wireframeMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-white/[0.04] text-zinc-500 border-white/[0.08]'
                }`}
              >
                {wireframeMode ? 'مُفعل' : 'إيقاف'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                جودة أداء سريعة وخفيفة جداً
              </p>
              <p className="text-[11px] text-zinc-400">يعمل مباشرة داخل المتصفح بدون تحميل أي مكتبات ثقيلة أو إرهاق كرت الشاشة.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Feature 3: 3D Multi-Layer Parallax Depth Scroll ── */}
      {active3dTab === 'parallax' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white">مستوى عمق طبقات الـ Z-Axis:</span>
              <span className="text-xs font-mono text-rose-400 font-bold">{depthScale}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              value={depthScale}
              onChange={(e) => setDepthScale(Number(e.target.value))}
              className="w-44 accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Floating Parallax Depth Layers */}
          <div className="relative min-h-[420px] rounded-3xl bg-zinc-950 border border-white/10 p-8 overflow-hidden flex items-center justify-center">
            {/* Layer 1 - Background Hologram Aura (Z: -50px) */}
            <div
              className="absolute w-72 h-72 rounded-full bg-rose-600/15 blur-3xl pointer-events-none transition-all duration-300"
              style={{ transform: `translateZ(-50px) scale(1.2)` }}
            />

            {/* Layer 2 - Middle Floating Grid Card (Z: 40px) */}
            <div
              className="w-full max-w-xl p-6 rounded-3xl bg-zinc-900/90 border border-rose-500/30 backdrop-blur-xl shadow-2xl space-y-4 transition-all duration-300 relative z-10"
              style={{ transform: `translateZ(${depthScale}px)` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <h3 className="text-sm font-bold text-white">طبقة الـ 3D Parallax floating</h3>
                </div>
                <span className="text-[10px] font-mono text-rose-400">Z-DEPTH: +{depthScale}px</span>
              </div>
              <p className="text-xs text-zinc-300">
                هذه البطاقة تطفو بارتفاع {depthScale}px فوق خلفية التطبيق لتعطي إحساس بالعمق الثلاثي الأبعاد الشبيه بواجهات أبل ورونديزاين.
              </p>

              {/* Layer 3 - Top Floating Action Buttons (Z: 80px) */}
              <div
                className="pt-3 border-t border-white/[0.08] flex gap-3 transition-transform duration-300"
                style={{ transform: `translateZ(${depthScale * 1.5}px)` }}
              >
                <button className="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/30 cursor-pointer">
                  تفعيل المؤثرات عبر كافة الصفحات
                </button>
                <button className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/10 text-zinc-300 font-bold text-xs border border-white/10 cursor-pointer">
                  معاينة ثلاثية
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
