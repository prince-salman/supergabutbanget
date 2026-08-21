'use client';

import React, { useState, useRef } from 'react';
import { audioMgr } from '@/lib/audioManager';
import { globalRateLimiter } from '@/lib/security';
import { Trophy, Home, Award, Volume2, VolumeX, RotateCcw, Shield, Calendar, Users, BarChart3, Download, Upload, Newspaper } from 'lucide-react';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screenId: string) => void;
  onResetCareer: () => void;
  onExportSave?: () => void;
  onImportSave?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stage?: 'regular' | 'playoffs' | 'awards' | 'completed';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onResetCareer,
  onExportSave,
  onImportSave,
  stage = 'regular'
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleToggleSound = () => {
    if (!globalRateLimiter.isAllowed('toggle_sound', 200)) return;
    const muted = audioMgr.toggleMute();
    setIsMuted(muted);
  };

  const handleNavClick = (screenId: string) => {
    if (!globalRateLimiter.isAllowed(`nav_${screenId}`, 250)) return;
    onNavigate(screenId);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <header className="bg-[#680008] border-b-2 border-[#4A0006] text-white px-3 sm:px-4 md:px-8 py-2 md:py-2.5 sticky top-0 z-50 shadow-md">
      {/* Hidden file input for restore save */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImportSave}
        accept=".json"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
        {/* Brand / Logo (matching id-mpl.com) */}
        <div className="w-full sm:w-auto flex justify-between sm:justify-start items-center gap-2.5">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('screen-dashboard')}>
            <img
              src="https://id-mpl.com/images/s14/logo/LOGO_MPL-ID-NEW-2024-400.webp"
              alt="MPL ID Logo"
              className="h-7 sm:h-8 md:h-10 w-auto object-contain"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base md:text-xl font-mpl-title tracking-wider text-white uppercase leading-tight font-black">
                MPL INDONESIA
              </span>
              <span className="text-[8px] sm:text-[9px] text-red-300 font-mono font-bold tracking-wider">
                SEASON 2026 • COACH SIMULATOR
              </span>
            </div>
          </div>

          {/* Quick Actions (Audio, Backup & Reset) for Mobile */}
          <div className="flex sm:hidden items-center gap-1.5">
            {onExportSave && (
              <button
                onClick={onExportSave}
                className="p-1.5 rounded text-xs bg-black/30 text-amber-300 border border-white/20 hover:bg-black/50"
                title="Backup Save File (.json)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}

            {onImportSave && (
              <button
                onClick={handleUploadClick}
                className="p-1.5 rounded text-xs bg-black/30 text-blue-300 border border-white/20 hover:bg-black/50"
                title="Restore / Upload Save Game"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            )}

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

            <button
              onClick={onResetCareer}
              className="p-1.5 rounded text-xs bg-black/30 hover:bg-red-950 text-gray-300 hover:text-white border border-white/20 transition"
              title="Reset Karier Head Coach"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Links with Horizontal Touch Scroll on Mobile */}
        <nav className="w-full sm:w-auto flex items-center gap-1 sm:gap-2.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 text-[10px] sm:text-[11px] md:text-xs font-bold uppercase tracking-wide whitespace-nowrap">
          <button
            onClick={() => handleNavClick('screen-dashboard')}
            className={`px-2 sm:px-2.5 py-1 rounded transition shrink-0 ${
              currentScreen === 'screen-dashboard'
                ? 'bg-white/20 text-white font-extrabold border-b-2 border-mpl-gold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            HOME
          </button>

          <button
            onClick={() => handleNavClick('screen-schedule')}
            className={`px-2 sm:px-2.5 py-1 rounded transition flex items-center gap-1 shrink-0 ${
              currentScreen === 'screen-schedule'
                ? 'bg-white/20 text-white font-extrabold border-b-2 border-mpl-gold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            <Calendar className="w-3 h-3 text-mpl-gold" /> JADWAL
          </button>

          <button
            onClick={() => handleNavClick('screen-statistics')}
            className={`px-2 sm:px-2.5 py-1 rounded transition flex items-center gap-1 shrink-0 ${
              currentScreen === 'screen-statistics'
                ? 'bg-white/20 text-white font-extrabold border-b-2 border-mpl-gold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3 h-3 text-mpl-gold" /> STATISTIK
          </button>

          <button
            onClick={() => handleNavClick('screen-news')}
            className={`px-2 sm:px-2.5 py-1 rounded transition flex items-center gap-1 shrink-0 ${
              currentScreen === 'screen-news'
                ? 'bg-white/20 text-white font-extrabold border-b-2 border-mpl-gold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            <Newspaper className="w-3 h-3 text-mpl-gold" /> BERITA
          </button>

          <button
            onClick={() => handleNavClick('screen-playoffs')}
            className={`px-2 sm:px-2.5 py-1 rounded transition flex items-center gap-1 shrink-0 ${
              currentScreen === 'screen-playoffs'
                ? 'bg-white/20 text-white font-extrabold border-b-2 border-mpl-gold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            <Trophy className="w-3 h-3 text-mpl-gold" /> PLAYOFF {stage === 'regular' && <span className="text-[8px] bg-black/40 text-amber-300 px-1 py-0.2 rounded font-mono">🔒</span>}
          </button>

          <button
            onClick={() => handleNavClick('screen-awards')}
            className={`px-2 sm:px-2.5 py-1 rounded transition flex items-center gap-1 shrink-0 ${
              currentScreen === 'screen-awards'
                ? 'bg-white/20 text-white font-extrabold border-b-2 border-mpl-gold'
                : 'text-gray-200 hover:text-white'
            }`}
          >
            <Award className="w-3 h-3 text-mpl-gold" /> AWARDS {(stage === 'regular' || stage === 'playoffs') && <span className="text-[8px] bg-black/40 text-amber-300 px-1 py-0.2 rounded font-mono">🔒</span>}
          </button>

          {/* Desktop Quick Actions (Backup, Restore, Audio & Reset) */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/20">
            {onExportSave && (
              <button
                onClick={onExportSave}
                className="p-1.5 rounded text-xs bg-black/30 text-amber-300 border border-white/20 hover:bg-black/50 transition flex items-center gap-1"
                title="Backup Save File (.json)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono hidden md:inline">BACKUP</span>
              </button>
            )}

            {onImportSave && (
              <button
                onClick={handleUploadClick}
                className="p-1.5 rounded text-xs bg-black/30 text-blue-300 border border-white/20 hover:bg-black/50 transition flex items-center gap-1"
                title="Restore Save File (.json)"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono hidden md:inline">RESTORE</span>
              </button>
            )}

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
