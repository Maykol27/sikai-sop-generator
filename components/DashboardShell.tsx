"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Coins, Sun, Moon, FileText } from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardShellProps {
  children: React.ReactNode;
  credits: number;
  fullName: string;
  userId: string;
}

export default function DashboardShell({ children, credits, fullName, userId }: DashboardShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Show splash only on first login per session
    const hasSeenSplash = sessionStorage.getItem('sikai-splash-shown');
    if (!hasSeenSplash) {
      setShowSplash(true);
      sessionStorage.setItem('sikai-splash-shown', 'true');
    }
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <div className="min-h-screen relative overflow-x-hidden">
        {/* Background Blobs */}
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blob bg-blob-primary pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-blob bg-blob-cyan pointer-events-none" style={{ animationDelay: '5s' }} />

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 min-h-screen flex flex-col">
          {/* Header / Navbar */}
          <header className="glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between mb-8 sticky top-4 z-50">
            {/* Left: Logo + Brand */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              {/* SVG Logo Mark - scales perfectly unlike .ico */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a88ff] to-[#26d8c4] flex items-center justify-center shadow-[0_0_12px_rgba(26,136,255,0.4)] group-hover:shadow-[0_0_20px_rgba(38,216,196,0.5)] transition-all flex-shrink-0">
                <span className="text-white font-black text-base leading-none" style={{ fontFamily: 'Poppins, sans-serif' }}>S</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>SIKAI</span>
                <span className="text-[10px] text-[#26d8c4] tracking-widest uppercase" style={{ fontFamily: 'Source Code Pro, monospace' }}>SOP Generator</span>
              </div>
            </Link>

            {/* Center: Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Mis SOPs
              </Link>
              <Link href="/dashboard/billing" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                Créditos
              </Link>
            </nav>

            {/* Right: Credits + Theme + Signout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Credits Badge */}
              <Link href="/dashboard/billing" className="flex items-center gap-1.5 bg-[#1a88ff]/10 hover:bg-[#1a88ff]/20 transition-colors px-3 py-1.5 rounded-full border border-[#1a88ff]/30">
                <Coins className="w-3.5 h-3.5 text-[#26d8c4]" />
                <span className="text-xs font-bold text-[#e0e6ed]">{credits}</span>
                <span className="hidden sm:inline text-xs text-gray-400">créditos</span>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full glass hover:border-[#1a88ff]/40 transition-all"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4 text-[#26d8c4]" />
                  : <Moon className="w-4 h-4 text-[#1a88ff]" />
                }
              </button>

              {/* Sign Out */}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="p-2 rounded-full glass hover:border-red-500/40 transition-all group"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                </button>
              </form>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600 font-body">
              © {new Date().getFullYear()} SIKAI CX · Todos los derechos reservados ·{' '}
              <Link href="/privacy" className="hover:text-[#1a88ff] transition-colors underline underline-offset-2">
                Política de Tratamiento de Datos
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
