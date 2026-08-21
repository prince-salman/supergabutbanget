'use client';

import React from 'react';
import { PostMatchData } from '@/types';
import { getHeroImageUrl, getPlayerAvatarUrl, getTeamLogoUrl } from '@/lib/imageAssets';
import { Trophy, Award, ArrowRight, Swords } from 'lucide-react';

interface RecapScreenProps {
  recapData: PostMatchData;
  userSide: 'blue' | 'red';
  onContinue: () => void;
}

export const RecapScreen: React.FC<RecapScreenProps> = ({
  recapData,
  userSide,
  onContinue
}) => {
  const { winnerSide, winnerTeam, score, mvp, seriesInfo } = recapData;
  const isUserWin = winnerSide === userSide;

  const isSeriesOver = seriesInfo ? seriesInfo.isSeriesOver : true;
  const gameNumber = seriesInfo ? seriesInfo.gameNumber : 1;
  const homeWins = seriesInfo ? seriesInfo.homeWins : (winnerSide === 'blue' ? 1 : 0);
  const awayWins = seriesInfo ? seriesInfo.awayWins : (winnerSide === 'red' ? 1 : 0);
  const homeTeam = seriesInfo ? seriesInfo.homeTeam : recapData.winnerTeam;
  const awayTeam = seriesInfo ? seriesInfo.awayTeam : recapData.loserTeam;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-center animate-fadeIn text-gray-900">
      {/* 1. Series BO3 Progress Header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-md max-w-xl mx-auto mb-6">
        <div className="text-[11px] font-mono tracking-widest text-red-700 font-black uppercase">
          {isSeriesOver ? 'SERI MATCH BO3 SELESAI' : `REGULAR SEASON BEST OF 3 (BO3) • GAME ${gameNumber}`}
        </div>

        {/* Series Score Display */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2 text-right">
            <span className="text-sm md:text-base font-black text-gray-900">{homeTeam.shortName}</span>
            <img
              src={getTeamLogoUrl(homeTeam.tag, homeTeam.themeColor)}
              alt={homeTeam.tag}
              className="w-8 h-8 object-contain"
            />
          </div>

          <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-1.5 rounded-xl font-mono text-xl md:text-2xl font-black shadow-inner">
            <span className={homeWins > awayWins ? 'text-mpl-gold' : 'text-gray-300'}>{homeWins}</span>
            <span className="text-gray-500 text-sm">-</span>
            <span className={awayWins > homeWins ? 'text-mpl-gold' : 'text-gray-300'}>{awayWins}</span>
          </div>

          <div className="flex items-center gap-2 text-left">
            <img
              src={getTeamLogoUrl(awayTeam.tag, awayTeam.themeColor)}
              alt={awayTeam.tag}
              className="w-8 h-8 object-contain"
            />
            <span className="text-sm md:text-base font-black text-gray-900">{awayTeam.shortName}</span>
          </div>
        </div>

        {isSeriesOver ? (
          <div className="mt-3 text-xs text-green-800 bg-green-50 border border-green-200 py-1.5 px-3 rounded-lg font-bold">
            🎉 SERI SELESAI! {homeWins > awayWins ? homeTeam.name : awayTeam.name} memenangkan pertandingan dengan skor {Math.max(homeWins, awayWins)} - {Math.min(homeWins, awayWins)}!
          </div>
        ) : (
          <div className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 py-1.5 px-3 rounded-lg font-bold">
            {homeWins === 1 && awayWins === 1
              ? `Skor Seri imbang 1 - 1! Bersiap untuk Game 3 Penentuan (Decider Game - Side Tim Bertukar)!`
              : `Seri BO3 berlanjut ke Game ${gameNumber + 1}! Skor saat ini: ${homeWins} - ${awayWins} (Side Tim Bertukar)`}
          </div>
        )}
      </div>

      {/* 2. Game Result Title */}
      <div className="mb-6">
        <h1 className={`text-4xl md:text-5xl font-black font-mpl-title tracking-wider ${isUserWin ? 'text-green-600 animate-bounce' : 'text-red-600'}`}>
          {isUserWin ? `🏆 GAME ${gameNumber} VICTORY` : `💀 GAME ${gameNumber} DEFEAT`}
        </h1>
        <p className="text-sm text-gray-600 mt-2 font-bold">
          {winnerTeam.name} memenangkan Game {gameNumber} dengan perolehan kill {score.blue} - {score.red}!
        </p>
      </div>

      {/* 3. MVP Showcase Card */}
      {mvp && (
        <div className="bg-white p-6 rounded-2xl border-2 border-amber-400 shadow-xl max-w-md mx-auto relative mb-6">
          <div className="inline-flex items-center gap-1.5 bg-[#680008] text-white text-xs font-black px-4 py-1 rounded-full uppercase mb-4 shadow-md font-mpl-title tracking-wider">
            <Award className="w-4 h-4 text-mpl-gold" /> MVP GAME {gameNumber}
          </div>

          <div className="flex justify-center items-center gap-3 mb-3">
            {/* Player Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl bg-gray-100">
              <img
                src={getPlayerAvatarUrl(mvp.playerName, winnerTeam.themeColor)}
                alt={mvp.playerName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-amber-500 text-xl font-black">✕</span>
            {/* Hero Portrait */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-gray-900 relative flex items-center justify-center">
              <img
                src={getHeroImageUrl(mvp.heroId || mvp.id, mvp.heroName)}
                alt={mvp.heroName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 font-mpl-title">{mvp.playerName}</h2>
          <h4 className="text-xs text-[#680008] font-bold mt-0.5">
            Hero: {mvp.heroName} ({mvp.lane} Lane)
          </h4>

          <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 mt-4 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 block font-bold">KDA</span>
              <b className="text-gray-900 font-mono font-black">{mvp.kda.k} / {mvp.kda.d} / {mvp.kda.a}</b>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-bold">Damage</span>
              <b className="text-red-600 font-mono font-black">{Math.round(mvp.damageDealt).toLocaleString()}</b>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-bold">Total Gold</span>
              <b className="text-amber-600 font-mono font-black">{mvp.gold.toLocaleString()}g</b>
            </div>
          </div>
        </div>
      )}

      {/* 4. Action CTA Button */}
      <button
        onClick={onContinue}
        className="px-8 py-3.5 bg-[#680008] hover:bg-[#4A0006] text-white text-sm font-black rounded-xl shadow-xl transition inline-flex items-center gap-2 font-mpl-title uppercase tracking-wider"
      >
        <span>
          {!isSeriesOver
            ? `Lanjut ke Game ${gameNumber + 1} (Draft Pick BO3)`
            : 'Kembali ke Dashboard Regular Season'}
        </span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </main>
  );
};
