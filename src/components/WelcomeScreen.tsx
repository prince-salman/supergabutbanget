'use client';

import React, { useState, useEffect } from 'react';
import { Team } from '@/types';
import { MPL_TEAMS } from '@/lib/data/teams';
import { sanitizeInputText, globalRateLimiter } from '@/lib/security';
import { audioMgr } from '@/lib/audioManager';
import { getTeamLogoUrl } from '@/lib/imageAssets';
import { ShieldCheck, Award, FileText, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onStartCareer: (teamId: string, coachName: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartCareer }) => {
  const [coachName, setCoachName] = useState('Coach Salman');
  const [randomOffers, setRandomOffers] = useState<Team[]>([]);
  const [selectedFreeTeam, setSelectedFreeTeam] = useState('');

  useEffect(() => {
    const shuffled = [...MPL_TEAMS].sort(() => Math.random() - 0.5);
    setRandomOffers(shuffled.slice(0, 3));
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizeInputText(e.target.value, 24);
    setCoachName(clean);
  };

  const handleSelectTeam = (teamId: string) => {
    if (!globalRateLimiter.isAllowed('start_career', 500)) return;
    const finalCoachName = sanitizeInputText(coachName, 24) || 'Coach Salman';
    audioMgr.playLockPick();
    onStartCareer(teamId, finalCoachName);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn text-gray-900">
      {/* Welcome Hero */}
      <div className="text-center py-8 px-4 bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
        <div className="inline-flex items-center gap-2 bg-red-50 text-[#680008] border border-red-200 px-3 py-1 rounded-full text-xs font-black mb-3 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-mpl-gold" /> MPL INDONESIA OFFICIAL COACH SIMULATOR
        </div>
        <h1 className="text-3xl md:text-5xl font-mpl-title uppercase tracking-tight text-gray-900 font-black">
          SELAMAT DATANG, <span className="text-[#680008]">HEAD COACH</span>!
        </h1>
        <p className="text-gray-600 text-sm md:text-base mt-2 max-w-xl mx-auto font-medium">
          Pimpin tim profesional Mobile Legends Indonesia menuju tahta juara turnamen MPL ID 2026.
        </p>

        {/* Coach Input Group */}
        <div className="max-w-md mx-auto mt-6 bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-inner">
          <label className="block text-left text-xs font-black text-[#680008] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
            <User className="w-4 h-4" /> Masukkan Nama / Nickname Head Coach:
          </label>
          <input
            type="text"
            value={coachName}
            onChange={handleNameChange}
            maxLength={24}
            placeholder="Contoh: Coach Salman"
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm font-bold focus:outline-none focus:border-[#680008] focus:ring-1 focus:ring-[#680008]"
          />
        </div>
      </div>

      {/* Contract Offers Section */}
      <div className="mb-10">
        <div className="text-center mb-6">
          <span className="text-xs font-mono font-black text-[#680008] uppercase tracking-widest">
            EXCLUSIVE CONTRACT OFFERS
          </span>
          <h2 className="text-2xl md:text-3xl font-mpl-title uppercase text-gray-900 font-black mt-1">
            3 TAWARAN KONTRAK TIM ACAK UNTUK ANDA
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manajemen dari 3 tim MPL ID ini mengajukan tawaran kontrak resmi untuk posisi Head Coach:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {randomOffers.map((team, idx) => (
            <div
              key={team.id}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#680008] transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#680008] text-white text-[10px] font-black px-2.5 py-0.5 rounded font-mono uppercase">
                    TAWARAN #{idx + 1}
                  </span>
                  <span className="text-xs font-black text-[#680008] font-mono">
                    REP: {team.reputation}%
                  </span>
                </div>

                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center p-2 shadow-md mb-3 bg-white border border-gray-200 overflow-hidden"
                >
                  <img
                    src={getTeamLogoUrl(team.tag, team.themeColor)}
                    alt={team.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-black text-sm text-gray-800">{team.tag}</span>
                </div>

                <h3 className="text-xl font-black text-center text-gray-900 uppercase">
                  {team.name}
                </h3>
                <p className="text-xs text-gray-600 text-center mt-2 leading-relaxed">
                  {team.description}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-700">
                    <span className="text-gray-500">Anggaran Tim:</span>
                    <b className="font-mono text-gray-900">${team.budget.toLocaleString()}</b>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="text-gray-500">Jumlah Roster:</span>
                    <b className="font-mono text-gray-900">{team.roster.length} Pemain Pro</b>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="text-gray-500">Asisten Coach:</span>
                    <b className="text-gray-900">{team.staff?.assistantCoach.name || 'Analyst Kayleb'}</b>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectTeam(team.id)}
                className="mt-6 w-full py-2.5 rounded-xl font-black text-xs text-white bg-[#680008] hover:bg-[#82000C] transition shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Terima Kontrak {team.shortName}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Choose Any Team Fallback */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-xl mx-auto text-center">
        <h4 className="text-sm font-black text-gray-900 uppercase mb-2">
          Atau Pilih Bebas Tim MPL ID Lainnya:
        </h4>
        <div className="flex gap-2">
          <select
            value={selectedFreeTeam}
            onChange={(e) => setSelectedFreeTeam(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#680008]"
          >
            <option value="">-- Pilih Tim MPL ID --</option>
            {MPL_TEAMS.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.tag})</option>
            ))}
          </select>
          <button
            onClick={() => selectedFreeTeam && handleSelectTeam(selectedFreeTeam)}
            disabled={!selectedFreeTeam}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Mulai Karier
          </button>
        </div>
      </div>
    </main>
  );
};
