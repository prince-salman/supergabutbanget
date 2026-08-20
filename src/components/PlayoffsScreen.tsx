'use client';

import React from 'react';
import { TournamentEngine } from '@/lib/tournamentEngine';
import { Team, PlayoffMatch } from '@/types';
import { globalRateLimiter } from '@/lib/security';
import { getTeamLogoUrl } from '@/lib/imageAssets';
import { Trophy, Swords, Zap, Award, Lock, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface PlayoffsScreenProps {
  tournament: TournamentEngine;
  userTeam: Team;
  onPlayPlayoffMatch: (match: PlayoffMatch) => void;
  onSimulatePlayoffMatch: () => void;
  onGoAwards: () => void;
  onGoDashboard?: () => void;
}

export const PlayoffsScreen: React.FC<PlayoffsScreenProps> = ({
  tournament,
  userTeam,
  onPlayPlayoffMatch,
  onSimulatePlayoffMatch,
  onGoAwards,
  onGoDashboard
}) => {
  const isRegularSeason = tournament.stage === 'regular';

  // 1. LOCKED STATE: Regular Season Still in Progress
  if (isRegularSeason) {
    const standings = tournament.getStandingsSorted();
    const top6 = standings.slice(0, 6);
    const bottom3 = standings.slice(6);
    const progressPercent = Math.round(((tournament.currentWeek - 1) / tournament.totalWeeks) * 100);

    return (
      <main className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn text-gray-900">
        {/* Lock Banner */}
        <div className="bg-white rounded-3xl border-2 border-red-200 shadow-xl overflow-hidden text-center p-6 md:p-10 mb-8">
          <div className="w-20 h-20 bg-red-50 text-[#680008] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>

          <span className="bg-[#680008] text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider font-mono inline-block mb-3 shadow">
            🔒 BABAK PLAYOFF TERKUNCI
          </span>

          <h1 className="text-2xl md:text-4xl font-mpl-title uppercase text-gray-900 font-black tracking-tight mb-2">
            REGULAR SEASON BELUM SELESAI
          </h1>

          <p className="text-xs md:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            Babak Playoff baru akan terbuka setelah menyelesaikan seluruh <b>{tournament.totalWeeks} Minggu</b> babak Regular Season. Hanya <b>6 Tim Teratas</b> yang berhak melaju ke Playoff!
          </p>

          {/* Progress Bar */}
          <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200 mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5 font-mono">
              <span>Progres Regular Season</span>
              <span className="text-[#680008] font-black">Minggu {tournament.currentWeek} / {tournament.totalWeeks}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#680008] to-[#d32f2f] transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-6 flex justify-center gap-3">
            {onGoDashboard && (
              <button
                onClick={onGoDashboard}
                className="px-6 py-3 bg-[#680008] hover:bg-[#82000C] text-white text-xs font-black rounded-xl shadow-lg transition flex items-center gap-2 uppercase tracking-wider"
              >
                <Swords className="w-4 h-4 text-mpl-gold" /> Lanjutkan Match Regular Season (Minggu {tournament.currentWeek})
              </button>
            )}
          </div>
        </div>

        {/* Current Qualifying Zone Preview */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 font-mpl-title mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-mpl-gold" /> Proyeksi Klasemen Sementara (Zona Playoff)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top 6 Qualified */}
            <div className="bg-green-50/50 p-4 rounded-xl border border-green-200">
              <div className="text-[11px] font-black text-green-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" /> Posisi 1 - 6 (Zona Lolos Playoff)
              </div>
              <div className="space-y-1.5">
                {top6.map((item, idx) => (
                  <div key={item.teamId} className="flex items-center justify-between p-2 rounded-lg bg-white border border-green-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-800 text-[10px] font-black flex items-center justify-center font-mono">
                        #{idx + 1}
                      </span>
                      <img src={getTeamLogoUrl(item.shortName, item.themeColor)} alt={item.shortName} className="w-5 h-5 object-contain" />
                      <span className="font-bold text-gray-900">{item.teamName}</span>
                    </div>
                    <span className="font-mono text-gray-600 font-bold">{item.points} Pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 3 Eliminated */}
            <div className="bg-red-50/50 p-4 rounded-xl border border-red-200">
              <div className="text-[11px] font-black text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" /> Posisi 7 - 9 (Zona Tereliminasi)
              </div>
              <div className="space-y-1.5">
                {bottom3.map((item, idx) => (
                  <div key={item.teamId} className="flex items-center justify-between p-2 rounded-lg bg-white border border-red-100 text-xs opacity-75">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 text-[10px] font-black flex items-center justify-center font-mono">
                        #{idx + 7}
                      </span>
                      <img src={getTeamLogoUrl(item.shortName, item.themeColor)} alt={item.shortName} className="w-5 h-5 object-contain" />
                      <span className="font-bold text-gray-700">{item.teamName}</span>
                    </div>
                    <span className="font-mono text-gray-500 font-bold">{item.points} Pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. UNLOCKED STATE: Playoff Stage Active
  if (!tournament.playoffMatches || tournament.playoffMatches.length === 0) {
    tournament.initPlayoffs();
  }

  const currentMatch = tournament.getCurrentPlayoffMatch();
  const isCompleted = tournament.stage === 'completed' || !currentMatch;
  const isUserInMatch = currentMatch && (currentMatch.homeTeam?.id === userTeam.id || currentMatch.awayTeam?.id === userTeam.id);

  const stages: PlayoffMatch['stageName'][] = ['Round 1', 'UB Semifinals', 'LB Semifinals', 'UB Final', 'LB Final', 'Grand Finals'];

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 animate-fadeIn text-gray-900">
      {/* Header */}
      <div className="text-center py-6 px-4 bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
        <div className="text-5xl mb-2 animate-float-trophy">🏆</div>
        <h1 className="text-3xl md:text-4xl font-mpl-title uppercase tracking-tight text-gray-900 font-black">
          BABAK PLAYOFFS MPL INDONESIA
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">
          Bagan 6 Tim Terbaik Memperebutkan Mahkota & Trofi Juara MPL ID 2026!
        </p>
      </div>

      {/* Action Banner for Current Match / Champion */}
      <div className="bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-sm mb-8 max-w-2xl mx-auto text-center">
        {isCompleted && tournament.championTeam ? (
          <div className="py-3">
            <span className="text-xs font-black bg-green-100 text-green-800 border border-green-300 px-3 py-1 rounded-full uppercase mb-2 inline-block">
              🎉 GRAND FINALS SELESAI
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-green-700 mt-2 font-mpl-title uppercase">
              🏆 JUARA MPL ID 2026: {tournament.championTeam.name.toUpperCase()}!
            </h2>
            <p className="text-xs text-gray-600 mt-1 mb-4">
              Turnamen telah tuntas. Masuki malam perayaan dan apresiasi pemain di Awards Gala!
            </p>
            <button
              onClick={onGoAwards}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-black rounded-xl shadow-lg uppercase tracking-wider inline-flex items-center gap-2 transition"
            >
              <Award className="w-4 h-4" /> Buka Malam Penghargaan (Awards Gala)
            </button>
          </div>
        ) : currentMatch ? (
          <div>
            <div className="text-[10px] font-black text-[#680008] uppercase tracking-wider mb-2 font-mono">
              MATCH AKTIF: {currentMatch.title}
            </div>

            <div className="flex justify-around items-center bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
              <div className="text-center">
                <span className="text-sm font-extrabold text-gray-900 block">{currentMatch.homeTeam?.name || 'TBD'}</span>
                <span className="text-[10px] text-gray-500 font-mono">Seed Tinggi</span>
              </div>
              <span className="text-lg font-black text-[#680008] font-mono">VS</span>
              <div className="text-center">
                <span className="text-sm font-extrabold text-gray-900 block">{currentMatch.awayTeam?.name || 'TBD'}</span>
                <span className="text-[10px] text-gray-500 font-mono">Challenger</span>
              </div>
            </div>

            {isUserInMatch ? (
              <button
                onClick={() => {
                  if (globalRateLimiter.isAllowed('playoff_action', 500)) {
                    onPlayPlayoffMatch(currentMatch);
                  }
                }}
                className="w-full py-3 bg-[#680008] hover:bg-[#82000C] text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Swords className="w-4 h-4 text-mpl-gold" /> Mainkan Match Playoff Tim Anda (Draft 10-Ban)
              </button>
            ) : (
              <button
                onClick={() => {
                  if (globalRateLimiter.isAllowed('playoff_action', 500)) {
                    onSimulatePlayoffMatch();
                  }
                }}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Zap className="w-4 h-4 text-mpl-gold" /> Simulasikan Match Ini (Fast Sim)
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Bracket Tree */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <div className="min-w-[840px] grid grid-cols-6 gap-3">
          {stages.map(stageName => {
            const matches = tournament.playoffMatches.filter(m => m.stageName === stageName);
            if (matches.length === 0) return null;

            return (
              <div key={stageName} className="flex flex-col gap-3">
                <div className="bg-black text-white p-2 rounded-lg text-center text-[10px] font-black uppercase tracking-wider font-mono">
                  {stageName}
                </div>

                {matches.map(m => {
                  const isUser = (m.homeTeam && m.homeTeam.id === userTeam.id) || (m.awayTeam && m.awayTeam.id === userTeam.id);
                  const isCurrent = currentMatch && currentMatch.id === m.id;
                  const isHomeWin = m.winner && m.homeTeam && m.winner.id === m.homeTeam.id;
                  const isAwayWin = m.winner && m.awayTeam && m.winner.id === m.awayTeam.id;

                  return (
                    <div
                      key={m.id}
                      className={`bg-gray-50 p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-[#680008] ring-2 ring-[#680008]/30 shadow-md'
                          : isUser
                          ? 'border-blue-500 ring-1 ring-blue-300'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mb-2">
                        <span className="truncate">{m.title}</span>
                        <span className={`px-1.5 py-0.2 rounded font-black ${m.completed ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                          {m.completed ? 'SELESAI' : 'PENDING'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className={`p-1.5 rounded flex justify-between items-center ${
                          isHomeWin ? 'bg-green-100 text-green-900 font-black border border-green-300' : 'bg-white text-gray-800 border border-gray-100'
                        }`}>
                          <span className="truncate text-[11px] font-bold">{m.homeTeam ? m.homeTeam.shortName : 'TBD'}</span>
                          <span className="font-mono font-black">{m.homeScore}</span>
                        </div>

                        <div className={`p-1.5 rounded flex justify-between items-center ${
                          isAwayWin ? 'bg-green-100 text-green-900 font-black border border-green-300' : 'bg-white text-gray-800 border border-gray-100'
                        }`}>
                          <span className="truncate text-[11px] font-bold">{m.awayTeam ? m.awayTeam.shortName : 'TBD'}</span>
                          <span className="font-mono font-black">{m.awayScore}</span>
                        </div>
                      </div>

                      {m.winner && (
                        <div className="mt-2 text-[9px] font-black text-green-700 text-center font-mono">
                          WINNER: {m.winner.shortName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
