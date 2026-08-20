'use client';

import React, { useState } from 'react';
import { TournamentEngine } from '@/lib/tournamentEngine';
import { Team, LaneRole } from '@/types';
import { MLBB_HEROES } from '@/lib/data/heroes';
import { getPlayerAvatarUrl, getTeamLogoUrl, getHeroImageUrl } from '@/lib/imageAssets';
import { BarChart3, Users, Swords, Shield, Trophy, Filter, ArrowUpDown, Flame } from 'lucide-react';

interface StatisticsScreenProps {
  tournament: TournamentEngine;
  userTeam: Team;
}

type StatTab = 'teams' | 'players' | 'heroes' | 'hero_pools' | 'player_pools' | 'mvp_standings';

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ tournament, userTeam }) => {
  const [activeTab, setActiveTab] = useState<StatTab>('players');
  const [selectedLane, setSelectedLane] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');

  // Stats data
  const topKills = tournament.getTopKills(5);
  const topAssists = tournament.getTopAssists(5);
  const topKda = tournament.getTopAvgKda(5);
  const playerStatsList = tournament.getFilteredPlayerStats(selectedLane, selectedTeam);
  const teamStatsList = tournament.getTeamStatsList();
  const topHeroPicks = tournament.getTopHeroPicks(5);
  const topHeroBans = tournament.getTopHeroBans(5);
  const topHeroWinRates = tournament.getTopHeroWinRates(5);
  const heroStatsList = tournament.getHeroStatsList();
  const mvpCards = tournament.getMvpStandingsCards(8);
  const heroPoolsList = tournament.getPlayerHeroPools(selectedLane, selectedTeam);
  const playerPoolsList = tournament.getHeroPlayerPools(15);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 animate-fadeIn text-gray-900 pb-16">
      {/* 1. PAGE HEADER (Matching id-mpl.com/statistics) */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-mpl-title uppercase tracking-wider text-gray-900 font-black">
          STATISTIK
        </h1>

        {/* Sub-Navigation Tabs with Red Active Underline */}
        <div className="flex justify-center items-center gap-2 sm:gap-6 mt-4 border-b border-gray-200 overflow-x-auto pb-1">
          {[
            { id: 'teams', label: 'Teams' },
            { id: 'players', label: 'Players' },
            { id: 'heroes', label: 'Heroes' },
            { id: 'hero_pools', label: 'Hero Pools' },
            { id: 'player_pools', label: 'Player Pools' },
            { id: 'mvp_standings', label: 'MVP Standings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StatTab)}
              className={`px-3 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#680008] border-b-4 border-[#d32f2f] font-black'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty season state indicator */}
        {tournament.schedule.filter(m => m.completed).length === 0 && (
          <div className="mt-4 max-w-2xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl text-center font-medium">
            ℹ️ <b>Musim Regular Season MPL ID 2026 Belum Dimulai</b> — Seluruh data statistik (Pemain, Tim, Hero Meta) saat ini berawal dari 0 dan akan terakumulasi secara dinamis setiap kali pertandingan berlangsung!
          </div>
        )}
      </div>

      {/* 2. TAB: PLAYERS */}
      {activeTab === 'players' && (
        <div className="space-y-10">
          {/* TOP 5 KILLS */}
          <section>
            <h2 className="text-center text-xl md:text-2xl font-mpl-title uppercase tracking-wider text-gray-900 font-black mb-4">
              TOP 5 KILLS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {topKills.map(p => (
                <div key={p.id} className="flex flex-col items-center group">
                  <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden border border-gray-300 shadow-sm flex items-end justify-center p-2">
                    <img
                      src={getTeamLogoUrl(p.teamTag, p.teamColor)}
                      alt={p.teamTag}
                      className="absolute top-2 right-2 w-12 h-12 object-contain opacity-20 pointer-events-none"
                    />
                    <div className="absolute top-2 left-2 bg-[#d32f2f] text-white text-xs md:text-sm font-black px-2 py-0.5 rounded shadow font-mono">
                      {p.kills}
                    </div>
                    <img
                      src={getPlayerAvatarUrl(p.name, p.teamColor)}
                      alt={p.name}
                      className="w-24 h-24 md:w-28 md:h-28 object-contain z-10 drop-shadow-md"
                    />
                  </div>
                  <div className="w-full bg-black text-white text-center py-1.5 px-2 mt-1 rounded-md text-xs font-black uppercase tracking-wider truncate font-mono shadow">
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TOP 5 ASSISTS */}
          <section>
            <h2 className="text-center text-xl md:text-2xl font-mpl-title uppercase tracking-wider text-gray-900 font-black mb-4">
              TOP 5 ASSISTS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {topAssists.map(p => (
                <div key={p.id} className="flex flex-col items-center group">
                  <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden border border-gray-300 shadow-sm flex items-end justify-center p-2">
                    <img
                      src={getTeamLogoUrl(p.teamTag, p.teamColor)}
                      alt={p.teamTag}
                      className="absolute top-2 right-2 w-12 h-12 object-contain opacity-20 pointer-events-none"
                    />
                    <div className="absolute top-2 left-2 bg-[#d32f2f] text-white text-xs md:text-sm font-black px-2 py-0.5 rounded shadow font-mono">
                      {p.assists}
                    </div>
                    <img
                      src={getPlayerAvatarUrl(p.name, p.teamColor)}
                      alt={p.name}
                      className="w-24 h-24 md:w-28 md:h-28 object-contain z-10 drop-shadow-md"
                    />
                  </div>
                  <div className="w-full bg-black text-white text-center py-1.5 px-2 mt-1 rounded-md text-xs font-black uppercase tracking-wider truncate font-mono shadow">
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TOP 5 AVG KDA */}
          <section>
            <h2 className="text-center text-xl md:text-2xl font-mpl-title uppercase tracking-wider text-gray-900 font-black mb-4">
              TOP 5 AVG KDA
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {topKda.map(p => (
                <div key={p.id} className="flex flex-col items-center group">
                  <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden border border-gray-300 shadow-sm flex items-end justify-center p-2">
                    <img
                      src={getTeamLogoUrl(p.teamTag, p.teamColor)}
                      alt={p.teamTag}
                      className="absolute top-2 right-2 w-12 h-12 object-contain opacity-20 pointer-events-none"
                    />
                    <div className="absolute top-2 left-2 bg-[#d32f2f] text-white text-xs md:text-sm font-black px-2 py-0.5 rounded shadow font-mono">
                      {p.kdaRatio.toFixed(2)}
                    </div>
                    <img
                      src={getPlayerAvatarUrl(p.name, p.teamColor)}
                      alt={p.name}
                      className="w-24 h-24 md:w-28 md:h-28 object-contain z-10 drop-shadow-md"
                    />
                  </div>
                  <div className="w-full bg-black text-white text-center py-1.5 px-2 mt-1 rounded-md text-xs font-black uppercase tracking-wider truncate font-mono shadow">
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PLAYER STATISTICS TABLE */}
          <section className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="text-2xl md:text-3xl font-mpl-title uppercase text-gray-900 font-black">
                PLAYER STATISTICS
              </h2>

              <div className="flex items-center gap-3">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#680008]"
                >
                  <option value="ALL">ALL TEAM</option>
                  {tournament.teams.map(t => (
                    <option key={t.id} value={t.id}>{t.shortName}</option>
                  ))}
                </select>

                <select
                  value={selectedLane}
                  onChange={(e) => setSelectedLane(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#680008]"
                >
                  <option value="ALL">ALL LANES</option>
                  <option value="EXP">EXP</option>
                  <option value="JUNGLE">JUNGLE</option>
                  <option value="MID">MID</option>
                  <option value="GOLD">GOLD</option>
                  <option value="ROAM">ROAM</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white text-[10px] md:text-xs font-black uppercase tracking-wider font-mono">
                    <th className="py-3 px-3">PLAYER</th>
                    <th className="py-3 px-3 text-center">LANES</th>
                    <th className="py-3 px-3 text-center">TOTAL GAMES</th>
                    <th className="py-3 px-3 text-center">TOTAL KILLS</th>
                    <th className="py-3 px-3 text-center">AVG KILLS</th>
                    <th className="py-3 px-3 text-center">TOTAL DEATHS</th>
                    <th className="py-3 px-3 text-center">AVG DEATHS</th>
                    <th className="py-3 px-3 text-center">TOTAL ASSISTS</th>
                    <th className="py-3 px-3 text-center">AVG ASSISTS</th>
                    <th className="py-3 px-3 text-center">AVG KDA</th>
                    <th className="py-3 px-3 text-center">KILL PARTICIPATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs font-bold">
                  {playerStatsList.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={getTeamLogoUrl(p.teamTag, p.teamColor)}
                            alt={p.teamTag}
                            className="w-6 h-6 object-contain shrink-0"
                          />
                          <span className="font-extrabold uppercase font-mono text-gray-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-700">{p.role.toUpperCase()}</td>
                      <td className="py-3 px-3 text-center font-mono">{p.gamesPlayed}</td>
                      <td className="py-3 px-3 text-center font-mono">{p.kills}</td>
                      <td className="py-3 px-3 text-center font-mono">{p.avgKills}</td>
                      <td className="py-3 px-3 text-center font-mono">{p.deaths}</td>
                      <td className="py-3 px-3 text-center font-mono">{p.avgDeaths}</td>
                      <td className="py-3 px-3 text-center font-mono">{p.assists}</td>
                      <td className="py-3 px-3 text-center font-mono">{p.avgAssists}</td>
                      <td className="py-3 px-3 text-center font-mono text-[#d32f2f] font-black">{p.avgKda}</td>
                      <td className="py-3 px-3 text-center font-mono">{p.killParticipation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 3. TAB: TEAMS */}
      {activeTab === 'teams' && (
        <section className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-mpl-title uppercase tracking-wider text-gray-900 font-black">
              TEAM STATISTICS
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-[10px] md:text-xs font-black uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">TEAM</th>
                  <th className="py-3 px-3 text-center">KILLS</th>
                  <th className="py-3 px-3 text-center">DEATHS</th>
                  <th className="py-3 px-3 text-center">ASSISTS</th>
                  <th className="py-3 px-3 text-center">GOLD</th>
                  <th className="py-3 px-3 text-center">DAMAGE</th>
                  <th className="py-3 px-3 text-center">LORD</th>
                  <th className="py-3 px-3 text-center">TORTOISE</th>
                  <th className="py-3 px-3 text-center">TOWER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs md:text-sm font-bold">
                {teamStatsList.map(t => (
                  <tr key={t.teamId} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getTeamLogoUrl(t.tag, t.themeColor)}
                          alt={t.tag}
                          className="w-7 h-7 object-contain shrink-0"
                        />
                        <span className="font-extrabold uppercase text-gray-900">{t.teamName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black">{t.kills}</td>
                    <td className="py-3 px-3 text-center font-mono">{t.deaths}</td>
                    <td className="py-3 px-3 text-center font-mono">{t.assists}</td>
                    <td className="py-3 px-3 text-center font-mono text-[#d32f2f]">{t.gold.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center font-mono">{t.damage.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center font-mono">{t.lord}</td>
                    <td className="py-3 px-3 text-center font-mono">{t.tortoise}</td>
                    <td className="py-3 px-3 text-center font-mono">{t.tower}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4. TAB: HEROES */}
      {activeTab === 'heroes' && (
        <div className="space-y-10">
          {/* TOP 5 PICK */}
          <section>
            <h2 className="text-center text-xl md:text-2xl font-mpl-title uppercase tracking-wider text-gray-900 font-black mb-4">
              TOP 5 PICK
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {topHeroPicks.map(h => (
                <div key={h.heroId} className="flex flex-col items-center">
                  <div className="relative w-full aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden border-2 border-transparent border-l-4 border-l-[#d32f2f] shadow-md flex items-end">
                    <img
                      src={getHeroImageUrl(h.heroId)}
                      alt={h.heroName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-base md:text-lg font-black px-2 py-0.5 rounded font-mono">
                      {h.picks}
                    </div>
                  </div>
                  <div className="w-full bg-black text-white text-center py-1.5 px-2 mt-1 rounded-md text-xs font-black uppercase tracking-wider truncate font-mono shadow">
                    {h.heroName}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TOP 5 BAN */}
          <section>
            <h2 className="text-center text-xl md:text-2xl font-mpl-title uppercase tracking-wider text-gray-900 font-black mb-4">
              TOP 5 BAN
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {topHeroBans.map(h => (
                <div key={h.heroId} className="flex flex-col items-center">
                  <div className="relative w-full aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden border-2 border-transparent border-l-4 border-l-[#d32f2f] shadow-md flex items-end">
                    <img
                      src={getHeroImageUrl(h.heroId)}
                      alt={h.heroName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-base md:text-lg font-black px-2 py-0.5 rounded font-mono">
                      {h.bans}
                    </div>
                  </div>
                  <div className="w-full bg-black text-white text-center py-1.5 px-2 mt-1 rounded-md text-xs font-black uppercase tracking-wider truncate font-mono shadow">
                    {h.heroName}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TOP 5 WIN RATE (Matching Screenshot 2) */}
          <section>
            <h2 className="text-center text-xl md:text-2xl font-mpl-title uppercase tracking-wider text-gray-900 font-black mb-4">
              TOP 5 WIN RATE
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {topHeroWinRates.map(h => (
                <div key={h.heroId} className="flex flex-col items-center">
                  <div className="relative w-full aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden border-2 border-transparent border-l-4 border-l-[#d32f2f] shadow-md flex items-end">
                    <img
                      src={getHeroImageUrl(h.heroId)}
                      alt={h.heroName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-base md:text-lg font-black px-2 py-0.5 rounded font-mono">
                      {h.winRate}%
                    </div>
                  </div>
                  <div className="w-full bg-black text-white text-center py-1.5 px-2 mt-1 rounded-md text-xs font-black uppercase tracking-wider truncate font-mono shadow">
                    {h.heroName}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 italic mt-3 font-medium">
              *TOP 5, minimum 5 games
            </p>
          </section>

          {/* HERO STATISTICS TABLE (Matching Screenshots 1 & 2) */}
          <section className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-mpl-title uppercase tracking-wider text-gray-900 font-black">
                HERO STATISTICS
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white text-[10px] md:text-xs font-black uppercase tracking-wider font-mono">
                    <th className="py-3 px-4">HERO</th>
                    <th className="py-3 px-3 text-center">PICK</th>
                    <th className="py-3 px-3 text-center">BAN</th>
                    <th className="py-3 px-3 text-center">WIN</th>
                    <th className="py-3 px-3 text-center">WIN RATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs md:text-sm font-bold">
                  {heroStatsList.map(h => (
                    <tr key={h.heroId} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-300 bg-gray-900 shrink-0">
                            <img
                              src={getHeroImageUrl(h.heroId)}
                              alt={h.heroName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-extrabold uppercase font-mono text-gray-900">{h.heroName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black">{h.picks}</td>
                      <td className="py-3 px-3 text-center font-mono">{h.bans}</td>
                      <td className="py-3 px-3 text-center font-mono">{h.wins}</td>
                      <td className="py-3 px-3 text-center font-mono font-black text-[#d32f2f]">
                        {h.winRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 5. TAB: HERO POOLS (Matching Screenshots 1 & 2) */}
      {activeTab === 'hero_pools' && (
        <section className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-3xl md:text-4xl font-mpl-title uppercase tracking-wider text-gray-900 font-black">
              HERO POOLS
            </h2>

            <div className="flex items-center gap-3">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#680008]"
              >
                <option value="ALL">ALL TEAM</option>
                {tournament.teams.map(t => (
                  <option key={t.id} value={t.id}>{t.shortName}</option>
                ))}
              </select>

              <select
                value={selectedLane}
                onChange={(e) => setSelectedLane(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#680008]"
              >
                <option value="ALL">ALL LANES</option>
                <option value="EXP">EXP</option>
                <option value="JUNGLE">JUNGLE</option>
                <option value="MID">MID</option>
                <option value="GOLD">GOLD</option>
                <option value="ROAM">ROAM</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-[10px] md:text-xs font-black uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 w-48">PLAYER</th>
                  <th className="py-3 px-3 text-center w-24">LANES</th>
                  <th className="py-3 px-3 text-center w-20">TOTAL</th>
                  <th className="py-3 px-4">HEROES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs md:text-sm font-bold">
                {heroPoolsList.map(item => (
                  <tr key={item.player.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getTeamLogoUrl(item.player.teamTag, item.player.teamColor)}
                          alt={item.player.teamTag}
                          className="w-6 h-6 object-contain shrink-0"
                        />
                        <span className="font-extrabold uppercase font-mono text-gray-900">
                          {item.player.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-gray-700">
                      {item.lane.toUpperCase()}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-black text-gray-900">
                      {item.totalUniqueHeroes}
                    </td>

                    {/* Heroes list with Top-Left Pick Badge and Bottom-Left Winrate Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {item.heroes.map(h => (
                          <div key={h.heroId} className="relative group shrink-0">
                            {/* Hero Avatar */}
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-300 bg-gray-900 shadow-sm">
                              <img
                                src={getHeroImageUrl(h.heroId)}
                                alt={h.heroName}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Top-Left Picks Count Badge */}
                            <div className="absolute -top-1.5 -left-1.5 bg-[#8b0000] text-white text-[8px] font-black px-1 rounded-sm font-mono shadow">
                              {h.picks}
                            </div>

                            {/* Bottom-Left Winrate Badge */}
                            <div className="absolute -bottom-1.5 -left-1.5 bg-[#d32f2f] text-white text-[8px] font-black px-1 rounded-sm font-mono shadow leading-tight">
                              {h.winRate}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 6. TAB: PLAYER POOLS (Matching Screenshot 3) */}
      {activeTab === 'player_pools' && (
        <section className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-mpl-title uppercase tracking-wider text-gray-900 font-black">
              PLAYER POOLS
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-[10px] md:text-xs font-black uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 w-48">HERO</th>
                  <th className="py-3 px-3 text-center w-24">TOTAL</th>
                  <th className="py-3 px-4">PLAYERS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs md:text-sm font-bold">
                {playerPoolsList.map(h => (
                  <tr key={h.heroId} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-300 bg-gray-900 shrink-0">
                          <img
                            src={getHeroImageUrl(h.heroId)}
                            alt={h.heroName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-extrabold uppercase font-mono text-gray-900">
                          {h.heroName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-black text-gray-900">
                      {h.totalPlayers}
                    </td>

                    {/* Players list with Top-Left Pick Badge and Bottom-Left Winrate Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        {h.players.map(({ player, picks, winRate }) => (
                          <div key={player.id} className="relative group shrink-0 text-center">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 bg-gray-100 shadow-sm mx-auto">
                              <img
                                src={getPlayerAvatarUrl(player.name, player.teamColor)}
                                alt={player.name}
                                className="w-full h-full object-contain"
                              />
                            </div>

                            {/* Top-Left Picks Count Badge */}
                            <div className="absolute -top-1.5 -left-1.5 bg-[#8b0000] text-white text-[8px] font-black px-1 rounded-sm font-mono shadow">
                              {picks}
                            </div>

                            {/* Bottom-Left Winrate Badge */}
                            <div className="absolute -bottom-1.5 -left-1.5 bg-[#d32f2f] text-white text-[8px] font-black px-1 rounded-sm font-mono shadow leading-tight">
                              {winRate}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 7. TAB: MVP STANDINGS (Matching Screenshots 4 & 5) */}
      {activeTab === 'mvp_standings' && (
        <div className="space-y-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-5xl font-mpl-title uppercase tracking-wider text-gray-900 font-black">
              MVP STANDINGS
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1 font-mono">
              MPL INDONESIA SEASON 2026 • REGULAR SEASON MVP RACE
            </p>
          </div>

          {/* Official MVP Race Cards Grid (Matching Screenshots 4 & 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {mvpCards.map(({ rank, player, pts }) => (
              <div
                key={player.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between relative group hover:shadow-md transition"
              >
                {/* Upper Area with Giant Watermark Rank & Team Logo */}
                <div className="relative h-48 bg-gradient-to-b from-gray-50 to-gray-200 flex items-end justify-center p-3 overflow-hidden">
                  {/* Giant #1, #2, #3 Watermark on Top Left */}
                  <span className="absolute top-1 left-3 text-5xl md:text-6xl font-mpl-title font-black text-gray-400/40 select-none">
                    #{rank}
                  </span>

                  {/* Team Logo Background Watermark */}
                  <img
                    src={getTeamLogoUrl(player.teamTag, player.teamColor)}
                    alt={player.teamTag}
                    className="absolute top-2 right-2 w-20 h-20 object-contain opacity-15 pointer-events-none"
                  />

                  {/* Red PTS Badge */}
                  <div className="absolute bottom-3 left-3 bg-[#d32f2f] text-white text-xs md:text-sm font-black px-2.5 py-1 rounded shadow-md font-mono z-20">
                    {pts} PTS
                  </div>

                  {/* Pro Player Avatar in Jersey */}
                  <img
                    src={getPlayerAvatarUrl(player.name, player.teamColor)}
                    alt={player.name}
                    className="h-36 w-auto object-contain z-10 drop-shadow-lg"
                  />
                </div>

                {/* Bottom Slanted Black Bar with Team Tag & Player Name */}
                <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between shadow-inner">
                  <span className="text-xs md:text-sm font-black uppercase tracking-wider font-mono truncate">
                    {player.teamTag} {player.name}
                  </span>
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};
