'use client';

import React, { useState } from 'react';
import { audioMgr } from '@/lib/audioManager';
import { globalRateLimiter } from '@/lib/security';
import { Trophy, Home, Award, Volume2, VolumeX, RotateCcw, Shield, Calendar, Users, BarChart3, Newspaper } from 'lucide-react';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screenId: string) => void;
  onResetCareer: () => void;
  stage?: 'regular' | 'playoffs' | 'awards' | 'completed';
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate, onResetCareer, stage = 'regular' }) => {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleSound = () => {
    if (!globalRateLimiter.isAllowed('toggle_sound', 200)) return;
    const muted = audioMgr.toggleMute();
    setIsMuted(muted);
  };

  const handleNavClick = (screenId: string) => {
    if (!globalRateLimiter.isAllowed(`nav_${screenId}`, 250)) return;
    onNavigate(screenId);
  };

  return (
    <header className="bg-[#680008] border-b-2 border-[#4A0006] text-white px-4 md:px-8 py-2.5 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        {/* Brand / Logo (matching id-mpl.com) */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('screen-dashboard')}>
          <div className="flex items-center gap-2.5">
            <img
              src="https://id-mpl.com/images/s14/logo/LOGO_MPL-ID-NEW-2024-400.webp"
              alt="MPL ID Logo"
              className="h-8 md:h-10 w-auto object-contain"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <img
              src="https://id-mpl.com/images/s14/logo/weownthis-white.webp"
              alt="WE OWN THIS"
              className="h-6 md:h-7 w-auto object-contain hidden sm:block"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-mpl-title tracking-wider text-white uppercase leading-tight font-black">
                MPL INDONESIA
              </span>
              <span className="text-[9px] text-red-300 font-mono font-bold tracking-wider">
                SEASON 2026 • 10-BAN COACH SIMULATOR
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links matching id-mpl.com */}
        <nav className="flex items-center gap-1 sm:gap-3 flex-wrap text-[11px] md:text-xs font-bold uppercase tracking-wide">
          <button
            onClick={() => handleNavClick('screen-dashboard')}
            className={`px-2.5 py-1 rounded transition ${
              currentScreen === 'screen-dashboard'
                ? 'text-white border-b-2 border-white font-extrabold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            HOME
          </button>

          <button
            onClick={() => handleNavClick('screen-dashboard')}
            className="text-gray-200 hover:text-white px-2.5 py-1 transition"
          >
            TIM
          </button>

          <button
            onClick={() => handleNavClick('screen-schedule')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              currentScreen === 'screen-schedule'
                ? 'text-white border-b-2 border-white font-extrabold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            JADWAL
          </button>

          <button
            onClick={() => handleNavClick('screen-statistics')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              currentScreen === 'screen-statistics'
                ? 'text-white border-b-2 border-white font-extrabold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-mpl-gold" /> STATISTIK
          </button>

          <button
            onClick={() => handleNavClick('screen-playoffs')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              currentScreen === 'screen-playoffs'
                ? 'text-white border-b-2 border-white font-extrabold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-mpl-gold" /> PLAYOFF {stage === 'regular' && <span className="text-[9px] bg-black/40 text-amber-300 px-1 py-0.2 rounded font-mono">🔒</span>}
          </button>

          <button
            onClick={() => handleNavClick('screen-awards')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              currentScreen === 'screen-awards'
                ? 'text-white border-b-2 border-white font-extrabold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-mpl-gold" /> AWARDS {(stage === 'regular' || stage === 'playoffs') && <span className="text-[9px] bg-black/40 text-amber-300 px-1 py-0.2 rounded font-mono">🔒</span>}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-white/20">
            {/* Language Tag */}
            <span className="text-[11px] font-bold text-gray-200 hidden md:inline-flex items-center gap-1">
              <span>🇮🇩</span> ID
            </span>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-1.5 rounded text-xs transition border ${
                isMuted
                  ? 'bg-red-950 text-red-300 border-red-800'
                  : 'bg-black/30 text-white border-white/20 hover:bg-black/50'
              }`}
              title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-mpl-gold" />}
            </button>

            {/* Reset Button */}
            <button
              onClick={onResetCareer}
              className="p-1.5 rounded text-xs bg-black/30 hover:bg-red-950 text-gray-300 hover:text-white border border-white/20 transition"
              title="Reset Karier Head Coach"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
