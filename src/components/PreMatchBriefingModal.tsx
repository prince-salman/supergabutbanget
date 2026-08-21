'use client';

import React, { useState } from 'react';
import { Team, MatchDeskAnalysis, DerbyInfo, TrashTalkOption, HeadToHeadDraftRecord } from '@/types';
import { getTeamLogoUrl } from '@/lib/imageAssets';
import { Swords, Flame, Mic, Shield, Trophy, ChevronRight, MessageSquare, Users, Sparkles, TrendingUp } from 'lucide-react';

interface PreMatchBriefingModalProps {
  homeTeam: Team;
  awayTeam: Team;
  isUserHome: boolean;
  coachName: string;
  deskAnalysis: MatchDeskAnalysis;
  derbyInfo: DerbyInfo;
  trashTalkOptions: TrashTalkOption[];
  h2hRecords: HeadToHeadDraftRecord[];
  onProceedToDraft: (chosenTrashTalk?: TrashTalkOption) => void;
}

export const PreMatchBriefingModal: React.FC<PreMatchBriefingModalProps> = ({
  homeTeam,
  awayTeam,
  isUserHome,
  coachName,
  deskAnalysis,
  derbyInfo,
  trashTalkOptions,
  h2hRecords,
  onProceedToDraft
}) => {
  const [selectedStatementId, setSelectedStatementId] = useState<string>(trashTalkOptions[0]?.id || 'spicy');
  const userTeam = isUserHome ? homeTeam : awayTeam;
  const enemyTeam = isUserHome ? awayTeam : homeTeam;

  const selectedTrashTalk = trashTalkOptions.find(t => t.id === selectedStatementId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn text-gray-900 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 text-left flex flex-col my-auto">
        {/* 1. Modal Top Banner */}
        <div className="bg-gradient-to-r from-[#0d1622] via-[#1a2536] to-[#0d1622] text-white p-5 sm:p-6 rounded-t-3xl border-b border-white/10 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                  🎙️ PRE-MATCH BROADCAST & CASTER DESK
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black uppercase font-mpl-title tracking-tight">
                {derbyInfo.isDerby ? derbyInfo.derbyName : `${homeTeam.shortName} VS ${awayTeam.shortName}`}
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                {derbyInfo.description}
              </p>
            </div>

            <div className="bg-white/10 px-3 py-1.5 rounded-2xl border border-white/15 text-right hidden sm:block">
              <div className="text-[9px] text-gray-400 uppercase font-mono">Tensi Rivalitas</div>
              <div className="text-xs font-black text-mpl-gold font-mono">
                🔥 HYPE x{derbyInfo.hypeMultiplier.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Modal Body Content */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* A. Teams Matchup VS Bar & Community Vote */}
          <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between gap-4 mb-3">
              {/* Home Team */}
              <div className="flex items-center gap-3 w-5/12">
                <img
                  src={getTeamLogoUrl(homeTeam.tag, homeTeam.themeColor)}
                  alt={homeTeam.tag}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
                />
                <div>
                  <span className="text-xs sm:text-sm font-black text-gray-900 uppercase block font-mpl-title">
                    {homeTeam.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono font-bold">
                    {homeTeam.id === userTeam.id ? '⭐ TIM ANDA (HOME)' : 'RIVAL HOME'}
                  </span>
                </div>
              </div>

              <div className="text-center font-mono font-black text-lg sm:text-2xl text-[#680008]">
                VS
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-end gap-3 w-5/12 text-right">
                <div>
                  <span className="text-xs sm:text-sm font-black text-gray-900 uppercase block font-mpl-title">
                    {awayTeam.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono font-bold">
                    {awayTeam.id === userTeam.id ? '⭐ TIM ANDA (AWAY)' : 'RIVAL AWAY'}
                  </span>
                </div>
                <img
                  src={getTeamLogoUrl(awayTeam.tag, awayTeam.themeColor)}
                  alt={awayTeam.tag}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
                />
              </div>
            </div>

            {/* Community Vote Bar */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-1">
                <span className="text-blue-700">{homeTeam.shortName} Fan Vote: {deskAnalysis.communityVote.homePercent}%</span>
                <span className="text-gray-500 uppercase">📊 PREDIKSI KOMUNITAS</span>
                <span className="text-red-700">{awayTeam.shortName} Fan Vote: {deskAnalysis.communityVote.awayPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-200">
                <div className="bg-blue-600 h-full transition-all" style={{ width: `${deskAnalysis.communityVote.homePercent}%` }} />
                <div className="bg-red-600 h-full transition-all" style={{ width: `${deskAnalysis.communityVote.awayPercent}%` }} />
              </div>
            </div>
          </div>

          {/* B. Feature 53: Caster & Analyst Desk Predictions */}
          <div>
            <h3 className="text-xs sm:text-sm font-black text-gray-900 font-mpl-title uppercase tracking-wider mb-3 flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#680008]" /> PREDIKSI ANALIS & CASTER DESK ({deskAnalysis.casterPredictions.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {deskAnalysis.casterPredictions.map((pred, idx) => {
                const predictedTeam = pred.predictedWinnerId === homeTeam.id ? homeTeam : awayTeam;
                return (
                  <div key={idx} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{pred.avatar}</span>
                          <div>
                            <div className="font-black text-gray-900 font-mpl-title leading-none">{pred.casterName}</div>
                            <div className="text-[8px] text-gray-500 font-mono">{pred.role}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          {pred.predictedScore}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">PILIHAN JUARA:</span>
                        <span className="text-xs font-black text-gray-900 uppercase flex items-center gap-1 font-mpl-title">
                          🏆 {predictedTeam.name}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-600 italic leading-snug">
                        "{pred.analysisQuote}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. Feature 52: Pre-Match Coach Statement & Trash Talk */}
          <div>
            <h3 className="text-xs sm:text-sm font-black text-gray-900 font-mpl-title uppercase tracking-wider mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-600" /> PERNYATAAN HEAD COACH SEBELUM LAGA (PSYWAR & MOTIVASI)
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Pilih pernyataan resmi Coach {coachName} di depan kamera sebelum memasuki panggung draft:
            </p>

            <div className="space-y-2.5">
              {trashTalkOptions.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedStatementId(opt.id)}
                  className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col gap-1 ${
                    selectedStatementId === opt.id
                      ? 'border-[#680008] bg-red-50/50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900 font-mpl-title">
                      {opt.title}
                    </span>
                    <span className="text-[10px] font-mono text-red-700 font-bold bg-white px-2 py-0.5 rounded-full border border-red-200">
                      ⚡ Hype +{opt.hypeBoost}% • Moral +{opt.moraleBoost}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 italic">
                    "{opt.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Modal Footer */}
        <div className="bg-gray-50 p-4 sm:p-5 border-t border-gray-200 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-mono font-medium">
            🎯 10-Hero Ban System Siap Dimulai
          </div>

          <button
            onClick={() => onProceedToDraft(selectedTrashTalk)}
            className="px-6 sm:px-8 py-3 bg-[#680008] hover:bg-[#85000a] text-white text-xs sm:text-sm font-black rounded-xl shadow-lg transition font-mpl-title uppercase tracking-wider flex items-center gap-2 animate-pulse"
          >
            Masuk ke Arena Draft 10-Ban <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
