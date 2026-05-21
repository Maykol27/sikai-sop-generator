"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#1a88ff] to-[#26d8c4] flex items-center justify-center shadow-[0_0_12px_rgba(26,136,255,0.4)] group-hover:shadow-[0_0_20px_rgba(38,216,196,0.5)] transition-all flex-shrink-0">
              <span className="text-white font-bold text-lg leading-none" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>S</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-base text-white tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>SIKAI</span>
              <span className="text-[8px] text-[#26d8c4] tracking-[0.16em] uppercase font-bold mt-1" style={{ fontFamily: 'var(--font-source-code-pro), monospace' }}>SOP Generator</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <button className="bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(26,136,255,0.5)] hover:shadow-[0_0_25px_rgba(38,216,196,0.6)] transition-all transform hover:-translate-y-0.5">
              Conectar Cuenta
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
