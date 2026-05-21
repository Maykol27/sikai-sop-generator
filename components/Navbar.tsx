"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#26d8c4] animate-pulse" />
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              SIKAI <span className="text-[#1a88ff] text-glow">CX</span>
              <span className="ml-2 text-sm font-normal text-gray-400">SOP Generator</span>
            </Link>
          </div>
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
