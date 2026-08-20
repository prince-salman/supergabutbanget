'use client';

import React, { useState } from 'react';
import { TournamentEngine } from '@/lib/tournamentEngine';
import { Team, ScheduleMatch } from '@/types';
import { getTeamLogoUrl } from '@/lib/imageAssets';
import { Play, Eye, RotateCcw, Filter, Calendar } from 'lucide-react';

interface ScheduleScreenProps {
  tournament: TournamentEngine;
  userTeam: Team;
  onEnterDraft: (homeTeam: Team, awayTeam: Team, isUserHome: boolean, matchInfo: any) => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  tournament,
  userTeam,
  onEnterDraft
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(tournament.currentWeek);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');

  const weeks = Array.from({ length: 9 }, (_, i) => i + 1);
  const weekMatches = tournament.schedule.filter(m => m.week === selectedWeek);

  // Group matches into 3 official matchdays (Jumat, Sabtu, Minggu)
  const matchesByDay = {
    friday: weekMatches.slice(0, 2),
    saturday: weekMatches.slice(2, 5),
    sunday: weekMatches.slice(5, 8)
  };

  const getDayDate = (dayName: 'friday' | 'saturday' | 'sunday', week: number) => {
    const baseDay = 13 + (week - 1) * 7;
    const offset = dayName === 'friday' ? 1 : dayName === 'saturday' ? 2 : 3;
    const dayDate = baseDay + offset;
    const month = dayDate > 31 ? 'September' : 'Agustus';
    const finalDate = dayDate > 31 ? dayDate - 31 : dayDate;

    if (dayName === 'friday') return `Jumat, ${finalDate} ${month} 2026`;
    if (dayName === 'saturday') return `Sabtu, ${finalDate} ${month} 2026`;
    return `Minggu, ${finalDate} ${month} 2026`;
  };

