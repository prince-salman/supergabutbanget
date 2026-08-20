'use client';

import React, { useState, useEffect } from 'react';
import { Hero, DraftResult, HeroClass, LaneRole } from '@/types';
import { DraftEngine } from '@/lib/draftEngine';
import { MLBB_HEROES } from '@/lib/data/heroes';
import { sanitizeInputText, globalRateLimiter } from '@/lib/security';
import { getHeroImageUrl, getPlayerAvatarUrl, getTeamLogoUrl } from '@/lib/imageAssets';
import { audioMgr } from '@/lib/audioManager';
import { Radio, Search, Lock, Zap, CheckCircle2, ArrowLeftRight, Swords, Sparkles } from 'lucide-react';

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

  useEffect(() => {
    draftEngine.onStateChange = () => setTick(t => t + 1);
    draftEngine.onTurnTimer = (t) => setTimeLeft(t);
    draftEngine.onDraftComplete = (result) => {
      setTimeout(() => {
        onDraftComplete(result);
      }, 1500);
    };

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
    <main className="max-w-7xl mx-auto px-4 py-4 animate-fadeIn text-gray-900">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-[#0d1622] via-[#141f2e] to-[#0d1622] px-4 sm:px-6 py-2.5 rounded-2xl border border-white/10 flex flex-wrap justify-between items-center gap-2 mb-3 shadow-xl text-white">
        <div className="text-xs sm:text-base font-black flex flex-wrap items-center gap-2 font-mpl-title">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-blue-400/40 flex items-center justify-center overflow-hidden">
              <img
                src={getTeamLogoUrl(draftEngine.blueTeam.tag, draftEngine.blueTeam.themeColor)}
                alt={draftEngine.blueTeam.tag}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-blue-400">{draftEngine.blueTeam.name}</span>
          </div>

          <span className="text-gray-500 font-mono">VS</span>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-red-400/40 flex items-center justify-center overflow-hidden">
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
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-black text-white uppercase font-mpl-title">
              {draftEngine.isSwapPhase ? 'FASE TUKAR HERO' : currentTurn?.label || 'Selesai'}
            </div>
            <div className="text-[10px] text-mpl-gold font-mono font-bold">
              {draftEngine.isSwapPhase ? 'HERO SWAP PHASE' : currentTurn?.phaseStage.toUpperCase() || 'FINISH'}
            </div>
          </div>
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black font-mono shadow-lg border border-white/20 ${
            timeLeft <= 5 ? 'bg-red-600 animate-pulse text-white' : 'bg-gray-800 text-white'
          }`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* SWAP PHASE BANNER */}
      {draftEngine.isSwapPhase && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-black p-3 rounded-2xl shadow-xl mb-3 flex flex-wrap items-center justify-between gap-3 border-2 border-amber-300 animate-pulse">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-black text-sm font-mpl-title uppercase tracking-wider">
                🔄 FASE TUKAR HERO (HERO SWAP PHASE) AKTIF!
              </div>
              <div className="text-xs font-bold">
                Klik kartu pemain pertama lalu klik pemain kedua untuk <b>menukar hero</b> sesuai role (EXP, Jungle, Mid, Gold, Roam).
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmFinalDraft}
            className="px-6 py-2 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-lg transition flex items-center gap-1.5 font-mpl-title uppercase tracking-wider"
          >
            <Swords className="w-4 h-4 text-mpl-gold" /> Masuk ke Arena Match ({timeLeft}s)
          </button>
        </div>
      )}

      {/* Stage Team Comms Intercom Box */}
      {comms && !draftEngine.isSwapPhase && (
        <div className="bg-gradient-to-r from-[#131d2a] via-[#1a2536] to-[#131d2a] border-2 border-white/10 border-l-4 border-l-mpl-gold p-4 rounded-2xl mb-4 shadow-2xl text-white">
          <div className="flex justify-between items-center text-[10px] font-black text-mpl-gold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 font-mpl-title">
              <Radio className="w-3.5 h-3.5 animate-pulse text-mpl-gold" /> STAGE TEAM HEADSET COMMS
              {draftEngine.teamConfidenceBoost > 0 && (
                <span className="bg-green-600/80 text-white px-2 py-0.2 rounded text-[9px] font-extrabold">
                  +{draftEngine.teamConfidenceBoost}% Team Morale Buff
                </span>
              )}
            </span>
            <span className="font-mono text-gray-400">MPL ID STAGE INTERCOM</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-gray-800 border-2 border-mpl-gold flex items-center justify-center text-xl shadow-lg shrink-0">
              {comms.speaker.avatar}
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-white flex items-center gap-2">
                {comms.speaker.name}
                <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.2 rounded font-normal">
                  {comms.speaker.role}
                </span>
              </div>
              <div className="text-xs text-gray-200 mt-1 italic font-medium">"{comms.text}"</div>

              {comms.coachReplyOptions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {comms.coachReplyOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCoachReply(idx)}
                      className="px-3 py-1.5 rounded-lg bg-[#680008] hover:bg-[#4A0006] text-white text-xs font-bold transition border border-red-700/50 shadow flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3 text-mpl-gold" /> {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main 3-Column Draft Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Blue Team Column */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-3.5 border-t-4 border-blue-500 border border-gray-200 flex flex-col gap-3 shadow-md">
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
                    className="h-11 rounded-xl bg-gray-100 border border-gray-300 flex flex-col items-center justify-center text-center p-0.5 overflow-hidden"
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
                    className={`p-2 rounded-xl border flex items-center justify-between min-h-[50px] transition cursor-pointer ${
                      isSelectedForSwap
                        ? 'bg-amber-100 border-2 border-amber-500 shadow-md scale-[1.02]'
                        : hero
                        ? 'bg-blue-50/60 border-blue-200 hover:bg-blue-100/60'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {hero ? (
                        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-blue-500 shrink-0 bg-gray-900 relative shadow">
                          <img
                            src={getHeroImageUrl(hero.id, hero.name)}
                            alt={hero.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-black shrink-0 font-mono">
                          P{idx + 1}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900">{hero ? hero.name : `Slot Pick ${idx + 1}`}</span>
                        <span className="text-[10px] text-gray-500 font-bold">{starter?.name || 'TBD'} • {lane} Lane</span>
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
        <div className="lg:col-span-6 bg-white rounded-2xl p-4 border border-gray-200 flex flex-col gap-3 shadow-md">
          {/* Filters & Search */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'EXP', 'JUNGLE', 'MID', 'GOLD', 'ROAM', 'ASSASSIN', 'FIGHTER', 'MAGE', 'MARKSMAN', 'TANK', 'SUPPORT'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition border ${
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
              placeholder="Cari nama hero (Suyou, Nolan, Ling, Brody, Vexana, Tigreal...)"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#680008]"
            />
          </div>

          {/* Hero Selection Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto p-1 bg-gray-50 rounded-2xl border border-gray-200">
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
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-1 pt-3">
                    <span className="text-[9px] font-black text-white truncate block leading-tight">
                      {hero.name}
                    </span>
                    <span className="text-[8px] text-amber-300 font-mono block">
                      {hero.lane}
                    </span>
                  </div>
                  {isUnavail && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-red-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Hero Action Card */}
          {selectedHero && (
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400 shadow bg-gray-900 shrink-0">
                  <img
                    src={getHeroImageUrl(selectedHero.id, selectedHero.name)}
                    alt={selectedHero.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-black text-sm text-gray-900 font-mpl-title">{selectedHero.name}</div>
                  <div className="text-[10px] text-gray-500 font-bold">
                    Role: {selectedHero.role} • Lane: {selectedHero.lane} • Tier: <b className="text-red-600">{selectedHero.tier}</b>
                  </div>
                </div>
              </div>

              {isUserTurn && !draftEngine.isCompleted && !draftEngine.isSwapPhase && (
                <button
                  onClick={handleLockIn}
                  className="px-6 py-2.5 bg-[#680008] hover:bg-[#4A0006] text-white text-xs font-black rounded-xl shadow-xl transition flex items-center gap-1.5 font-mpl-title uppercase tracking-wider animate-bounce"
                >
                  <Lock className="w-3.5 h-3.5 text-mpl-gold" />
                  KUNCI HERO ({currentTurn?.phase.toUpperCase()} {selectedHero.name})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Red Team Column */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-3.5 border-t-4 border-red-500 border border-gray-200 flex flex-col gap-3 shadow-md">
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
                    className="h-11 rounded-xl bg-gray-100 border border-gray-300 flex flex-col items-center justify-center text-center p-0.5 overflow-hidden"
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
                    className={`p-2 rounded-xl border flex items-center justify-between min-h-[50px] transition cursor-pointer ${
                      isSelectedForSwap
                        ? 'bg-amber-100 border-2 border-amber-500 shadow-md scale-[1.02]'
                        : hero
                        ? 'bg-red-50/60 border-red-200 hover:bg-red-100/60'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {hero ? (
                        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-red-500 shrink-0 bg-gray-900 relative shadow">
                          <img
                            src={getHeroImageUrl(hero.id, hero.name)}
                            alt={hero.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-black shrink-0 font-mono">
                          P{idx + 1}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900">{hero ? hero.name : `Slot Pick ${idx + 1}`}</span>
                        <span className="text-[10px] text-gray-500 font-bold">{starter?.name || 'TBD'} • {lane} Lane</span>
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
