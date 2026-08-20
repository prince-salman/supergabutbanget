'use client';

import React, { useState, useEffect } from 'react';
import { Hero, DraftResult, HeroClass, LaneRole, SquadDiscussionEntry } from '@/types';
import { DraftEngine } from '@/lib/draftEngine';
import { MLBB_HEROES } from '@/lib/data/heroes';
import { sanitizeInputText, globalRateLimiter } from '@/lib/security';
import { getHeroImageUrl, getPlayerAvatarUrl, getTeamLogoUrl } from '@/lib/imageAssets';
import { audioMgr } from '@/lib/audioManager';
import { Radio, Search, Lock, Zap, CheckCircle2, ArrowLeftRight, Swords, Sparkles, Shield, User, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface DraftPickScreenProps {
  draftEngine: DraftEngine;
  coachName: string;
  onDraftComplete: (result: DraftResult) => void;
}

const LANES_ORDER: LaneRole[] = ['EXP', 'Jungle', 'Mid', 'Gold', 'Roam'];

export const DraftPickScreen: React.FC<DraftPickScreenProps> = ({
  draftEngine,
  coachName,
  onDraftComplete
}) => {
  const [, setTick] = useState(0);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(draftEngine.timer);
  const [swapSourceIdx, setSwapSourceIdx] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<'pool' | 'blue' | 'red' | 'comms'>('pool');
  const [isCommsExpanded, setIsCommsExpanded] = useState<boolean>(true);

  useEffect(() => {
    draftEngine.onStateChange = () => setTick(t => t + 1);
    draftEngine.onTurnTimer = (t) => setTimeLeft(t);
    draftEngine.onDraftComplete = (result) => {
      setTimeout(() => {
        onDraftComplete(result);
      }, 1500);
    };

    if (!draftEngine.isStarted) {
      draftEngine.start();
    } else {
      if (!draftEngine.isUserTurn() && !draftEngine.isCompleted && !draftEngine.isSwapPhase) {
        draftEngine.executeAITurn();
      }
    }

    return () => {
      draftEngine.destroy();
    };
  }, [draftEngine, onDraftComplete]);

  const currentTurn = draftEngine.getCurrentTurn();
  const isUserTurn = draftEngine.isUserTurn();
  const comms = draftEngine.currentComms;
  const unavailable = draftEngine.getAllUnavailableHeroIds();

  const userPicks = draftEngine.userSide === 'blue' ? draftEngine.bluePicks : draftEngine.redPicks;
  const userNeededLanes = draftEngine.getNeededLanes(userPicks);
  const userAssignments = draftEngine.userSide === 'blue' ? draftEngine.blueAssignments : draftEngine.redAssignments;

  const filteredHeroes = MLBB_HEROES.filter(h => {
    const matchRole = roleFilter === 'ALL' || h.role.toUpperCase() === roleFilter || (h.secondaryRole && h.secondaryRole.toUpperCase() === roleFilter) || h.lane.toUpperCase() === roleFilter;
    const matchSearch = !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleHeroSelect = (hero: Hero) => {
    if (unavailable.includes(hero.id)) return;
    setSelectedHero(hero);
  };

  const handleLockIn = () => {
    if (!globalRateLimiter.isAllowed('draft_lock', 400)) return;
    if (selectedHero && isUserTurn && !draftEngine.isCompleted && !draftEngine.isSwapPhase) {
      const success = draftEngine.userSelectHero(selectedHero);
      if (success) {
        setSelectedHero(null);
      }
    }
  };

  const handleCoachReply = (optIdx: number) => {
    if (!globalRateLimiter.isAllowed('coach_reply', 300)) return;
    if (!comms) return;
    const opt = comms.coachReplyOptions[optIdx];
    const pickedHero = draftEngine.handleCoachDialogue(opt);
    if (pickedHero) {
      setSelectedHero(pickedHero);
    }
    audioMgr.playCommsBeep();
    setTick(t => t + 1);
  };

  const handleQuickPickHeroById = (heroId?: string) => {
    if (!heroId) return;
    const hero = MLBB_HEROES.find(h => h.id === heroId);
    if (hero && !unavailable.includes(hero.id)) {
      setSelectedHero(hero);
      audioMgr.playCommsBeep();
    }
  };

  const handlePlayerSlotClick = (idx: number, side: 'blue' | 'red') => {
    if (side !== draftEngine.userSide) return;
    if (!draftEngine.isSwapPhase && userPicks.length < 2) return;

    if (swapSourceIdx === null) {
      setSwapSourceIdx(idx);
    } else if (swapSourceIdx === idx) {
      setSwapSourceIdx(null);
    } else {
      // Swap heroes between player slots!
      draftEngine.swapHeroes(draftEngine.userSide, swapSourceIdx, idx);
      setSwapSourceIdx(null);
    }
  };

  const handleConfirmFinalDraft = () => {
    if (!globalRateLimiter.isAllowed('confirm_draft', 500)) return;
    draftEngine.finishDraft();
  };

  const blueStats = draftEngine.calculateTeamStats(draftEngine.bluePicks);
  const redStats = draftEngine.calculateTeamStats(draftEngine.redPicks);

  return (
    <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 animate-fadeIn text-gray-900">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-[#0d1622] via-[#141f2e] to-[#0d1622] px-3 sm:px-6 py-2.5 rounded-2xl border border-white/10 flex flex-wrap justify-between items-center gap-2 mb-3 shadow-xl text-white">
        <div className="text-xs sm:text-base font-black flex flex-wrap items-center gap-2 font-mpl-title">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white p-0.5 border border-blue-400/40 flex items-center justify-center overflow-hidden">
              <img
                src={getTeamLogoUrl(draftEngine.blueTeam.tag, draftEngine.blueTeam.themeColor)}
                alt={draftEngine.blueTeam.tag}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-blue-400">{draftEngine.blueTeam.name}</span>
          </div>

          <span className="text-gray-500 font-mono text-xs">VS</span>

          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white p-0.5 border border-red-400/40 flex items-center justify-center overflow-hidden">
              <img
                src={getTeamLogoUrl(draftEngine.redTeam.tag, draftEngine.redTeam.themeColor)}
                alt={draftEngine.redTeam.tag}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-red-400">{draftEngine.redTeam.name}</span>
          </div>
        </div>

        {/* Turn Phase & Timer */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right">
            <div className="text-[10px] sm:text-xs font-black text-white uppercase font-mpl-title">
              {draftEngine.isSwapPhase ? 'FASE TUKAR HERO' : currentTurn?.label || 'Selesai'}
            </div>
            <div className="text-[8px] sm:text-[10px] text-mpl-gold font-mono font-bold">
              {draftEngine.isSwapPhase ? 'HERO SWAP PHASE' : currentTurn?.phaseStage.toUpperCase() || 'FINISH'}
            </div>
          </div>
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xs sm:text-sm font-black font-mono shadow-lg border border-white/20 ${
            timeLeft <= 5 ? 'bg-red-600 animate-pulse text-white' : 'bg-gray-800 text-white'
          }`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Official 20-Step 10-Ban Draft Flow Indicator */}
      <div className="bg-[#0f1926] p-2 rounded-2xl border border-white/10 mb-3 shadow-md overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-[700px]">
          {draftEngine.turnSequence.map((t, idx) => {
            const isCurrent = idx === draftEngine.turnIndex && !draftEngine.isSwapPhase;
            const isPast = idx < draftEngine.turnIndex || draftEngine.isSwapPhase;
            const isBlue = t.side === 'blue';
            const isBan = t.phase === 'ban';

            return (
              <div
                key={idx}
                className={`flex-1 px-1 py-1 rounded-lg text-center text-[8px] sm:text-[9px] font-mono font-bold transition flex flex-col items-center justify-center ${
                  isCurrent
                    ? 'bg-amber-400 text-black ring-2 ring-amber-300 font-black scale-105 shadow-md animate-pulse'
                    : isPast
                    ? 'bg-black/50 text-gray-500 opacity-60'
                    : isBlue
                    ? isBan ? 'bg-blue-950/80 text-blue-300 border border-blue-800/40' : 'bg-blue-900/60 text-blue-200 border border-blue-700/50'
                    : isBan ? 'bg-red-950/80 text-red-300 border border-red-800/40' : 'bg-red-900/60 text-red-200 border border-red-700/50'
                }`}
                title={t.label}
              >
                <span>{isBlue ? '🔵' : '🔴'} {isBan ? `B${t.num}` : `P${t.num}`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SWAP PHASE BANNER */}
      {draftEngine.isSwapPhase && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-black p-3 rounded-2xl shadow-xl mb-3 flex flex-wrap items-center justify-between gap-3 border-2 border-amber-300 animate-pulse">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <div>
              <div className="font-black text-xs sm:text-sm font-mpl-title uppercase tracking-wider">
                🔄 FASE TUKAR HERO AKTIF!
              </div>
              <div className="text-[11px] sm:text-xs font-bold">
                Klik kartu pemain pertama lalu klik pemain kedua untuk <b>menukar hero</b> antar role.
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmFinalDraft}
            className="w-full sm:w-auto px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 font-mpl-title uppercase tracking-wider"
          >
            <Swords className="w-4 h-4 text-mpl-gold" /> Masuk ke Arena Match ({timeLeft}s)
          </button>
        </div>
      )}

      {/* LIVE INTERACTIVE SQUAD DISCUSSION BOX (All 5 Players + Assistant Coach & Analyst Active Chat) */}
      {comms && !draftEngine.isSwapPhase && (
        <div className="bg-gradient-to-r from-[#111926] via-[#172233] to-[#111926] border-2 border-white/10 border-l-4 border-l-mpl-gold p-3 sm:p-4 rounded-2xl mb-3 shadow-2xl text-white">
          <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-black text-mpl-gold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 font-mpl-title">
              <Radio className="w-3.5 h-3.5 animate-pulse text-mpl-gold" />
              🎙️ DISKUSI DRAFT TIM (5 PLAYER & ASISTEN PELATIH)
              {draftEngine.teamConfidenceBoost > 0 && (
                <span className="bg-green-600 text-white px-2 py-0.2 rounded text-[9px] font-extrabold shadow">
                  +{draftEngine.teamConfidenceBoost}% Team Chemistry
                </span>
              )}
            </span>

            <button
              onClick={() => setIsCommsExpanded(!isCommsExpanded)}
              className="text-gray-300 hover:text-white flex items-center gap-1 text-[10px] font-mono"
            >
              {isCommsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {isCommsExpanded ? 'Sembunyikan' : 'Tampilkan Diskusi'}
            </button>
          </div>

          {isCommsExpanded && (
            <div className="flex flex-col gap-2">
              {/* Discussion Chat Feed */}
              <div className="max-h-[190px] overflow-y-auto space-y-1.5 pr-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
                {comms.squadDiscussion?.map((entry: SquadDiscussionEntry) => (
                  <div
                    key={entry.id}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-start gap-2.5 transition"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 border border-mpl-gold flex items-center justify-center text-sm shrink-0 shadow">
                      {entry.avatarIcon}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-black text-[11px] sm:text-xs text-white">
                          {entry.speakerName}
                        </span>
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#680008] text-white">
                          {entry.speakerRole}
                        </span>

                        {entry.suggestedHeroName && (
                          <button
                            onClick={() => handleQuickPickHeroById(entry.suggestedHeroId)}
                            className="text-[8px] sm:text-[9px] px-2 py-0.2 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 font-bold ml-auto transition flex items-center gap-1"
                            title="Klik untuk memilih hero ini"
                          >
                            <Sparkles className="w-2.5 h-2.5" /> Pilih {entry.suggestedHeroName}
                          </button>
                        )}
                      </div>

                      <div className="text-[10px] sm:text-[11px] text-gray-200 mt-0.5 leading-snug">
                        "{entry.message}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Head Coach Interactive Response Options */}
              {comms.coachReplyOptions.length > 0 && (
                <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    💬 PILIH INSTRUKSI HEAD COACH ({coachName}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {comms.coachReplyOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCoachReply(idx)}
                        className="px-2.5 py-2 rounded-xl bg-[#680008] hover:bg-[#85000a] text-white text-[10px] sm:text-[11px] font-bold transition border border-red-500/40 shadow-md flex items-center gap-1.5 text-left"
                      >
                        <Zap className="w-3.5 h-3.5 text-mpl-gold shrink-0" />
                        <span className="line-clamp-2">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Tab Switcher (< 1024px) */}
      <div className="lg:hidden flex rounded-xl bg-gray-200 p-1 mb-3 gap-1 text-xs font-bold font-mpl-title">
        <button
          onClick={() => setMobileTab('blue')}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1 ${
            mobileTab === 'blue'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔵 Tim Biru
        </button>
        <button
          onClick={() => setMobileTab('pool')}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1 ${
            mobileTab === 'pool'
              ? 'bg-[#680008] text-white shadow'
              : 'text-gray-700 hover:bg-gray-300'
          }`}
        >
          ⚔️ Hero Pool
        </button>
        <button
          onClick={() => setMobileTab('red')}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1 ${
            mobileTab === 'red'
              ? 'bg-red-600 text-white shadow'
              : 'text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔴 Tim Merah
        </button>
      </div>

      {/* Main 3-Column Draft Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Side: Blue Team Column */}
        <div className={`lg:col-span-3 bg-white rounded-2xl p-3 sm:p-3.5 border-t-4 border-blue-500 border border-gray-200 flex-col gap-3 shadow-md ${
          mobileTab !== 'blue' ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-blue-600 uppercase font-mpl-title">🔵 Blue Team</h4>
            <span className="text-[10px] text-gray-500 font-mono font-bold">{draftEngine.blueTeam.shortName}</span>
          </div>

          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Bans (5):</div>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4].map(idx => {
                const h = draftEngine.blueBans[idx];
                return (
                  <div
                    key={idx}
                    className="h-10 sm:h-11 rounded-xl bg-gray-100 border border-gray-300 flex flex-col items-center justify-center text-center p-0.5 overflow-hidden"
                  >
                    {h ? (
                      <div className="w-full h-full relative flex flex-col items-center justify-center">
                        <img
                          src={getHeroImageUrl(h.id, h.name)}
                          alt={h.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-red-900/90 text-[7px] font-black text-white truncate px-0.5">
                          {h.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-400 font-mono">B{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase mb-1">
              <span>Picks & Roster:</span>
              {draftEngine.userSide === 'blue' && (
                <span className="text-blue-600 font-bold">💡 Klik untuk Tukar</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {LANES_ORDER.map((lane, idx) => {
                const assignment = draftEngine.blueAssignments[idx];
                const starter = assignment?.player || draftEngine.blueTeam.roster.find(p => p.role === lane) || draftEngine.blueTeam.roster[idx];
                const hero = assignment?.hero || draftEngine.bluePicks[idx];
                const isSelectedForSwap = swapSourceIdx === idx && draftEngine.userSide === 'blue';

                return (
                  <div
                    key={lane}
                    onClick={() => handlePlayerSlotClick(idx, 'blue')}
                    className={`p-2 rounded-xl border flex items-center justify-between min-h-[48px] transition cursor-pointer ${
                      isSelectedForSwap
                        ? 'bg-amber-100 border-2 border-amber-500 shadow-md scale-[1.02]'
                        : hero
                        ? 'bg-blue-50/60 border-blue-200 hover:bg-blue-100/60'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {hero ? (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border-2 border-blue-500 shrink-0 bg-gray-900 relative shadow">
                          <img
                            src={getHeroImageUrl(hero.id, hero.name)}
                            alt={hero.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-black shrink-0 font-mono">
                          P{idx + 1}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900">{hero ? hero.name : `Slot Pick ${idx + 1}`}</span>
                        <span className="text-[10px] text-gray-500 font-bold">{starter?.name || 'TBD'} • {lane}</span>
                      </div>
                    </div>

                    {starter && (
                      <div className="flex items-center gap-1">
                        <img
                          src={getPlayerAvatarUrl(starter.name, draftEngine.blueTeam.themeColor)}
                          alt={starter.name}
                          className="w-6 h-6 rounded-full border border-gray-300 shrink-0 shadow"
                        />
                        {draftEngine.userSide === 'blue' && (
                          <ArrowLeftRight className={`w-3.5 h-3.5 ${isSelectedForSwap ? 'text-amber-600 animate-spin' : 'text-gray-400 hover:text-blue-600'}`} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blue Synergy */}
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[10px] grid grid-cols-2 gap-1.5 font-bold">
            <div>CC: <b className="text-gray-900">{blueStats.cc}%</b></div>
            <div>Burst: <b className="text-gray-900">{blueStats.burst}%</b></div>
            <div>Frontline: <b className="text-gray-900">{blueStats.frontline}%</b></div>
            <div>Sinergi: <b className="text-[#680008] font-black">{blueStats.overall}%</b></div>
          </div>
        </div>

        {/* Center: Hero Pool Grid & Pick Preview */}
        <div className={`lg:col-span-6 bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 flex-col gap-3 shadow-md ${
          mobileTab !== 'pool' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Filters & Search */}
          <div className="flex flex-wrap gap-1">
            {['ALL', 'EXP', 'JUNGLE', 'MID', 'GOLD', 'ROAM', 'ASSASSIN', 'FIGHTER', 'MAGE', 'MARKSMAN', 'TANK', 'SUPPORT'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition border ${
                  roleFilter === r
                    ? 'bg-[#680008] text-white border-[#680008] shadow'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(sanitizeInputText(e.target.value, 20))}
              placeholder="Cari nama hero (Suyou, Nolan, Ling, Beatrix, Tigreal...)"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#680008]"
            />
          </div>

          {/* Hero Selection Grid (Touch optimized) */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 sm:gap-2 max-h-[320px] overflow-y-auto p-1 bg-gray-50 rounded-2xl border border-gray-200">
            {filteredHeroes.map(hero => {
              const isUnavail = unavailable.includes(hero.id);
              const isSelected = selectedHero?.id === hero.id;

              return (
                <div
                  key={hero.id}
                  onClick={() => !isUnavail && handleHeroSelect(hero)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 cursor-pointer transition flex flex-col justify-end p-1 text-center ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400 scale-105 z-10 shadow-lg bg-amber-50'
                      : isUnavail
                      ? 'border-gray-300 opacity-30 grayscale cursor-not-allowed bg-gray-200'
                      : 'border-gray-200 hover:border-gray-400 bg-white hover:scale-105 shadow-sm'
                  }`}
                >
                  <img
                    src={getHeroImageUrl(hero.id, hero.name)}
                    alt={hero.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-0.5 sm:p-1 pt-2 sm:pt-3">
                    <span className="text-[8px] sm:text-[9px] font-black text-white truncate block leading-tight">
                      {hero.name}
                    </span>
                    <span className="text-[7px] sm:text-[8px] text-amber-300 font-mono block">
                      {hero.lane}
                    </span>
                  </div>
                  {isUnavail && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-red-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Hero Action Card */}
          {selectedHero && (
            <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-amber-400 shadow bg-gray-900 shrink-0">
                  <img
                    src={getHeroImageUrl(selectedHero.id, selectedHero.name)}
                    alt={selectedHero.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-black text-xs sm:text-sm text-gray-900 font-mpl-title">{selectedHero.name}</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold">
                    Role: {selectedHero.role} • Lane: {selectedHero.lane} • Tier: <b className="text-red-600">{selectedHero.tier}</b>
                  </div>
                </div>
              </div>

              {isUserTurn && !draftEngine.isCompleted && !draftEngine.isSwapPhase && (
                <button
                  onClick={handleLockIn}
                  className="w-full sm:w-auto px-5 py-2 sm:py-2.5 bg-[#680008] hover:bg-[#4A0006] text-white text-xs font-black rounded-xl shadow-xl transition flex items-center justify-center gap-1.5 font-mpl-title uppercase tracking-wider animate-bounce"
                >
                  <Lock className="w-3.5 h-3.5 text-mpl-gold" />
                  KUNCI {currentTurn?.phase.toUpperCase()} {selectedHero.name}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Red Team Column */}
        <div className={`lg:col-span-3 bg-white rounded-2xl p-3 sm:p-3.5 border-t-4 border-red-500 border border-gray-200 flex-col gap-3 shadow-md ${
          mobileTab !== 'red' ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-red-600 uppercase font-mpl-title">🔴 Red Team</h4>
            <span className="text-[10px] text-gray-500 font-mono font-bold">{draftEngine.redTeam.shortName}</span>
          </div>

          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Bans (5):</div>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4].map(idx => {
                const h = draftEngine.redBans[idx];
                return (
                  <div
                    key={idx}
                    className="h-10 sm:h-11 rounded-xl bg-gray-100 border border-gray-300 flex flex-col items-center justify-center text-center p-0.5 overflow-hidden"
                  >
                    {h ? (
                      <div className="w-full h-full relative flex flex-col items-center justify-center">
                        <img
                          src={getHeroImageUrl(h.id, h.name)}
                          alt={h.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-red-900/90 text-[7px] font-black text-white truncate px-0.5">
                          {h.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-400 font-mono">B{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase mb-1">
              <span>Picks & Roster:</span>
              {draftEngine.userSide === 'red' && (
                <span className="text-red-600 font-bold">💡 Klik untuk Tukar</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {LANES_ORDER.map((lane, idx) => {
                const assignment = draftEngine.redAssignments[idx];
                const starter = assignment?.player || draftEngine.redTeam.roster.find(p => p.role === lane) || draftEngine.redTeam.roster[idx];
                const hero = assignment?.hero || draftEngine.redPicks[idx];
                const isSelectedForSwap = swapSourceIdx === idx && draftEngine.userSide === 'red';

                return (
                  <div
                    key={lane}
                    onClick={() => handlePlayerSlotClick(idx, 'red')}
                    className={`p-2 rounded-xl border flex items-center justify-between min-h-[48px] transition cursor-pointer ${
                      isSelectedForSwap
                        ? 'bg-amber-100 border-2 border-amber-500 shadow-md scale-[1.02]'
                        : hero
                        ? 'bg-red-50/60 border-red-200 hover:bg-red-100/60'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {hero ? (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border-2 border-red-500 shrink-0 bg-gray-900 relative shadow">
                          <img
                            src={getHeroImageUrl(hero.id, hero.name)}
                            alt={hero.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-black shrink-0 font-mono">
                          P{idx + 1}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900">{hero ? hero.name : `Slot Pick ${idx + 1}`}</span>
                        <span className="text-[10px] text-gray-500 font-bold">{starter?.name || 'TBD'} • {lane}</span>
                      </div>
                    </div>

                    {starter && (
                      <div className="flex items-center gap-1">
                        <img
                          src={getPlayerAvatarUrl(starter.name, draftEngine.redTeam.themeColor)}
                          alt={starter.name}
                          className="w-6 h-6 rounded-full border border-gray-300 shrink-0 shadow"
                        />
                        {draftEngine.userSide === 'red' && (
                          <ArrowLeftRight className={`w-3.5 h-3.5 ${isSelectedForSwap ? 'text-amber-600 animate-spin' : 'text-gray-400 hover:text-red-600'}`} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Red Synergy */}
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[10px] grid grid-cols-2 gap-1.5 font-bold">
            <div>CC: <b className="text-gray-900">{redStats.cc}%</b></div>
            <div>Burst: <b className="text-gray-900">{redStats.burst}%</b></div>
            <div>Frontline: <b className="text-gray-900">{redStats.frontline}%</b></div>
            <div>Sinergi: <b className="text-[#680008] font-black">{redStats.overall}%</b></div>
          </div>
        </div>
      </div>
    </main>
  );
};
