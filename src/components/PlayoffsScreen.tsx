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
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono text-white ${
                currentMatch.stageName === 'Grand Finals' ? 'bg-amber-600 animate-pulse' : 'bg-[#680008]'
              }`}>
                {currentMatch.stageName === 'Grand Finals' ? '👑 GRAND FINALS (BO7 • FIRST TO 4 WINS)' : '🔥 PLAYOFFS (BO5 • FIRST TO 3 WINS)'}
              </span>
            </div>

            <div className="text-xs font-black text-gray-900 uppercase tracking-tight mb-2 font-mpl-title">
              {currentMatch.title}
            </div>

            <div className="flex justify-around items-center bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
              <div className="text-center">
                <span className="text-sm font-extrabold text-gray-900 block">{currentMatch.homeTeam?.name || 'TBD'}</span>
                <span className="text-[10px] text-gray-500 font-mono">Tim Home / Seed Tinggi</span>
              </div>
              <span className="text-lg font-black text-[#680008] font-mono">VS</span>
              <div className="text-center">
                <span className="text-sm font-extrabold text-gray-900 block">{currentMatch.awayTeam?.name || 'TBD'}</span>
                <span className="text-[10px] text-gray-500 font-mono">Tim Away / Challenger</span>
              </div>
            </div>

            {isUserInMatch ? (
              <button
                onClick={() => {
                  if (globalRateLimiter.isAllowed('playoff_action', 500)) {
                    onPlayPlayoffMatch(currentMatch);
                  }
                }}
                className="w-full py-3 bg-[#680008] hover:bg-[#82000C] text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wider animate-bounce"
              >
                <Swords className="w-4 h-4 text-mpl-gold" /> Mainkan Match Playoff Tim Anda ({currentMatch.stageName === 'Grand Finals' ? 'Seri BO7' : 'Seri BO5'})
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

      {/* Official Upper & Lower Bracket Layout */}
      <div className="space-y-6">
        {/* 1. UPPER BRACKET */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-100">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <h3 className="text-sm md:text-base font-black text-blue-900 uppercase font-mpl-title">
              🔥 UPPER BRACKET (BEST OF 5 - FIRST TO 3 WINS)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Play-ins (Round 1) */}
            <div className="space-y-3">
              <div className="bg-blue-900 text-white p-1.5 rounded-lg text-center text-[10px] font-black uppercase font-mono">
                Round 1 (Play-in BO5)
              </div>
              {tournament.playoffMatches.filter(m => m.stageName === 'Round 1').map(renderMatchCard)}
            </div>

            {/* UB Semifinals */}
            <div className="space-y-3">
              <div className="bg-blue-900 text-white p-1.5 rounded-lg text-center text-[10px] font-black uppercase font-mono">
                UB Semifinals (BO5)
              </div>
              {tournament.playoffMatches.filter(m => m.stageName === 'UB Semifinals').map(renderMatchCard)}
            </div>

            {/* UB Final */}
            <div className="space-y-3">
              <div className="bg-blue-900 text-white p-1.5 rounded-lg text-center text-[10px] font-black uppercase font-mono">
                UB Final (Tiket Grand Final • BO5)
              </div>
              {tournament.playoffMatches.filter(m => m.stageName === 'UB Final').map(renderMatchCard)}
            </div>
          </div>
        </div>

        {/* 2. LOWER BRACKET & GRAND FINAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lower Bracket Column */}
          <div className="md:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-red-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-100">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <h3 className="text-sm md:text-base font-black text-red-900 uppercase font-mpl-title">
                💀 LOWER BRACKET (BEST OF 5 - KNOCKOUT ELIMINASI)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LB Semifinal */}
              <div className="space-y-3">
                <div className="bg-red-900 text-white p-1.5 rounded-lg text-center text-[10px] font-black uppercase font-mono">
                  LB Semifinal (BO5)
                </div>
                {tournament.playoffMatches.filter(m => m.stageName === 'LB Semifinals').map(renderMatchCard)}
              </div>

              {/* LB Final */}
              <div className="space-y-3">
                <div className="bg-red-900 text-white p-1.5 rounded-lg text-center text-[10px] font-black uppercase font-mono">
                  LB Final (Tiket Grand Final • BO5)
                </div>
                {tournament.playoffMatches.filter(m => m.stageName === 'LB Final').map(renderMatchCard)}
              </div>
            </div>
          </div>

          {/* Grand Final Column */}
          <div className="bg-gradient-to-b from-amber-50 to-amber-100/50 p-4 md:p-6 rounded-2xl border-2 border-amber-400 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-200">
                <span className="text-lg">👑</span>
                <h3 className="text-sm md:text-base font-black text-amber-900 uppercase font-mpl-title">
                  GRAND FINALS (BO7)
                </h3>
              </div>

              <div className="text-[10px] text-amber-800 font-bold mb-3 font-mono">
                🏆 BEST OF 7 • FIRST TO 4 WINS
              </div>

              <div className="space-y-3">
                {tournament.playoffMatches.filter(m => m.stageName === 'Grand Finals').map(renderMatchCard)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200 text-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Pemenang Grand Final:</span>
              <span className="text-xs font-black text-[#680008] font-mpl-title">JUARA RESMI MPL INDONESIA 2026</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  function renderMatchCard(m: PlayoffMatch) {
    const isUser = (m.homeTeam && m.homeTeam.id === userTeam.id) || (m.awayTeam && m.awayTeam.id === userTeam.id);
    const isCurrent = currentMatch && currentMatch.id === m.id;
    const isHomeWin = m.winner && m.homeTeam && m.winner.id === m.homeTeam.id;
    const isAwayWin = m.winner && m.awayTeam && m.winner.id === m.awayTeam.id;
    const isBO7 = m.stageName === 'Grand Finals';

    return (
      <div
        key={m.id}
        className={`bg-white p-3 rounded-xl border text-xs flex flex-col justify-between transition-all shadow-sm ${
          isCurrent
            ? 'border-[#680008] ring-2 ring-[#680008]/40 shadow-md'
            : isUser
            ? 'border-blue-500 ring-1 ring-blue-300'
            : 'border-gray-200'
        }`}
      >
        <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mb-2">
          <span className="truncate font-bold text-gray-700">{m.title}</span>
          <span className={`px-1.5 py-0.5 rounded font-black ${
            m.completed ? 'bg-green-100 text-green-800 border border-green-300' : isCurrent ? 'bg-amber-400 text-black font-black animate-pulse' : 'bg-gray-100 text-gray-600'
          }`}>
            {m.completed ? 'SELESAI' : isCurrent ? 'LIVE MATCH' : isBO7 ? 'BO7' : 'BO5'}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className={`p-2 rounded-lg flex justify-between items-center border ${
            isHomeWin ? 'bg-green-50 text-green-900 font-black border-green-300' : 'bg-gray-50 text-gray-800 border-gray-100'
          }`}>
            <div className="flex items-center gap-1.5 truncate">
              {m.homeTeam && (
                <img src={getTeamLogoUrl(m.homeTeam.shortName, m.homeTeam.themeColor)} alt={m.homeTeam.shortName} className="w-4 h-4 object-contain shrink-0" />
              )}
              <span className="truncate text-[11px] font-bold">{m.homeTeam ? m.homeTeam.name : 'TBD'}</span>
            </div>
            <span className="font-mono font-black text-sm ml-2">{m.homeScore}</span>
          </div>

          <div className={`p-2 rounded-lg flex justify-between items-center border ${
            isAwayWin ? 'bg-green-50 text-green-900 font-black border-green-300' : 'bg-gray-50 text-gray-800 border-gray-100'
          }`}>
            <div className="flex items-center gap-1.5 truncate">
              {m.awayTeam && (
                <img src={getTeamLogoUrl(m.awayTeam.shortName, m.awayTeam.themeColor)} alt={m.awayTeam.shortName} className="w-4 h-4 object-contain shrink-0" />
              )}
              <span className="truncate text-[11px] font-bold">{m.awayTeam ? m.awayTeam.name : 'TBD'}</span>
            </div>
            <span className="font-mono font-black text-sm ml-2">{m.awayScore}</span>
          </div>
        </div>

        {m.winner && (
          <div className="mt-2 text-[10px] font-black text-green-700 text-center font-mono bg-green-50 py-1 rounded border border-green-200">
            🏆 MENANG ({m.homeScore}-{m.awayScore}): {m.winner.name}
          </div>
        )}
      </div>
    );
  }
};
