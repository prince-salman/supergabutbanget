'use client';

import React from 'react';
import { TournamentEngine } from '@/lib/tournamentEngine';
import { getPlayerAvatarUrl, getCoachAvatarUrl } from '@/lib/imageAssets';
import { Trophy, Award, Star, Flame, Crown, ArrowLeft, Lock } from 'lucide-react';

interface AwardsScreenProps {
  tournament: TournamentEngine;
  coachName: string;
  onReturnDashboard: () => void;
}

export const AwardsScreen: React.FC<AwardsScreenProps> = ({
  tournament,
  coachName,
  onReturnDashboard
}) => {
  const isCompleted = tournament.stage === 'awards' || tournament.stage === 'completed';

  // 1. LOCKED STATE: Season not completed yet
  if (!isCompleted) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 animate-fadeIn text-gray-900">
        <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-xl overflow-hidden text-center p-8 md:p-12">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-200 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>

          <span className="bg-amber-500 text-black text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider font-mono inline-block mb-3 shadow">
            🔒 MALAM PENGHARGAAN TERKUNCI
          </span>

          <h1 className="text-2xl md:text-4xl font-mpl-title uppercase text-gray-900 font-black tracking-tight mb-2">
            AWARDS GALA BELUM DIBUKA
          </h1>

          <p className="text-xs md:text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
            Malam Penghargaan Resmi MPL ID Season 2026 (Regular Season MVP, Finals MVP, Coach of the Season, dan First Team All-Star) akan dibuka setelah babak Playoff & Grand Finals tuntas diselenggarakan!
          </p>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-w-sm mx-auto text-xs text-gray-600 mb-6 space-y-1">
            <div>Status Musim: <b className="text-[#680008] uppercase font-bold">{tournament.stage === 'regular' ? `Regular Season (Minggu ${tournament.currentWeek}/${tournament.totalWeeks})` : 'Babak Playoff'}</b></div>
            <div>Syarat Pembukaan: <b className="text-gray-900 font-bold">Menyelesaikan Grand Finals</b></div>
          </div>

          <button
            onClick={onReturnDashboard}
            className="px-6 py-3 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-2 mx-auto uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Menu Utama
          </button>
        </div>
      </main>
    );
  }

  // 2. UNLOCKED STATE: Gala Active
  const awards = tournament.calculateAwards(coachName);
  const star = awards.firstTeamAllStar;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 animate-fadeIn text-gray-900">
      {/* Gala Hero */}
      <div className="text-center py-8 px-4 bg-gradient-to-b from-amber-100 via-white to-white rounded-2xl border border-amber-300 shadow-xl mb-8">
        <div className="text-6xl mb-2 animate-float-trophy">👑🏆👑</div>
        <h1 className="text-3xl md:text-5xl font-mpl-title uppercase tracking-tight text-gray-900 font-black">
          MALAM PENGHARGAAN MPL ID
        </h1>
        <h3 className="text-base md:text-lg font-bold text-gray-700 mt-1">
          MPL Indonesia Season 2026 Awards Gala
        </h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-lg mx-auto">
          Apresiasi resmi untuk pemain, pelatih, dan formasi All-Star terbaik sepanjang musim kompetisi!
        </p>
      </div>

      {/* Main Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Regular Season MVP */}
        <div className="bg-white p-5 rounded-2xl border-2 border-amber-400 shadow-xl text-center relative flex flex-col justify-between hover:border-amber-500 transition">
          <div>
            <span className="bg-amber-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block shadow-md">
              🏆 REGULAR SEASON MVP
            </span>
            <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-amber-400 shadow-xl mb-3 bg-gray-100">
              <img
                src={getPlayerAvatarUrl(awards.regularSeasonMvp.name, awards.regularSeasonMvp.teamColor || '#d32f2f')}
                alt={awards.regularSeasonMvp.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-black text-gray-900 font-mpl-title">{awards.regularSeasonMvp.name}</h2>
            <div className="text-xs text-gray-500 mt-0.5 font-bold">
              {awards.regularSeasonMvp.teamName} • <b className="text-amber-600">{awards.regularSeasonMvp.role} Lane</b>
            </div>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 mt-4 text-xs flex justify-around font-mono">
            <span>KDA: <b className="text-gray-900">{awards.regularSeasonMvp.kills}/{awards.regularSeasonMvp.deaths}/{awards.regularSeasonMvp.assists}</b></span>
            <span>MVP: <b className="text-amber-600 font-black">{awards.regularSeasonMvp.mvpCount}x</b></span>
          </div>
        </div>

        {/* Finals MVP (FMVP) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-red-500 shadow-xl text-center relative flex flex-col justify-between hover:border-red-600 transition">
          <div>
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block shadow-md">
              👑 FINALS MVP (FMVP)
            </span>
            <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-red-500 shadow-xl mb-3 bg-gray-100">
              <img
                src={getPlayerAvatarUrl(awards.finalsMvp.name, '#e74c3c')}
                alt={awards.finalsMvp.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-black text-gray-900 font-mpl-title">{awards.finalsMvp.name}</h2>
            <div className="text-xs text-gray-500 mt-0.5 font-bold">
              {awards.championTeam.name} • <b className="text-red-600">{awards.finalsMvp.role} Lane</b>
            </div>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 mt-4 text-xs flex justify-around font-mono">
            <span>Role: <b className="text-gray-900">{awards.finalsMvp.role}</b></span>
            <span>Damage: <b className="text-red-600 font-black">{Math.round(awards.finalsMvp.totalDamage || 45000).toLocaleString()}</b></span>
          </div>
        </div>

        {/* Coach of the Season */}
        <div className="bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-xl text-center relative flex flex-col justify-between hover:border-blue-600 transition">
          <div>
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block shadow-md">
              👔 COACH OF THE SEASON
            </span>
            <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-blue-500 shadow-xl mb-3 bg-gray-100">
              <img
                src={getCoachAvatarUrl(awards.coachOfTheSeason.name)}
                alt={awards.coachOfTheSeason.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-black text-gray-900 font-mpl-title">{awards.coachOfTheSeason.name}</h2>
            <div className="text-xs text-gray-500 mt-0.5 font-bold">
              {awards.coachOfTheSeason.team.name}
            </div>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 mt-4 text-xs flex justify-around font-mono">
            <span>Tim: <b className="text-blue-600 font-black">{awards.coachOfTheSeason.team.shortName}</b></span>
            <span>Status: <b className="text-gray-900 font-black">{awards.coachOfTheSeason.isUser ? 'Head Coach (User)' : 'Pro Coach'}</b></span>
          </div>
        </div>
      </div>

      {/* First Team All-Star */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl mb-8">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 font-mpl-title uppercase text-center mb-6">
          ⭐ FIRST TEAM ALL-STAR MPL ID 2026 ⭐
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { lane: 'EXP LANE', player: star.exp },
            { lane: 'JUNGLE', player: star.jungle },
            { lane: 'MID LANE', player: star.mid },
            { lane: 'GOLD LANE', player: star.gold },
            { lane: 'ROAMER', player: star.roam }
          ].map(item => (
            <div key={item.lane} className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black bg-gray-200 text-gray-700 px-2 py-0.5 rounded uppercase font-mono">
                  {item.lane}
                </span>
                <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border border-gray-300 shadow my-2 bg-white">
                  <img
                    src={getPlayerAvatarUrl(item.player.name, item.player.teamColor)}
                    alt={item.player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-extrabold text-sm text-gray-900 truncate font-mono">{item.player.name}</div>
                <div className="text-[10px] text-gray-500">{item.player.teamName}</div>
              </div>
              <div className="text-[10px] font-bold text-amber-600 mt-2 font-mono">Rating: {item.player.rating}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onReturnDashboard}
          className="px-8 py-3 bg-[#680008] hover:bg-[#82000C] text-white text-xs font-black rounded-xl shadow-lg transition inline-flex items-center gap-2 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Menu Utama
        </button>
      </div>
    </main>
  );
};