  const renderMatchRow = (m: ScheduleMatch, timeStr: string) => {
    const home = tournament.teams.find(t => t.id === m.homeTeamId);
    const away = tournament.teams.find(t => t.id === m.awayTeamId);
    if (!home || !away) return null;

    if (selectedTeamFilter !== 'ALL' && home.id !== selectedTeamFilter && away.id !== selectedTeamFilter) {
      return null;
    }

    const isUserMatch = home.id === userTeam.id || away.id === userTeam.id;
    const isCompleted = m.completed && m.result;

    return (
      <div
        key={m.id}
        className={`flex items-center justify-between p-3.5 rounded-xl border bg-white transition shadow-sm ${
          isUserMatch && !isCompleted
            ? 'border-[#d32f2f] ring-2 ring-red-500/20 bg-red-50/20'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Home Team */}
        <div className="flex items-center gap-3 w-[38%]">
          <img
            src={getTeamLogoUrl(home.tag, home.themeColor)}
            alt={home.tag}
            className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-extrabold uppercase text-gray-900 truncate">
              {home.tag}
            </span>
            <span className="text-[10px] text-gray-500 hidden sm:block truncate max-w-[110px]">
              {home.shortName}
            </span>
          </div>
        </div>

        {/* Score & Middle Action */}
        <div className="flex flex-col items-center justify-center shrink-0 w-[24%]">
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <span className={`text-xl md:text-2xl font-black font-mono ${
                m.result!.winnerId === home.id ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {m.result!.homeScore}
              </span>
              <span className="text-xs text-gray-300 font-bold">-</span>
              <span className={`text-xl md:text-2xl font-black font-mono ${
                m.result!.winnerId === away.id ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {m.result!.awayScore}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-xs font-mono font-bold text-gray-800 block">
                {timeStr}
              </span>
            </div>
          )}

          {/* Buttons: Details & Replay matching Screenshot 4 */}
          <div className="flex items-center gap-1 mt-1.5">
            {isUserMatch && !isCompleted ? (
              <button
                onClick={() => onEnterDraft(home, away, home.id === userTeam.id, m)}
                className="px-2.5 py-0.5 bg-[#680008] hover:bg-[#82000C] text-white text-[9px] font-black rounded uppercase tracking-wider transition shadow flex items-center gap-1"
              >
                <Play className="w-2.5 h-2.5 fill-current" /> MAINKAN
              </button>
            ) : (
              <>
                <button className="bg-black hover:bg-gray-800 text-white text-[9px] font-bold px-2 py-0.5 rounded transition">
                  DETAILS
                </button>
                <button className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-bold px-2 py-0.5 rounded transition">
                  REPLAY
                </button>
              </>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-end gap-3 w-[38%] text-right">
          <div className="flex flex-col items-end">
            <span className="text-xs md:text-sm font-extrabold uppercase text-gray-900 truncate">
              {away.tag}
            </span>
            <span className="text-[10px] text-gray-500 hidden sm:block truncate max-w-[110px]">
              {away.shortName}
            </span>
          </div>
          <img
            src={getTeamLogoUrl(away.tag, away.themeColor)}
            alt={away.tag}
            className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0"
          />
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 animate-fadeIn text-gray-900 pb-16">
      {/* 1. PAGE HEADER (Matching Screenshot 4) */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-mpl-title uppercase tracking-wider text-gray-900 font-black">
          JADWAL
        </h1>

        {/* Regular Season Sub-Header */}
        <div className="inline-block border-b-2 border-[#d32f2f] pb-1 mt-2">
          <span className="text-sm md:text-base font-extrabold uppercase tracking-wide text-gray-900">
            Regular Season
          </span>
        </div>
      </div>

      {/* 2. FILTER DROPDOWN */}
      <div className="flex justify-end items-center max-w-6xl mx-auto mb-4 px-2">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm text-xs font-bold">
          <Filter className="w-3.5 h-3.5 text-[#d32f2f]" />
          <span className="text-gray-500">FILTER:</span>
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="bg-transparent font-extrabold text-gray-900 focus:outline-none cursor-pointer"
          >
            <option value="ALL">SEMUA</option>
            {tournament.teams.map(t => (
              <option key={t.id} value={t.id}>{t.shortName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. WEEK TIMELINE (Matching Screenshot 4) */}
      <div className="max-w-6xl mx-auto mb-10 overflow-x-auto pb-4">
        <div className="relative flex items-center justify-between min-w-[720px] px-8">
          {/* Connecting Timeline Line */}
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-300 -translate-y-1/2 z-0" />

          {weeks.map(w => {
            const isSelected = selectedWeek === w;
            const isLive = tournament.currentWeek === w;

            return (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
              >
                <span className={`text-xs md:text-sm font-extrabold mb-1.5 transition ${
                  isSelected ? 'text-[#d32f2f] font-black' : 'text-gray-700 group-hover:text-black'
                }`}>
                  Week {w}
                </span>

                {/* Circle Dot Indicator */}
                <div className={`w-4 h-4 rounded-full transition border-2 ${
                  isSelected
                    ? 'bg-[#d32f2f] border-red-200 ring-4 ring-red-500/20 scale-125'
                    : isLive
                    ? 'bg-[#680008] border-white'
                    : 'bg-black border-white group-hover:scale-110'
                }`} />

                {isLive && (
                  <span className="absolute -bottom-5 text-[8px] bg-red-600 text-white px-1.5 rounded font-mono font-bold uppercase">
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 3 MATCHDAY COLUMNS (Jumat, Sabtu, Minggu) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* JUMAT */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-200 shadow-sm flex flex-col">
          <div className="text-center border-b border-gray-200 pb-3 mb-4">
            <h3 className="font-extrabold text-sm md:text-base text-gray-900">
              {getDayDate('friday', selectedWeek)}
            </h3>
          </div>

          <div className="space-y-3 flex-1">
            {matchesByDay.friday.length > 0 ? (
              matchesByDay.friday.map((m, idx) =>
                renderMatchRow(m, idx === 0 ? '15:00' : '18:00')
              )
            ) : (
              <div className="text-center text-xs text-gray-400 py-8">
                Tidak ada pertandingan di hari ini
              </div>
            )}
          </div>
        </div>

        {/* SABTU */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-200 shadow-sm flex flex-col">
          <div className="text-center border-b border-gray-200 pb-3 mb-4">
            <h3 className="font-extrabold text-sm md:text-base text-gray-900">
              {getDayDate('saturday', selectedWeek)}
            </h3>
          </div>

          <div className="space-y-3 flex-1">
            {matchesByDay.saturday.length > 0 ? (
              matchesByDay.saturday.map((m, idx) =>
                renderMatchRow(m, idx === 0 ? '14:00' : idx === 1 ? '17:00' : '20:00')
              )
            ) : (
              <div className="text-center text-xs text-gray-400 py-8">
                Tidak ada pertandingan di hari ini
              </div>
            )}
          </div>
        </div>

        {/* MINGGU */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-200 shadow-sm flex flex-col">
          <div className="text-center border-b border-gray-200 pb-3 mb-4">
            <h3 className="font-extrabold text-sm md:text-base text-gray-900">
              {getDayDate('sunday', selectedWeek)}
            </h3>
          </div>

          <div className="space-y-3 flex-1">
            {matchesByDay.sunday.length > 0 ? (
              matchesByDay.sunday.map((m, idx) =>
                renderMatchRow(m, idx === 0 ? '14:00' : idx === 1 ? '17:00' : '20:00')
              )
            ) : (
              <div className="text-center text-xs text-gray-400 py-8">
                Tidak ada pertandingan di hari ini
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. FOOTER CAPTION */}
      <div className="text-center text-xs text-gray-500 italic mt-8 font-medium">
        Semua waktu dalam WIB (GMT+7)
      </div>
    </main>
  );
};
