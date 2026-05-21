"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Coins, Sun, Moon, FileText, ClipboardList, Eye } from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import { WelcomeTutorialModal } from '@/components/WelcomeTutorialModal';
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
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Show splash only on first login per session
    const hasSeenSplash = sessionStorage.getItem('sikai-splash-shown');
    if (!hasSeenSplash) {
      setShowSplash(true);
      sessionStorage.setItem('sikai-splash-shown', 'true');
    }

    // Auto-show tutorial if they haven't seen it yet
    const hasSeenTutorial = localStorage.getItem('sikai_sop_tutorial_seen');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Click outside handler for profile dropdown
  useEffect(() => {
    if (!showDropdown) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showDropdown]);

  // Extract initials from user full name
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <WelcomeTutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      <div className="min-h-screen relative overflow-x-hidden bg-[#09101d] dark:bg-[#09101d] light:bg-[#f0f6fc] text-foreground transition-colors duration-300">
        {/* Background Blobs - SIKAI Finance Nebula Effect */}
        <div className="fixed bg-blob bg-blob-primary w-[30rem] h-[30rem] -top-20 -left-20 pointer-events-none" style={{ animationDelay: '0s' }} />
        <div className="fixed bg-blob bg-blob-cyan w-[40rem] h-[40rem] top-1/4 -right-20 pointer-events-none" style={{ animationDelay: '-5s' }} />
        <div className="fixed bg-blob bg-blob-dark-blue w-[25rem] h-[25rem] bottom-0 left-1/3 pointer-events-none" style={{ animationDelay: '-10s' }} />

        {/* Flagship Fixed edge-to-edge Navbar */}
        <header className="fixed top-0 left-0 right-0 h-16 z-50 border-b border-black/5 dark:border-white/10 bg-[#09101d]/85 dark:bg-[#09101d]/85 light:bg-[#ffffff]/85 backdrop-blur-md transition-all duration-300">
          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Left: Logo + Brand */}
            <Link href="/dashboard" className="flex items-center gap-3 group select-none">
              {/* SIKAI Process/SOP outline icon - Styled exactly like SIKAI Finance */}
              <div className="w-9 h-9 rounded-xl border border-[#1a88ff]/30 bg-[#1a88ff]/10 flex items-center justify-center shadow-[0_0_12px_rgba(26,136,255,0.15)] group-hover:shadow-[0_0_20px_rgba(26,136,255,0.35)] group-hover:border-[#1a88ff]/60 transition-all duration-300 flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-[#1a88ff] stroke-[1.75]" />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5 font-bold text-base tracking-tight font-headline">
                  <span className="text-gray-900 dark:text-white">SIKAI</span>
                  <span className="text-[#1a88ff]">SOP GENERATOR</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">
                  Hola, {fullName.split(' ')[0]} 👋
                </span>
              </div>
            </Link>

            {/* Center: Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4" />
                Mis SOPs
              </Link>
              <Link href="/dashboard/billing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1.5 font-medium">
                <Coins className="w-4 h-4" />
                Créditos
              </Link>
            </nav>

            {/* Right: Credits, Eye, Theme, Dropdown Avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Credits Badge */}
              <Link href="/dashboard/billing" className="flex items-center gap-1.5 bg-[#1a88ff]/10 hover:bg-[#1a88ff]/20 transition-colors px-3 py-1.5 rounded-full border border-[#1a88ff]/30 shadow-sm">
                <Coins className="w-3.5 h-3.5 text-[#1a88ff]" />
                <span className="text-xs font-bold text-gray-800 dark:text-[#e0e6ed]">{credits}</span>
                <span className="hidden sm:inline text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">créditos</span>
              </Link>

              {/* Eye Button (Tutorial Trigger) */}
              <button
                onClick={() => setShowTutorial(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 hover:border-[#1a88ff]/40 dark:hover:border-[#26d8c4]/40 bg-black/5 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
                title="Ver instructivo de SOPs de alta calidad"
              >
                <Eye className="w-4.5 h-4.5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 hover:border-[#1a88ff]/40 dark:hover:border-[#26d8c4]/40 bg-black/5 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark'
                  ? <Sun className="w-4.5 h-4.5 text-[#26d8c4]" />
                  : <Moon className="w-4.5 h-4.5 text-[#1a88ff]" />
                }
              </button>

              {/* Interactive User Dropdown */}
              <div className="relative user-dropdown-container">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a88ff] to-[#26d8c4] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(26,136,255,0.4)] hover:shadow-[0_0_20px_rgba(38,216,196,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  {getInitials(fullName)}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 glass rounded-2xl p-2 shadow-2xl border border-black/10 dark:border-white/10 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{fullName}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <Coins className="w-3 h-3 text-[#1a88ff]" />
                        <span>{credits} créditos disponibles</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowTutorial(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        Ver Instructivo
                      </button>

                      <Link
                        href="/dashboard/billing"
                        onClick={() => setShowDropdown(false)}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                      >
                        <Coins className="w-3.5 h-3.5 text-gray-400" />
                        Comprar Créditos
                      </Link>

                      <form action="/auth/signout" method="post" className="w-full mt-1 border-t border-black/5 dark:border-white/5 pt-1">
                        <button
                          type="submit"
                          className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                          Cerrar Sesión
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Container (Margin top to clear fixed header) */}
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col pb-8 relative z-10">
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-black/5 dark:border-white/5 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-body">
              © {new Date().getFullYear()} SIKAI SOP Generator · Todos los derechos reservados ·{' '}
              <Link href="/privacy" className="hover:text-[#1a88ff] dark:hover:text-[#26d8c4] transition-colors underline underline-offset-2 font-medium">
                Política de Tratamiento de Datos
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
