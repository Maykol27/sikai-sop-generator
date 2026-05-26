"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 dark:border-white/10 bg-white/85 dark:bg-[#16181d]/85 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            {/* SIKAI SOP stylized outline icon - Matches SIKAI Finance style */}
            <div className="w-9 h-9 rounded-xl border border-[#1a88ff]/30 bg-[#1a88ff]/10 flex items-center justify-center shadow-[0_0_12px_rgba(26,136,255,0.15)] group-hover:shadow-[0_0_20px_rgba(26,136,255,0.35)] group-hover:border-[#1a88ff]/60 transition-all duration-300 flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-[#1a88ff] stroke-[1.75]" />
            </div>
            <div className="flex items-center gap-1.5 font-bold text-base tracking-tight font-headline">
              <span className="text-gray-900 dark:text-white">SIKAI</span>
              <span className="text-[#1a88ff]">SOP GENERATOR</span>
            </div>
          </Link>

          {/* Navigation Links & CTA */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(26,136,255,0.5)] hover:shadow-[0_0_25px_rgba(38,216,196,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 duration-200">
              Conectar Cuenta
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
