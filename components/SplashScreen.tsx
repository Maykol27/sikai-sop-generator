"use client";

import { useEffect, useState, useRef } from 'react';

export function SplashScreen({ onFinish }: { onFinish?: () => void }) {
    const [show, setShow] = useState(true);
    const [animateOut, setAnimateOut] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimateOut(true);
            setTimeout(() => {
                setShow(false);
                onFinish?.();
            }, 1000);
        }, 3000);
        return () => clearTimeout(timer);
    }, [onFinish]);

    // Neural Network Canvas Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        const particles: { x: number; y: number; vx: number; vy: number; targetVx: number; targetVy: number; size: number }[] = [];
        const particleCount = Math.min(width * 0.08, 100);
        const connectionDistance = 150;
        const startTime = Date.now();
        const easeInDuration = 2000;

        for (let i = 0; i < particleCount; i++) {
            const targetVx = (Math.random() - 0.5) * 0.3;
            const targetVy = (Math.random() - 0.5) * 0.3;
            particles.push({ x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0, targetVx, targetVy, size: Math.random() * 1.5 + 0.8 });
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const elapsed = Date.now() - startTime;
            const easeFactor = Math.min(elapsed / easeInDuration, 1);
            const smoothEase = 1 - Math.pow(1 - easeFactor, 3);

            particles.forEach((p, i) => {
                p.vx = p.targetVx * smoothEase;
                p.vy = p.targetVy * smoothEase;
                p.x += p.vx;
                p.y += p.vy;
                const edgeBuffer = 20;
                if (p.x < edgeBuffer) p.targetVx = Math.abs(p.targetVx);
                else if (p.x > width - edgeBuffer) p.targetVx = -Math.abs(p.targetVx);
                if (p.y < edgeBuffer) p.targetVy = Math.abs(p.targetVy);
                else if (p.y > height - edgeBuffer) p.targetVy = -Math.abs(p.targetVy);
                p.x = Math.max(0, Math.min(width, p.x));
                p.y = Math.max(0, Math.min(height, p.y));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = '#26d8c4';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(38, 216, 196, ${1 - distance / connectionDistance})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            animationId = requestAnimationFrame(animate);
        };
        animationId = requestAnimationFrame(animate);

        const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
        window.addEventListener('resize', handleResize);
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); };
    }, []);

    if (!show) return null;

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#000205] overflow-hidden transition-opacity duration-1000 ${animateOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {/* Deep Space Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1d29_0%,_#000000_100%)]" />
            {/* Neural Network Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 opacity-40 mix-blend-screen" />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full pointer-events-none">
                {/* Logo */}
                <div className="relative mb-8">
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#26d8c4] blur-[60px] opacity-40 rounded-[100%] animate-pulse" />
                    <div className="relative z-20 flex items-center justify-center animate-in zoom-in-0 duration-1000 ease-out">
                        <img
                            src="/favicon.ico"
                            alt="SIKAI"
                            className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-[0_0_35px_rgba(26,136,255,0.6)]"
                            style={{ animation: 'float 6s ease-in-out infinite' }}
                        />
                    </div>
                </div>

                {/* Typography */}
                <div className="text-center relative z-30 px-4">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-[#26d8c4] to-[#1a88ff] drop-shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-200">
                        SIKAI
                    </h1>
                    <div className="h-[2px] w-0 bg-gradient-to-r from-transparent via-[#26d8c4] to-transparent mx-auto mt-4 mb-6 shadow-[0_0_15px_#26d8c4]"
                        style={{ animation: 'expand-width-full 1.5s cubic-bezier(0.22,1,0.36,1) forwards 0.8s' }} />
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm md:text-base font-mono tracking-[0.2em] animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500">
                        <span className="text-[#1a88ff] opacity-80 uppercase">Inteligencia Artificial</span>
                        <span className="hidden md:inline text-gray-700">|</span>
                        <span className="relative font-bold text-white uppercase px-4 py-1.5 bg-[#26d8c4]/10 border border-[#26d8c4]/30 rounded-lg"
                            style={{ animation: 'pulse-glow 3s infinite' }}>
                            <span className="text-[#26d8c4] drop-shadow-[0_0_8px_rgba(38,216,196,0.8)]">SOP GENERATOR</span>
                            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#26d8c4]" />
                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#26d8c4]" />
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                @keyframes expand-width-full { 0% { width: 0; opacity: 0; } 100% { width: 60%; opacity: 1; } }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(38,216,196,0.2); border-color: rgba(38,216,196,0.3); }
                    50% { box-shadow: 0 0 40px rgba(38,216,196,0.5); border-color: rgba(38,216,196,0.8); }
                }
            `}</style>
        </div>
    );
}
