'use client';

import React, { useState } from 'react';
import { Team } from '@/types';
import { TournamentEngine } from '@/lib/tournamentEngine';
import { globalRateLimiter } from '@/lib/security';
import { getPlayerAvatarUrl, getTeamLogoUrl } from '@/lib/imageAssets';
import { trendingEngine } from '@/lib/trendingEngine';
import { Swords, Users, Trophy, ChevronRight, ChevronLeft, Play, Star, Calendar, Zap, Shield, Sparkles, Newspaper, Flame, MessageSquare, ThumbsUp } from 'lucide-react';

interface DashboardScreenProps {
  userTeam: Team;
  coachName: string;
  tournament: TournamentEngine;
  onEnterDraft: (homeTeam: Team, awayTeam: Team, isUserHome: boolean, matchInfo: any) => void;
  onAdvanceWeek: () => void;
  onGoPlayoffs: () => void;
  onGoAwards: () => void;
  onGoNews?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userTeam,
  coachName,
  tournament,
  onEnterDraft,
  onAdvanceWeek,
  onGoPlayoffs,
  onGoAwards,
  onGoNews
}) => {
  const [tickerWeek, setTickerWeek] = useState<number>(tournament.currentWeek);

  React.useEffect(() => {
    setTickerWeek(tournament.currentWeek);
  }, [tournament.currentWeek]);

  const isPlayoffs = tournament.stage === 'playoffs';
  const isCompleted = tournament.stage === 'completed';
  const nextMatch = tournament.getUserNextMatch();
  const currentWeekMatches = tournament.schedule.filter(m => m.week === tickerWeek);

  const handleEnterMatch = (match: any) => {
    if (!globalRateLimiter.isAllowed('enter_draft', 500)) return;
    const homeTeam = tournament.teams.find(t => t.id === match.homeTeamId)!;
    const awayTeam = tournament.teams.find(t => t.id === match.awayTeamId)!;
    const isUserHome = homeTeam.id === userTeam.id;
    onEnterDraft(homeTeam, awayTeam, isUserHome, match);
  };

  const handleSimulateWeek = () => {
    if (!globalRateLimiter.isAllowed('advance_week', 500)) return;
    onAdvanceWeek();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-12 animate-fadeIn">
      {/* 1. TOP HORIZONTAL MATCH TICKER / CAROUSEL (Matching id-mpl.com) */}
      <section className="bg-white border-b border-gray-200 shadow-sm py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          {/* Week Label & Navigation */}
          <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-gray-200">
            <button
              onClick={() => setTickerWeek(w => Math.max(1, w - 1))}
              className="w-7 h-7 rounded-full bg-[#680008] text-white flex items-center justify-center hover:bg-[#82000C] transition shadow"
              title="Pekan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-[10px] font-black text-[#680008] uppercase tracking-wider block font-mono">
                WEEK {tickerWeek}
              </span>
              <span className="text-[9px] text-gray-500 font-bold block">
                {tickerWeek === tournament.currentWeek ? 'LIVE PEKAN INI' : `JADWAL W${tickerWeek}`}
              </span>
            </div>
            <button
              onClick={() => setTickerWeek(w => Math.min(tournament.totalWeeks, w + 1))}
              className="w-7 h-7 rounded-full bg-[#680008] text-white flex items-center justify-center hover:bg-[#82000C] transition shadow"
              title="Pekan Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Matchday Cards Carousel */}
          <div className="flex items-center gap-3 overflow-x-auto py-1">
            {currentWeekMatches.map(m => {
              const home = tournament.teams.find(t => t.id === m.homeTeamId);
              const away = tournament.teams.find(t => t.id === m.awayTeamId);
              if (!home || !away) return null;

              const isUserMatch = home.id === userTeam.id || away.id === userTeam.id;

              return (
                <div
                  key={m.id}
                  className={`shrink-0 w-44 p-2 rounded-lg bg-white border relative transition shadow-sm ${
                    m.completed
                      ? 'border-gray-200 opacity-75'
                      : isUserMatch
                      ? 'border-[#d32f2f] ring-2 ring-red-500/20'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {/* Top Teams Row with Official Team Logos */}
                  <div className="flex items-center justify-between gap-2 text-center mb-1.5 px-1">
                    <div className="flex flex-col items-center w-14">
                      <img
                        src={getTeamLogoUrl(home.tag, home.themeColor)}
                        alt={home.tag}
                        className="w-8 h-8 object-contain mb-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${home.tag}`;
                        }}
                      />
                      <span className="text-[10px] font-extrabold text-gray-800 truncate w-full">{home.tag}</span>
                    </div>

                    <span className="text-xs font-black text-gray-400 font-mono">VS</span>

                    <div className="flex flex-col items-center w-14">
                      <img
                        src={getTeamLogoUrl(away.tag, away.themeColor)}
                        alt={away.tag}
                        className="w-8 h-8 object-contain mb-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${away.tag}`;
                        }}
                      />
                      <span className="text-[10px] font-extrabold text-gray-800 truncate w-full">{away.tag}</span>
                    </div>
                  </div>

                  {/* Match Date & Action */}
                  <div className="text-center pt-1 border-t border-gray-100">
                    <div className="text-[9px] text-gray-500 font-mono mb-1">
                      {m.completed && m.result ? `SKOR: ${m.result.homeScore} - ${m.result.awayScore}` : `21 Agt • 15:00 WIB`}
                    </div>

                    {m.completed ? (
                      <span className="block text-[9px] font-black py-0.5 px-1.5 rounded bg-gray-100 text-gray-600 font-mono">
                        SELESAI
                      </span>
                    ) : isUserMatch && !isPlayoffs ? (
                      <button
                        onClick={() => handleEnterMatch(m)}
                        className="w-full py-1 bg-[#680008] hover:bg-[#82000C] text-white text-[9px] font-black rounded uppercase tracking-wider transition shadow"
                      >
                        🔥 MAINKAN (10-BAN)
                      </button>
                    ) : (
                      <span className="block text-[9px] font-black py-0.5 px-1.5 rounded bg-gradient-to-r from-red-800 to-red-950 text-white font-mono shadow-sm">
                        🎟️ BELI TIKET
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MAIN BODY SECTION */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        {/* Next Match & Quick Control Banner */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <img
                src={getTeamLogoUrl(userTeam.tag, userTeam.themeColor)}
                alt={userTeam.tag}
                className="w-11 h-11 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${userTeam.tag}`;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">HEAD COACH:</span>
                <span className="text-sm font-black text-gray-900">{coachName}</span>
                <span className="text-[10px] bg-red-100 text-[#d32f2f] px-2 py-0.2 rounded font-extrabold uppercase">
                  {userTeam.name}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium mt-0.5">
                Target Musim: Lolos 6 Besar Playoff & Raih Gelar Juara MPL ID 2026!
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {!isPlayoffs && !isCompleted && (
              <button
                onClick={handleSimulateWeek}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black border border-gray-300 transition flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-[#680008]" /> Simulasikan Pekan {tournament.currentWeek}
              </button>
            )}

            {isPlayoffs && (
              <button
                onClick={onGoPlayoffs}
                className="px-5 py-2 rounded-lg bg-[#680008] hover:bg-[#82000C] text-white text-xs font-black shadow-lg flex items-center gap-1.5 transition animate-pulse"
              >
                <Trophy className="w-3.5 h-3.5 text-mpl-gold" /> Masuk Babak Playoff
              </button>
            )}

            {onGoNews && (
              <button
                onClick={onGoNews}
                className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-[#680008] text-xs font-black border border-red-200 shadow-sm transition flex items-center gap-1.5"
              >
                <Newspaper className="w-3.5 h-3.5 text-[#680008]" /> 📰 Media Berita
              </button>
            )}

            <button
              onClick={onGoAwards}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-black shadow transition flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-black" /> Malam Penghargaan
            </button>
          </div>
        </div>

        {/* 3. PERINGKAT / REGULAR SEASON STANDINGS TABLE (Exact Replica of id-mpl.com) */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 mb-8">
          {/* Header Title Section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-mpl-title uppercase tracking-wider text-gray-900 font-black">
              PERINGKAT
            </h1>
            <div className="flex justify-center mt-2">
              <div className="inline-block border-b-4 border-[#d32f2f] pb-1 px-4 text-xs md:text-sm font-extrabold uppercase tracking-wider text-gray-900 font-mono">
                Regular Season
              </div>
            </div>
          </div>

          {/* Standings Table with Official Team Logos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-[11px] md:text-xs font-black uppercase tracking-wider font-mono">
                  <th className="py-3 px-3 w-10 text-center">RANK</th>
                  <th className="py-3 px-4">TEAM</th>
                  <th className="py-3 px-4 text-center text-[#e74c3c]">MATCH POINT</th>
                  <th className="py-3 px-4 text-center text-white">MATCH W-L</th>
                  <th className="py-3 px-4 text-center text-[#e74c3c]">NET GAME WIN</th>
                  <th className="py-3 px-4 text-center text-white">GAME W-L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs md:text-sm font-bold">
                {tournament.getStandingsSorted().map((s, idx) => {
                  const rank = idx + 1;
                  const isUser = s.teamId === userTeam.id;

                  return (
                    <tr
                      key={s.teamId}
                      className={`hover:bg-gray-50 transition ${
                        isUser ? 'bg-blue-50/70 font-black ring-1 ring-blue-300' : ''
                      }`}
                    >
                      {/* Rank Number (Solid black box matching Screenshot 2) */}
                      <td className="py-3 px-3 text-center">
                        <div className="w-6 h-7 bg-black text-white flex items-center justify-center font-black font-mono text-sm shadow mx-auto">
                          {rank}
                        </div>
                      </td>

                      {/* Team Logo & Full Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getTeamLogoUrl(s.shortName, s.themeColor)}
                            alt={s.shortName}
                            className="w-7 h-7 object-contain shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${s.shortName}`;
                            }}
                          />
                          <div>
                            <span className="font-extrabold text-gray-900 uppercase tracking-wide">
                              {s.teamName}
                            </span>
                            {isUser && (
                              <span className="ml-2 text-[10px] bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded uppercase">
                                Tim Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Match Point (Red) */}
                      <td className="py-3 px-4 text-center text-[#d32f2f] font-black font-mono text-sm md:text-base">
                        {s.points}
                      </td>

                      {/* Match W-L (Black) */}
                      <td className="py-3 px-4 text-center font-mono text-gray-800 font-bold">
                        {s.matchesWon} - {s.matchesLost}
                      </td>

                      {/* Net Game Win (Red) */}
                      <td className="py-3 px-4 text-center text-[#d32f2f] font-black font-mono text-sm md:text-base">
                        {s.gameDiff > 0 ? `+${s.gameDiff}` : s.gameDiff}
                      </td>

                      {/* Game W-L (Black) */}
                      <td className="py-3 px-4 text-center font-mono text-gray-800 font-bold">
                        {s.gamesWon} - {s.gamesLost}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Standings Legend */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 font-medium">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#680008]"></span> Peringkat 1-2 (Upper Bracket Playoff)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-black"></span> Peringkat 3-6 (Play-in / Lower Playoff)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gray-400"></span> Peringkat 7-9 (Eliminasi)
              </span>
            </div>
            <div className="font-mono font-bold text-[#680008]">
              Pekan {tournament.currentWeek} dari {tournament.totalWeeks}
            </div>
          </div>
        </section>

        {/* 4. ROSTER & NEXT MATCH MANAGEMENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Next Match Card with Dynamic Random Difficulty */}
          <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Swords className="w-4 h-4 text-[#680008]" /> Pertandingan Head Coach Berikutnya
              </h3>

              {nextMatch ? (
                <div>
                  {(() => {
                    const homeTeam = tournament.teams.find(t => t.id === (nextMatch as any).homeTeamId)!;
                    const awayTeam = tournament.teams.find(t => t.id === (nextMatch as any).awayTeamId)!;
                    const isUserHome = homeTeam.id === userTeam.id;
                    const difficulty = (nextMatch as any).difficultyCondition;

                    return (
                      <div>
                        {/* Difficulty Condition Box */}
                        {difficulty && (
                          <div className="bg-gray-900 text-white p-3 rounded-lg mb-4 shadow flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{difficulty.icon}</span>
                              <div>
                                <div className="text-[11px] font-black uppercase tracking-wide">
                                  Kondisi Lawan: <span style={{ color: difficulty.badgeColor }}>{difficulty.name}</span>
                                </div>
                                <div className="text-[9px] text-gray-300 leading-tight">
                                  {difficulty.description}
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-black/60 text-mpl-gold font-mono whitespace-nowrap border border-white/10">
                              {difficulty.formBonusText}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-around items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center p-1.5 shadow mb-1 bg-white border border-gray-200 overflow-hidden">
                              <img
                                src={getTeamLogoUrl(homeTeam.tag, homeTeam.themeColor)}
                                alt={homeTeam.tag}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <span className="font-black text-xs text-gray-800">{homeTeam.tag}</span>
                            </div>
                            <div className="text-xs font-bold text-gray-900">{homeTeam.shortName}</div>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${isUserHome ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                              {isUserHome ? 'BLUE SIDE' : 'Lawan'}
                            </span>
                          </div>

                          <div className="text-center">
                            <span className="text-xl font-black text-[#680008] font-mono block">VS</span>
                            <span className="text-[9px] text-gray-500 font-mono">BO1 • 10-Ban</span>
                          </div>

                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center p-1.5 shadow mb-1 bg-white border border-gray-200 overflow-hidden">
                              <img
                                src={getTeamLogoUrl(awayTeam.tag, awayTeam.themeColor)}
                                alt={awayTeam.tag}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <span className="font-black text-xs text-gray-800">{awayTeam.tag}</span>
                            </div>
                            <div className="text-xs font-bold text-gray-900">{awayTeam.shortName}</div>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${!isUserHome ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                              {!isUserHome ? 'RED SIDE' : 'Lawan'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleEnterMatch(nextMatch)}
                          className="mt-4 w-full py-3 bg-[#680008] hover:bg-[#82000C] text-white text-xs font-black rounded-lg shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider transition"
                        >
                          <Play className="w-4 h-4" /> Masuk Panggung Draft Pick (10-Ban Rule)
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
                  Tidak ada pertandingan sisa di fase Regular Season.
                </div>
              )}
            </div>
          </div>

          {/* Roster Cards with Player Esports Avatars */}
          <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-[#680008]" /> Roster Pro Player & Hero Signature
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userTeam.roster.map(p => {
                const stat = tournament.playerStats[p.id];
                const kills = stat ? stat.kills : 0;
                const deaths = stat ? stat.deaths : 0;
                const assists = stat ? stat.assists : 0;
                const mvpCount = stat ? stat.mvpCount : 0;

                return (
                  <div key={p.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col justify-between hover:border-gray-400 transition">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-gray-200 text-gray-800 uppercase font-mono">
                          {p.role} LANE
                        </span>
                        <span className="text-xs font-black text-[#680008] font-mono">
                          {p.rating} OVR
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <img
                          src={getPlayerAvatarUrl(p.name, userTeam.themeColor)}
                          alt={p.name}
                          className="w-10 h-10 rounded-full border border-gray-300 shadow-sm bg-white shrink-0"
                          loading="lazy"
                        />
                        <div className="overflow-hidden">
                          <div className="text-sm font-extrabold text-gray-900 truncate">{p.name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{p.realName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-200">
                      <div className="text-[10px] text-gray-700 font-bold flex justify-between font-mono">
                        <span>KDA: {kills}/{deaths}/{assists}</span>
                        <span className="text-[#680008]">MVP: {mvpCount}x</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.signature.slice(0, 3).map(sig => (
                          <span key={sig} className="text-[9px] bg-red-50 text-[#680008] px-1.5 py-0.2 rounded font-semibold border border-red-200">
                            {sig}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. NETIZEN TRENDING TOPICS & HASHTAGS (Feature 57) */}
        <section className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase font-mpl-title tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" /> TRENDING TOPICS ESPORTS INDONESIA (TWITTER/X & TIKTOK)
              </h3>
            </div>
            {onGoNews && (
              <button
                onClick={onGoNews}
                className="text-[10px] font-mono font-bold text-[#680008] hover:underline flex items-center gap-0.5"
              >
                Lihat Semua Berita <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trendingEngine.generateTrendingTopics(userTeam, coachName, tournament).map(topic => (
              <div
                key={topic.id}
                className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 font-bold mb-1">
                    <span>{topic.category}</span>
                    <span className="text-gray-600">#{topic.rank} Trending</span>
                  </div>

                  <h4 className="text-sm font-black text-gray-900 font-mono tracking-tight text-[#680008]">
                    {topic.tag}
                  </h4>
                  <div className="text-[10px] text-gray-500 font-mono mb-2">{topic.tweetCountStr}</div>

                  <p className="text-xs text-gray-700 leading-snug line-clamp-2 mb-3">
                    {topic.headline}
                  </p>
                </div>

                {/* Sample Top Tweet */}
                <div className="pt-2 border-t border-gray-200/70 text-[11px] text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono mb-0.5">
                    <span className="font-bold text-gray-800">{topic.topTweet.user}</span>
                    <span>❤️ {topic.topTweet.likes}</span>
                  </div>
                  <div className="italic line-clamp-2">"{topic.topTweet.text}"</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
