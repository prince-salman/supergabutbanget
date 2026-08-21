'use client';

import React, { useRef, useEffect, useState } from 'react';
import { DraftResult, PostMatchData, CommentaryEntry, MatchState } from '@/types';
import { audioMgr } from '@/lib/audioManager';
import { globalRateLimiter } from '@/lib/security';
import { getHeroImageUrl, getPlayerAvatarUrl, getTeamLogoUrl, getItemImageUrl } from '@/lib/imageAssets';
import { getHeroPurchasedItems, MLBBItem } from '@/lib/data/items';
import { Shield, Swords, Crown, Zap, Play, Pause, FastForward, Volume2, AlertTriangle, Sparkles, TrendingUp, Users, Radio } from 'lucide-react';

interface MatchScreenProps {
  draftResult: DraftResult;
  userSide: 'blue' | 'red';
  onMatchFinish: (finishData: PostMatchData) => void;
}

export const MatchScreen: React.FC<MatchScreenProps> = ({
  draftResult,
  userSide,
  onMatchFinish
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [commentaries, setCommentaries] = useState<CommentaryEntry[]>([]);
  const [speed, setSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTactic, setActiveTactic] = useState<string>('balanced');
  const [mobileMatchTab, setMobileMatchTab] = useState<'squads' | 'caster'>('squads');
  const [activeKillBanner, setActiveKillBanner] = useState<{
    killer: { name: string; heroName: string; heroId: string; side: string };
    victim: { name: string; heroName: string; heroId: string; side: string };
    title: string;
    subtitle?: string;
  } | null>(null);

  const engineRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    audioMgr.playMatchStartHorn();

    // Preload hero portrait images for canvas rendering
    const heroImageCache: Record<string, HTMLImageElement> = {};
    const allAssignments = [...draftResult.blueAssignments, ...draftResult.redAssignments];
    allAssignments.forEach(a => {
      const cleanId = a.hero.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const img = new Image();
      img.src = `/images/heroes/${cleanId}.png`;
      heroImageCache[cleanId] = img;
    });

    // 1. Map Coordinates (Land of Dawn 800x600 layout)
    const bases = {
      blue: { x: 90, y: 510, hp: 12000, maxHp: 12000, lastAttack: 0 },
      red: { x: 710, y: 90, hp: 12000, maxHp: 12000, lastAttack: 0 }
    };

    // 3 Lanes (Top/EXP, Mid, Bot/Gold)
    const lanePaths = {
      top: [
        { x: 90, y: 510 },
        { x: 120, y: 220 },
        { x: 180, y: 130 },
        { x: 400, y: 110 },
        { x: 620, y: 130 },
        { x: 710, y: 90 }
      ],
      mid: [
        { x: 90, y: 510 },
        { x: 260, y: 390 },
        { x: 400, y: 300 },
        { x: 540, y: 210 },
        { x: 710, y: 90 }
      ],
      bot: [
        { x: 90, y: 510 },
        { x: 180, y: 470 },
        { x: 400, y: 490 },
        { x: 620, y: 470 },
        { x: 680, y: 380 },
        { x: 710, y: 90 }
      ]
    };

    // Turrets per side
    const turrets = [
      // Blue Turrets
      { id: 'b_t1', side: 'blue', lane: 'top', type: 'outer', x: 170, y: 220, hp: 3500, maxHp: 3500, lastAttack: 0, hasBackdoorShield: false },
      { id: 'b_t2', side: 'blue', lane: 'top', type: 'inner', x: 130, y: 340, hp: 4000, maxHp: 4000, lastAttack: 0, hasBackdoorShield: false },
      { id: 'b_m1', side: 'blue', lane: 'mid', type: 'outer', x: 270, y: 380, hp: 3500, maxHp: 3500, lastAttack: 0, hasBackdoorShield: false },
      { id: 'b_m2', side: 'blue', lane: 'mid', type: 'inner', x: 200, y: 430, hp: 4000, maxHp: 4000, lastAttack: 0, hasBackdoorShield: false },
      { id: 'b_b1', side: 'blue', lane: 'bot', type: 'outer', x: 370, y: 480, hp: 3500, maxHp: 3500, lastAttack: 0, hasBackdoorShield: false },
      { id: 'b_b2', side: 'blue', lane: 'bot', type: 'inner', x: 240, y: 490, hp: 4000, maxHp: 4000, lastAttack: 0, hasBackdoorShield: false },

      // Red Turrets
      { id: 'r_t1', side: 'red', lane: 'top', type: 'outer', x: 430, y: 120, hp: 3500, maxHp: 3500, lastAttack: 0, hasBackdoorShield: false },
      { id: 'r_t2', side: 'red', lane: 'top', type: 'inner', x: 570, y: 110, hp: 4000, maxHp: 4000, lastAttack: 0, hasBackdoorShield: false },
      { id: 'r_m1', side: 'red', lane: 'mid', type: 'outer', x: 530, y: 220, hp: 3500, maxHp: 3500, lastAttack: 0, hasBackdoorShield: false },
      { id: 'r_m2', side: 'red', lane: 'mid', type: 'inner', x: 600, y: 170, hp: 4000, maxHp: 4000, lastAttack: 0, hasBackdoorShield: false },
      { id: 'r_b1', side: 'red', lane: 'bot', type: 'outer', x: 630, y: 380, hp: 3500, maxHp: 3500, lastAttack: 0, hasBackdoorShield: false },
      { id: 'r_b2', side: 'red', lane: 'bot', type: 'inner', x: 670, y: 260, hp: 4000, maxHp: 4000, lastAttack: 0, hasBackdoorShield: false }
    ];

    // Jungle Buff Camps with realistic HP and Respawn Timers
    const jungleCamps = [
      { id: 'b_blue', side: 'blue', type: 'blue', name: 'Blue Golem', x: 190, y: 380, hp: 1800, maxHp: 1800, alive: true, respawnTimer: 0 },
      { id: 'b_red', side: 'blue', type: 'red', name: 'Red Fiend', x: 260, y: 490, hp: 1800, maxHp: 1800, alive: true, respawnTimer: 0 },
      { id: 'r_blue', side: 'red', type: 'blue', name: 'Blue Golem', x: 610, y: 220, hp: 1800, maxHp: 1800, alive: true, respawnTimer: 0 },
      { id: 'r_red', side: 'red', type: 'red', name: 'Red Fiend', x: 540, y: 110, hp: 1800, maxHp: 1800, alive: true, respawnTimer: 0 }
    ];

    // River Bushes
    const bushes = [
      { x: 280, y: 220 },
      { x: 330, y: 360 },
      { x: 470, y: 240 },
      { x: 520, y: 380 },
      { x: 390, y: 210 },
      { x: 410, y: 390 }
    ];

    // 2. Initialize 10 Heroes with Dynamic Duel Clash Targets
    const heroes: any[] = [];
    const createHero = (assignment: any, side: 'blue' | 'red') => {
      const isBlue = side === 'blue';
      const basePos = isBlue 
        ? { x: 100 + Math.random() * 20, y: 500 + Math.random() * 20 } 
        : { x: 700 - Math.random() * 20, y: 100 - Math.random() * 20 };

      const lane = assignment.lane;
      let targetPos = { x: 400, y: 300 };

      if (lane === 'EXP') {
        targetPos = isBlue ? { x: 275, y: 130 } : { x: 305, y: 130 };
      } else if (lane === 'Gold') {
        targetPos = isBlue ? { x: 495, y: 480 } : { x: 525, y: 480 };
      } else if (lane === 'Mid') {
        targetPos = isBlue ? { x: 385, y: 315 } : { x: 415, y: 285 };
      } else if (lane === 'Jungle') {
        // Start by farming Blue Buff / Red Buff
        targetPos = isBlue ? { x: 190, y: 380 } : { x: 610, y: 220 };
      } else { // Roam
        targetPos = isBlue ? { x: 365, y: 335 } : { x: 435, y: 265 };
      }

      const cleanHeroId = assignment.hero.id.toLowerCase().replace(/[^a-z0-9]/g, '');

      return {
        id: assignment.player.id,
        heroId: cleanHeroId,
        rawHeroId: assignment.hero.id,
        side,
        lane,
        player: assignment.player,
        playerName: assignment.player.name,
        hero: assignment.hero,
        heroName: assignment.hero.name,
        heroIcon: assignment.hero.avatarIcon,
        x: basePos.x,
        y: basePos.y,
        targetX: targetPos.x,
        targetY: targetPos.y,
        baseX: basePos.x,
        baseY: basePos.y,
        laneTarget: targetPos,
        hp: 1450 + assignment.hero.stats.frontline * 10,
        maxHp: 1450 + assignment.hero.stats.frontline * 10,
        shield: 0,
        atk: 110 + assignment.hero.stats.burst * 1.3,
        level: 1,
        gold: 300,
        items: [] as MLBBItem[],
        kda: { k: 0, d: 0, a: 0 },
        streak: 0,
        spreeStreak: 0,
        multiKillChain: 0,
        lastKillTime: 0,
        isDead: false,
        respawnTimer: 0,
        damageDealt: 0,
        damageTaken: 0,
        lastAttackTime: 0,
        lastUltTime: 0,
        lastSpellTime: 0,
        inBush: false,
        hasBlueBuff: false,
        hasRedBuff: false,
        hasLithoBuff: false,
        lithoTimer: 0,
        isRecalling: false,
        recallTimer: 0,
        isTauntingTasTas: false,
        tauntTimer: 0,
        warAxeStacks: 0,
        bruteForceStacks: 0,
        buffAuraAngle: Math.random() * Math.PI * 2,
        ccStatus: null as 'stunned' | 'airborne' | 'frozen' | null,
        ccTimer: 0,
        immortalityUsed: false,
        isReviving: false,
        reviveTimer: 0,
        winterCrownUsed: false,
        isFrozenInvulnerable: false,
        frozenTimer: 0,
        wonActive: false,
        wonTimer: 0,
        battleSpell: assignment.hero.role === 'Marksman' ? 'Flicker' : assignment.hero.role === 'Mage' ? 'Flicker' : assignment.hero.role === 'Tank' ? 'Vengeance' : assignment.hero.role === 'Assassin' ? 'Retribution' : 'Purify'
      };
    };

    draftResult.blueAssignments.forEach(a => heroes.push(createHero(a, 'blue')));
    draftResult.redAssignments.forEach(a => heroes.push(createHero(a, 'red')));

    let wipeoutAnnounced = { blue: false, red: false };

    const state = {
      gameTime: 0,
      score: { blue: 0, red: 0 },
      gold: { blue: 1500, red: 1500 },
      turrets: { blue: 6, red: 6 },
      turtles: { blue: 0, red: 0 },
      lords: { blue: 0, red: 0 },
      litho: {
        x: 400,
        y: 240,
        hp: 1100,
        maxHp: 1100,
        alive: true,
        respawnTimer: 0
      },
      objective: {
        type: 'turtle' as 'turtle' | 'lord' | 'enhanced_lord',
        status: 'spawning' as 'spawning' | 'alive' | 'dead',
        timer: 120,
        hp: 4500,
        maxHp: 4500,
        x: 400,
        y: 280,
        killCount: 0
      },
      marchingLord: null as any,
      tactics: { blue: 'balanced', red: 'balanced' },
      tacticCooldown: 0,
      heroes: heroes.map(h => ({
        id: h.id,
        heroId: h.heroId,
        side: h.side,
        lane: h.lane,
        playerName: h.playerName,
        heroName: h.heroName,
        heroIcon: h.heroIcon,
        level: h.level,
        hp: h.hp,
        maxHp: h.maxHp,
        gold: h.gold,
        items: h.items,
        kda: { ...h.kda },
        isDead: h.isDead,
        respawnTimer: h.respawnTimer,
        damageDealt: h.damageDealt,
        damageTaken: h.damageTaken
      }))
    };

    let minions: any[] = [];
    let projectiles: any[] = [];
    let visualEffects: any[] = [];
    let damageNumbers: any[] = [];
    let isGameOver = false;
    let animationFrameId: number;

    const logCommentary = (text: string, type: CommentaryEntry['type'] = 'normal') => {
      const min = Math.floor(state.gameTime / 60);
      const sec = Math.floor(state.gameTime % 60).toString().padStart(2, '0');
      const entry: CommentaryEntry = { time: `${min}:${sec}`, text, type };
      setCommentaries(prev => [entry, ...prev.slice(0, 45)]);
    };

    logCommentary('⚔️ Match resmi dimulai! Welcome to the Land of Dawn!', 'highlight');
    logCommentary('🛡️ Minion telah bergerak ke tiga lane. Pertarungan laning dimulai!', 'normal');

    let lastTime = performance.now();
    let minionWaveTimer = 0;
    let tacticalEventTimer = 0;
    let nextEventInterval = 14 + Math.random() * 10;

    const loop = (now: number) => {
      const realDt = Math.min((now - lastTime) / 1000, 0.1) * (engineRef.current?.speed || 1);
      lastTime = now;
      const dt = realDt;

      if (!engineRef.current?.isPaused && !isGameOver) {
        state.gameTime += dt * 3.5;
        minionWaveTimer += dt * 3.5;
        tacticalEventTimer += dt * 3.5;

        // 1. Minion Wave Spawner with Super Minions if Inhibitor Turret is destroyed
        if (minionWaveTimer >= 25) {
          minionWaveTimer = 0;
          ['top', 'mid', 'bot'].forEach(l => {
            const path = (lanePaths as any)[l];
            
            const redInnerBroken = turrets.some(t => t.side === 'red' && t.lane === l && t.type === 'inner' && t.hp <= 0);
            const blueInnerBroken = turrets.some(t => t.side === 'blue' && t.lane === l && t.type === 'inner' && t.hp <= 0);

            minions.push({
              id: Math.random(),
              side: 'blue',
              lane: l,
              x: path[0].x,
              y: path[0].y,
              hp: redInnerBroken ? 920 : 380,
              maxHp: redInnerBroken ? 920 : 380,
              atk: redInnerBroken ? 75 : 32,
              isSuper: redInnerBroken,
              targetIdx: 1,
              path
            });

            minions.push({
              id: Math.random(),
              side: 'red',
              lane: l,
              x: path[path.length - 1].x,
              y: path[path.length - 1].y,
              hp: blueInnerBroken ? 920 : 380,
              maxHp: blueInnerBroken ? 920 : 380,
              atk: blueInnerBroken ? 75 : 32,
              isSuper: blueInnerBroken,
              targetIdx: path.length - 2,
              path
            });

            if (redInnerBroken) {
              logCommentary(`👾 SUPER MINION BIRU berbaris menyerbu ${l.toUpperCase()} Lane!`, 'highlight');
            }
            if (blueInnerBroken) {
              logCommentary(`👾 SUPER MINION MERAH berbaris menyerbu ${l.toUpperCase()} Lane!`, 'highlight');
            }
          });
        }

        // 2. Dynamic RNG Tactical Events (Rusuh Jungle Invade, Bush Trap Ambush, Cut Minion, Split Push, Side Gank)
        if (tacticalEventTimer >= nextEventInterval) {
          tacticalEventTimer = 0;
          nextEventInterval = 14 + Math.random() * 12; // Next event randomly occurs in 14-26 seconds

          const eventRoll = Math.random();
          const invadingSide = Math.random() > 0.5 ? 'blue' : 'red';
          const defendingSide = invadingSide === 'blue' ? 'red' : 'blue';

          if (eventRoll < 0.28 && state.objective.status !== 'alive') {
            // 🔥 Event: RUSUH JUNGLE INVADE (Serbuan Barbar ke Jungle Lawan)
            const enemyBuffs = jungleCamps.filter(c => c.side === defendingSide && c.alive);
            const targetCamp = enemyBuffs[0] || jungleCamps.find(c => c.side === defendingSide);

            if (targetCamp) {
              const invaders = heroes.filter(h => h.side === invadingSide && !h.isDead && (h.lane === 'Jungle' || h.lane === 'Roam' || h.lane === 'Mid'));
              invaders.forEach(h => {
                h.targetX = targetCamp.x + (Math.random() - 0.5) * 35;
                h.targetY = targetCamp.y + (Math.random() - 0.5) * 35;
              });

              // Defenders rush to protect their jungle
              const defenders = heroes.filter(h => h.side === defendingSide && !h.isDead && (h.lane === 'Jungle' || h.lane === 'Roam'));
              defenders.forEach(h => {
                h.targetX = targetCamp.x + (Math.random() - 0.5) * 40;
                h.targetY = targetCamp.y + (Math.random() - 0.5) * 40;
              });

              const invaderLeader = invaders[0];
              logCommentary(`🔥 RUSUH JUNGLE! ${invaderLeader?.playerName || 'Jungler'} & Roamer ${invadingSide.toUpperCase()} melakukan invasi barbar ke Jungle lawan untuk rusuh & curi ${targetCamp.name}!`, 'highlight');
              damageNumbers.push({ x: targetCamp.x, y: targetCamp.y - 30, text: '⚔️ JUNGLE INVADE!', color: '#e74c3c', life: 1.2 });
            }
          } else if (eventRoll < 0.50) {
            // 🌿 Event: TRAP SEMAK SUNGAI (Bush Ambush Trap)
            const randomBush = bushes[Math.floor(Math.random() * bushes.length)];
            const trappers = heroes.filter(h => h.side === invadingSide && !h.isDead && (h.lane === 'Roam' || h.lane === 'Mid' || h.lane === 'EXP'));
            trappers.forEach(h => {
              h.targetX = randomBush.x + (Math.random() - 0.5) * 20;
              h.targetY = randomBush.y + (Math.random() - 0.5) * 20;
            });
            const trapperLeader = trappers[0];
            logCommentary(`🌿 TRAP SEMAK! Skuad ${invadingSide.toUpperCase()} (${trapperLeader?.playerName || 'Roamer'}) bersembunyi di semak sungai menyiapkan surprise ambush!`, 'highlight');
          } else if (eventRoll < 0.68) {
            // ⚔️ Event: CUT MINION DI BELAKANG TURRET
            const expHero = heroes.find(h => h.side === invadingSide && h.lane === 'EXP' && !h.isDead);
            if (expHero) {
              const cutPos = invadingSide === 'blue' ? { x: 440, y: 110 } : { x: 260, y: 130 };
              expHero.targetX = cutPos.x;
              expHero.targetY = cutPos.y;
              logCommentary(`⚔️ CUT MINION! ${expHero.playerName} (${expHero.heroName}) agresif memotong gelombang minion di belakang turret lawan!`, 'highlight');
            }
          } else if (eventRoll < 0.82) {
            // 🏰 Event: SPLIT PUSH TURRET
            const pusher = heroes.find(h => h.side === invadingSide && (h.lane === 'Gold' || h.lane === 'EXP') && !h.isDead);
            if (pusher) {
              const pushLanePos = pusher.lane === 'Gold' 
                ? (invadingSide === 'blue' ? { x: 620, y: 400 } : { x: 340, y: 490 })
                : (invadingSide === 'blue' ? { x: 450, y: 120 } : { x: 160, y: 240 });
              pusher.targetX = pushLanePos.x;
              pusher.targetY = pushLanePos.y;
              logCommentary(`🏰 SPLIT PUSH! ${pusher.playerName} (${pusher.heroName}) melakukan manuver split push menekan Turret samping!`, 'highlight');
            }
          } else {
            // ⚡ Event: ROTASI GANKING KE GOLD / EXP LANE
            const targetLane = Math.random() > 0.5 ? 'Gold' : 'EXP';
            const targetGankPos = targetLane === 'Gold' ? { x: 510, y: 480 } : { x: 290, y: 130 };
            heroes.filter(h => !h.isDead && (h.lane === 'Jungle' || h.lane === 'Roam')).forEach(h => {
              h.targetX = targetGankPos.x + (h.side === 'blue' ? -35 : 35) + (Math.random() - 0.5) * 40;
              h.targetY = targetGankPos.y + (Math.random() - 0.5) * 40;
            });
            logCommentary(`⚡ Roamer dan Jungler melakukan rotasi ganking menyergap ${targetLane.toUpperCase()} LANE!`, 'highlight');
          }
        }

        // 3. Objective Timings (02:00 Turtle, 08:00 Lord, 12:00 Enhanced Lord)
        if (state.objective.status === 'spawning') {
          if (state.gameTime >= 720) { // 12:00+ Enhanced Lord
            state.objective.status = 'alive';
            state.objective.type = 'enhanced_lord';
            state.objective.hp = 13500;
            state.objective.maxHp = 13500;
            logCommentary('⚡ ENHANCED LORD TELAH BANGKIT DENGAN THUNDER CHARGE! Kontes penentuan kemenangan!', 'objective');
            heroes.filter(h => !h.isDead).forEach(h => {
              h.targetX = state.objective.x + (h.side === 'blue' ? -45 : 45) + (Math.random() - 0.5) * 50;
              h.targetY = state.objective.y + (Math.random() - 0.5) * 50;
            });
          } else if (state.gameTime >= 480) { // 08:00+ Lord
            state.objective.status = 'alive';
            state.objective.type = 'lord';
            state.objective.hp = 8800;
            state.objective.maxHp = 8800;
            logCommentary('👑 SANCTUARY LORD TELAH MUNCUL DI PIT RIVER! Kedua tim 5v5 bersiap kontes Lord!', 'objective');
            heroes.filter(h => !h.isDead).forEach(h => {
              h.targetX = state.objective.x + (h.side === 'blue' ? -45 : 45) + (Math.random() - 0.5) * 50;
              h.targetY = state.objective.y + (Math.random() - 0.5) * 50;
            });
          } else if (state.gameTime >= 120 && state.objective.killCount < 3 && state.gameTime < 480) { // Turtle (Maksimal 3 Kali sebelum 08:00)
            state.objective.status = 'alive';
            state.objective.type = 'turtle';
            state.objective.hp = 4600 + state.objective.killCount * 400;
            state.objective.maxHp = 4600 + state.objective.killCount * 400;
            const turtleNum = state.objective.killCount + 1;
            logCommentary(`🐢 TURTLE KE-${turtleNum} (Maksimal 3 Turtle) TELAH MUNCUL DI RIVER! Jungler & kedua tim berkumpul kontes Retribution!`, 'objective');
            heroes.filter(h => !h.isDead && h.lane !== 'Gold').forEach(h => {
              h.targetX = state.objective.x + (h.side === 'blue' ? -40 : 40) + (Math.random() - 0.5) * 40;
              h.targetY = state.objective.y + (Math.random() - 0.5) * 40;
            });
          }
        }

        // 4. Marching Lord Movement, Defense & Siege
        if (state.marchingLord) {
          const ml = state.marchingLord;
          const targetTurret = turrets.find(t => t.side !== ml.side && t.hp > 0 && t.lane === ml.lane);
          const targetBase = ml.side === 'blue' ? bases.red : bases.blue;
          const target = targetTurret ? { x: targetTurret.x, y: targetTurret.y } : { x: targetBase.x, y: targetBase.y };

          // Defending Heroes target and attack the Marching Lord!
          const defendingHeroes = heroes.filter(h => h.side !== ml.side && !h.isDead && Math.hypot(h.x - ml.x, h.y - ml.y) < 165);
          if (defendingHeroes.length > 0) {
            defendingHeroes.forEach(dh => {
              const dDmg = (dh.atk * 1.35) * dt;
              ml.hp -= dDmg;
              if (Math.random() < 0.08) {
                projectiles.push({
                  x: dh.x,
                  y: dh.y,
                  targetX: ml.x,
                  targetY: ml.y,
                  color: dh.side === 'blue' ? '#3498db' : '#e74c3c',
                  type: 'slash',
                  life: 0.2
                });
              }
            });
          }

          const dx = target.x - ml.x;
          const dy = target.y - ml.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 35) {
            ml.x += (dx / dist) * 45 * dt;
            ml.y += (dy / dist) * 45 * dt;
          } else {
            if (targetTurret) {
              // Turret attacks Lord
              ml.hp -= 260 * dt;
              // Lord attacks Turret
              targetTurret.hp -= 280 * dt;
              visualEffects.push({ type: 'shockwave', x: targetTurret.x, y: targetTurret.y, color: '#f39c12', radius: 28, life: 0.3 });
              if (targetTurret.hp <= 0) {
                targetTurret.hp = 0;
                state.turrets[targetTurret.side as 'blue' | 'red'] -= 1;
                logCommentary(`💥 Lord merobohkan Turret ${targetTurret.lane.toUpperCase()} milik ${targetTurret.side.toUpperCase()}!`, 'objective');
                audioMgr.playTurretDestroyed();
              }
            } else {
              // Base Crystal Defense Beam attacks Lord
              ml.hp -= 380 * dt;
              targetBase.hp -= 220 * dt;
              visualEffects.push({ type: 'shockwave', x: targetBase.x, y: targetBase.y, color: '#9b59b6', radius: 35, life: 0.3 });
            }
          }

          // Check if Defending Team Slays the Marching Lord!
          if (ml.hp <= 0) {
            const defSideName = ml.side === 'blue' ? draftResult.redTeam.shortName : draftResult.blueTeam.shortName;
            logCommentary(`🛡️ DEFENSE BERHASIL! Skuad ${defSideName} sukses menumbangkan Lord & menyelamatkan High Ground!`, 'highlight');
            visualEffects.push({ type: 'shockwave', x: ml.x, y: ml.y, color: '#2ecc71', radius: 50, life: 0.6 });
            damageNumbers.push({ x: ml.x, y: ml.y - 25, text: '🛡️ LORD DEFEATED (DEFENSE SUKSES)!', color: '#2ecc71', life: 1.3 });
            state.marchingLord = null;
            // Cooldown before next Lord spawns (100 seconds)
            state.objective.status = 'spawning';
            state.objective.timer = 100;
          }
        }

        // 5. Update Minions
        for (let i = minions.length - 1; i >= 0; i--) {
          const m = minions[i];
          if (m.hp <= 0) {
            minions.splice(i, 1);
            continue;
          }

          const path = m.path;
          const targetPoint = path[m.targetIdx];
          if (targetPoint) {
            const dx = targetPoint.x - m.x;
            const dy = targetPoint.y - m.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 5) {
              m.x += (dx / dist) * 40 * dt;
              m.y += (dy / dist) * 40 * dt;
            } else {
              if (m.side === 'blue' && m.targetIdx < path.length - 1) m.targetIdx++;
              else if (m.side === 'red' && m.targetIdx > 0) m.targetIdx--;
            }
          }

          const enemyMinions = minions.filter(em => em.side !== m.side && Math.hypot(em.x - m.x, em.y - m.y) < 35);
          if (enemyMinions.length > 0) {
            enemyMinions[0].hp -= m.atk * dt;
          }
        }

        // 6. Update Turrets
        turrets.forEach(t => {
          if (t.hp <= 0) return;

          const hostileMinions = minions.filter(m => m.side !== t.side && Math.hypot(m.x - t.x, m.y - t.y) < 75);
          const hostileHeroes = heroes.filter(h => h.side !== t.side && !h.isDead && Math.hypot(h.x - t.x, h.y - t.y) < 75);

          const target = hostileMinions[0] || hostileHeroes[0];
          if (target && now - t.lastAttack > 700) {
            t.lastAttack = now;
            target.hp -= 240;
            projectiles.push({
              x: t.x,
              y: t.y,
              targetX: target.x,
              targetY: target.y,
              color: t.side === 'blue' ? '#3498db' : '#e74c3c',
              type: 'laser',
              life: 0.2
            });

            if (target.hp <= 0 && (target as any).heroId) {
              logCommentary(`⚡ Turret menumbangkan ${(target as any).playerName}!`, 'kill');
            }
          }
        });

        // Update Jungle Camps respawn
        jungleCamps.forEach(camp => {
          if (!camp.alive) {
            camp.respawnTimer -= dt * 3.5;
            if (camp.respawnTimer <= 0) {
              camp.alive = true;
              camp.hp = camp.maxHp;
              logCommentary(`🌲 ${camp.name} ${camp.side.toUpperCase()} telah respawn di Jungle!`, 'normal');
            }
          }
        });

        // 7. Update Heroes (Gold, Items, CC, Buff Aura, Active Legendary Items, Combat, Recall, Buff Farming)
        heroes.forEach(h => {
          // Immortality Revive handling
          if (h.isReviving) {
            h.reviveTimer -= dt;
            if (h.reviveTimer <= 0) {
              h.isReviving = false;
              h.hp = Math.round(h.maxHp * 0.28);
              h.shield = 600;
              visualEffects.push({ type: 'shockwave', x: h.x, y: h.y, color: '#f1c40f', radius: 45, life: 0.4 });
              damageNumbers.push({ x: h.x, y: h.y - 30, text: '🛡️ REVIVED!', color: '#f1c40f', life: 1.0 });
              logCommentary(`✨ IMMORTALITY! ${h.playerName} (${h.heroName}) bangkit kembali dari kematian!`, 'highlight');
            }
            return;
          }

          // Winter Crown Freeze timer
          if (h.isFrozenInvulnerable) {
            h.frozenTimer -= dt;
            if (h.frozenTimer <= 0) {
              h.isFrozenInvulnerable = false;
            }
            return;
          }

          // Wind of Nature timer
          if (h.wonActive) {
            h.wonTimer -= dt;
            if (h.wonTimer <= 0) {
              h.wonActive = false;
            }
          }

          if (h.isDead) {
            h.respawnTimer -= dt * 1.5;
            if (h.respawnTimer <= 0) {
              h.isDead = false;
              h.hp = h.maxHp;
              h.x = h.baseX;
              h.y = h.baseY;
              logCommentary(`${h.playerName} (${h.heroName}) telah respawn dan kembali ke arena!`);
            }
            return;
          }

          // Recall handling (Teleport to Fountain & Restore 100% HP)
          if (h.isRecalling) {
            h.recallTimer -= dt;
            if (h.recallTimer <= 0) {
              h.isRecalling = false;
              h.x = h.baseX;
              h.y = h.baseY;
              h.hp = h.maxHp;
              h.shield = 400;
              damageNumbers.push({ x: h.x, y: h.y - 28, text: '🛡️ RECALL COMPLETE (100% HP)', color: '#00cec9', life: 1.0 });
              logCommentary(`💨 ${h.playerName} (${h.heroName}) selesai RECALL ke Base & siap kembali ke lane!`, 'normal');
              h.targetX = h.laneTarget.x;
              h.targetY = h.laneTarget.y;
            }
            return;
          }

          // Buff Aura rotation
          h.buffAuraAngle = (h.buffAuraAngle || 0) + 3.5 * dt;

          // Crowd Control Stun duration timer
          if (h.ccTimer > 0) {
            h.ccTimer -= dt;
            if (h.ccTimer <= 0) {
              h.ccStatus = null;
            }
            return;
          }

          // Passive Gold & Level Scaling
          h.gold += Math.round(dt * 24);
          state.gold[h.side as 'blue' | 'red'] += Math.round(dt * 24);
          h.level = Math.min(15, 1 + Math.floor(h.gold / 720));

          // Real MLBB Item Purchases based on Gold
          const purchasedItems = getHeroPurchasedItems(h.hero.role, h.gold);
          if (purchasedItems.length > h.items.length) {
            const newItem = purchasedItems[purchasedItems.length - 1];
            logCommentary(`🛍️ ${h.playerName} (${h.heroName}) membeli item [${newItem.name}]!`, 'normal');
          }
          h.items = purchasedItems;

          // Item stat bonuses
          let itemAtkBonus = 0;
          let itemHpBonus = 0;
          let itemArmorBonus = 0;
          h.items.forEach((it: MLBBItem) => {
            if (it.stats.atk) itemAtkBonus += it.stats.atk;
            if (it.stats.magic) itemAtkBonus += it.stats.magic * 0.85;
            if (it.stats.hp) itemHpBonus += it.stats.hp;
            if (it.stats.armor) itemArmorBonus += it.stats.armor;
          });

          const buffBonus = (h.hasRedBuff ? 20 : 0);
          h.maxHp = 1450 + (h.level * 180) + (h.hero.stats.frontline * 10) + itemHpBonus;
          h.atk = 110 + (h.level * 20) + (h.hero.stats.burst * 1.3) + itemAtkBonus + buffBonus;

          // Bush Camouflage / Stealth
          const nearBush = bushes.some(b => Math.hypot(b.x - h.x, b.y - h.y) < 22);
          h.inBush = nearBush;

          // Find nearest living enemy hero
          const livingEnemies = heroes.filter(e => e.side !== h.side && !e.isDead && !e.isReviving);
          let nearestEnemy: any = null;
          let minEnemyDist = Infinity;

          livingEnemies.forEach(e => {
            const d = Math.hypot(e.x - h.x, e.y - h.y);
            if (d < minEnemyDist) {
              minEnemyDist = d;
              nearestEnemy = e;
            }
          });

          // 🛡️ SMART RETREAT & RECALL AI: Low HP (<20%) retreats towards friendly turret
          if (h.hp < h.maxHp * 0.20 && !h.isRecalling) {
            const friendlyTurrets = turrets.filter(t => t.side === h.side && t.hp > 0);
            const safeTarget = friendlyTurrets[0] || { x: h.baseX, y: h.baseY };
            h.targetX = safeTarget.x;
            h.targetY = safeTarget.y;

            const distToSafe = Math.hypot(safeTarget.x - h.x, safeTarget.y - h.y);
            if (distToSafe < 50 && (!nearestEnemy || minEnemyDist > 100)) {
              h.isRecalling = true;
              h.recallTimer = 4.0;
              damageNumbers.push({ x: h.x, y: h.y - 25, text: '🛡️ RECALLING...', color: '#00cec9', life: 0.8 });
              logCommentary(`💨 ${h.playerName} (${h.heroName}) mundur ke turret & RECALL ke Base!`, 'normal');
              return;
            }
          }

          // Jungler Buff Farming: Prioritize alive jungle camps before ganking
          if (h.lane === 'Jungle') {
            const teamBuffs = jungleCamps.filter(c => c.side === h.side && c.alive);
            if (teamBuffs.length > 0 && (!nearestEnemy || minEnemyDist > 140) && state.objective.status !== 'alive') {
              const targetBuff = teamBuffs[0];
              h.targetX = targetBuff.x;
              h.targetY = targetBuff.y;

              const distToCamp = Math.hypot(targetBuff.x - h.x, targetBuff.y - h.y);
              if (distToCamp < 45 && now - h.lastAttackTime > 750) {
                h.lastAttackTime = now;
                targetBuff.hp -= (h.atk * 1.5);
                projectiles.push({
                  x: h.x,
                  y: h.y,
                  targetX: targetBuff.x,
                  targetY: targetBuff.y,
                  color: targetBuff.type === 'blue' ? '#2980b9' : '#e74c3c',
                  type: 'slash',
                  life: 0.2
                });

                if (targetBuff.hp <= 0) {
                  targetBuff.hp = 0;
                  targetBuff.alive = false;
                  targetBuff.respawnTimer = 60;
                  if (targetBuff.type === 'blue') h.hasBlueBuff = true;
                  if (targetBuff.type === 'red') h.hasRedBuff = true;
                  h.gold += 240;
                  state.gold[h.side as 'blue' | 'red'] += 240;
                  visualEffects.push({ type: 'shockwave', x: targetBuff.x, y: targetBuff.y, color: targetBuff.type === 'blue' ? '#3498db' : '#e74c3c', radius: 35, life: 0.35 });
                  damageNumbers.push({ x: h.x, y: h.y - 25, text: `✨ ${targetBuff.name.toUpperCase()} SECURED! (+240g)`, color: '#f1c40f', life: 1.0 });
                  logCommentary(`🌲 ${h.playerName} (${h.heroName}) menumbangkan ${targetBuff.name} & mengamankan Jungle Buff!`, 'highlight');
                  h.targetX = h.laneTarget.x;
                  h.targetY = h.laneTarget.y;
                }
              }
            }
          }

          // Laner Minion Wave Farming
          if (h.lane !== 'Jungle') {
            const nearbyEnemyMinions = minions.filter(m => m.side !== h.side && Math.hypot(m.x - h.x, m.y - h.y) < 110);
            if (nearbyEnemyMinions.length > 0 && (!nearestEnemy || minEnemyDist > 85)) {
              const targetMinion = nearbyEnemyMinions[0];
              if (now - h.lastAttackTime > 800) {
                h.lastAttackTime = now;
                targetMinion.hp -= h.atk * 1.1;
                projectiles.push({
                  x: h.x,
                  y: h.y,
                  targetX: targetMinion.x,
                  targetY: targetMinion.y,
                  color: h.side === 'blue' ? '#3498db' : '#e74c3c',
                  type: 'slash',
                  life: 0.2
                });
                if (targetMinion.hp <= 0) {
                  h.gold += targetMinion.isSuper ? 130 : 65;
                  state.gold[h.side as 'blue' | 'red'] += targetMinion.isSuper ? 130 : 65;
                }
              }
            }
          }

          // Surprise Bush Ambush
          if (h.inBush && nearestEnemy && minEnemyDist < 75) {
            h.inBush = false;
            visualEffects.push({ type: 'shockwave', x: h.x, y: h.y, color: '#2ecc71', radius: 35, life: 0.35 });
            damageNumbers.push({
              x: h.x,
              y: h.y - 30,
              text: '⚡ SURPRISE AMBUSH!',
              color: '#2ecc71',
              life: 0.9
            });
            logCommentary(`🌿 AMBUSH! ${h.playerName} (${h.heroName}) menyergap dari semak-semak!`, 'highlight');
          }

          // Trigger Winter Crown if low HP
          const hasWinter = h.items.some((it: MLBBItem) => it.id === 'winter_crown');
          if (hasWinter && !h.winterCrownUsed && h.hp < h.maxHp * 0.25) {
            h.winterCrownUsed = true;
            h.isFrozenInvulnerable = true;
            h.frozenTimer = 2.0;
            damageNumbers.push({ x: h.x, y: h.y - 25, text: '❄️ WINTER CROWN!', color: '#74b9ff', life: 1.0 });
            logCommentary(`❄️ WINTER CROWN! ${h.playerName} membekukan diri kebal dari semua serangan!`, 'highlight');
            return;
          }

          // Trigger Wind of Nature (WoN) for Marksman
          const hasWoN = h.items.some((it: MLBBItem) => it.id === 'wind_of_nature');
          if (hasWoN && !h.wonActive && h.hp < h.maxHp * 0.35 && h.hero.role === 'Marksman') {
            h.wonActive = true;
            h.wonTimer = 2.0;
            damageNumbers.push({ x: h.x, y: h.y - 25, text: '🍃 WIND OF NATURE!', color: '#2ecc71', life: 1.0 });
            logCommentary(`🍃 WIND OF NATURE! ${h.playerName} kebal terhadap Physical Damage!`, 'normal');
          }

          // Battle Spells (Flicker on low HP, Purify/Vengeance/Aegis)
          if (h.hp < h.maxHp * 0.32 && now - h.lastSpellTime > 16000) {
            h.lastSpellTime = now;
            if (h.battleSpell === 'Flicker') {
              const escapeX = h.side === 'blue' ? h.x - 50 : h.x + 50;
              const escapeY = h.side === 'blue' ? h.y + 50 : h.y - 50;
              visualEffects.push({ type: 'flicker_flash', x: h.x, y: h.y, color: '#f1c40f', life: 0.3 });
              h.x = escapeX;
              h.y = escapeY;
              damageNumbers.push({ x: h.x, y: h.y - 25, text: '⚡ FLICKER!', color: '#f1c40f', life: 0.8 });
              logCommentary(`💨 ${h.playerName} (${h.heroName}) menggunakan FLICKER untuk melarikan diri!`, 'normal');
            } else if (h.battleSpell === 'Purify') {
              h.shield = 400;
              h.ccStatus = null;
              h.ccTimer = 0;
              visualEffects.push({ type: 'shockwave', x: h.x, y: h.y, color: '#f1c40f', radius: 30, life: 0.3 });
              damageNumbers.push({ x: h.x, y: h.y - 25, text: '🌟 PURIFY & SHIELD!', color: '#f1c40f', life: 0.8 });
            } else if (h.battleSpell === 'Vengeance' || h.battleSpell === 'Aegis') {
              h.shield = 600;
              visualEffects.push({ type: 'shockwave', x: h.x, y: h.y, color: '#e74c3c', radius: 32, life: 0.3 });
              damageNumbers.push({ x: h.x, y: h.y - 25, text: '🛡️ VENGEANCE / AEGIS!', color: '#e74c3c', life: 0.8 });
            }
          }

          // Dynamic Movement (Smooth & Tactical with Laning Discipline)
          const isFleeing = h.hp < h.maxHp * 0.30;
          if (isFleeing) {
            const dx = h.targetX - h.x;
            const dy = h.targetY - h.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 8) {
              const speedPx = 95 * dt;
              h.x += (dx / dist) * speedPx;
              h.y += (dy / dist) * speedPx;
            }
          } else if (state.gameTime < 120 && h.lane !== 'Jungle') {
            // Early Game: Laners hold lane position
            const dx = h.laneTarget.x - h.x;
            const dy = h.laneTarget.y - h.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 8) {
              const speedPx = 75 * dt;
              h.x += (dx / dist) * speedPx;
              h.y += (dy / dist) * speedPx;
            }
          } else if (nearestEnemy && minEnemyDist < 120) {
            const dx = nearestEnemy.x - h.x;
            const dy = nearestEnemy.y - h.y;
            const chaseSpeed = 80 * dt;
            if (minEnemyDist > 55) {
              h.x += (dx / minEnemyDist) * chaseSpeed;
              h.y += (dy / minEnemyDist) * chaseSpeed;
            }
          } else {
            const dx = h.targetX - h.x;
            const dy = h.targetY - h.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 8) {
              const speedPx = 75 * dt;
              h.x += (dx / dist) * speedPx;
              h.y += (dy / dist) * speedPx;
            }
          }

          // Base Fountain Healing Regeneration (+300 HP/s)
          const distToBase = Math.hypot(h.x - h.baseX, h.y - h.baseY);
          if (distToBase < 45 && h.hp < h.maxHp) {
            h.hp = Math.min(h.maxHp, h.hp + 350 * dt);
            if (Math.random() < 0.05) {
              damageNumbers.push({ x: h.x, y: h.y - 20, text: '✨ HEAL +350', color: '#2ecc71', life: 0.4 });
            }
          }

          // Lithowanderer River Crab Contest
          if (state.litho.alive) {
            const distToLitho = Math.hypot(h.x - state.litho.x, h.y - state.litho.y);
            if (distToLitho < 85 && (!nearestEnemy || minEnemyDist > 90) && now - h.lastAttackTime > 750) {
              h.lastAttackTime = now;
              state.litho.hp -= (h.atk * 1.3);
              projectiles.push({
                x: h.x,
                y: h.y,
                targetX: state.litho.x,
                targetY: state.litho.y,
                color: '#2ecc71',
                type: 'slash',
                life: 0.2
              });

              if (state.litho.hp <= 0) {
                state.litho.hp = 0;
                state.litho.alive = false;
                state.litho.respawnTimer = 65;
                audioMgr.playLithoSlain();
                h.hasLithoBuff = true;
                h.hp = Math.min(h.maxHp, h.hp + 450);
                h.gold += 120;
                state.gold[h.side as 'blue' | 'red'] += 120;
                visualEffects.push({ type: 'shockwave', x: state.litho.x, y: state.litho.y, color: '#2ecc71', radius: 30, life: 0.3 });
                damageNumbers.push({ x: state.litho.x, y: state.litho.y - 25, text: '🦎 LITHO SECURED! (+120g)', color: '#2ecc71', life: 1.0 });
                logCommentary(`🦎 LITHOWANDERER! ${h.playerName} (${h.heroName}) mengamankan Lithowanderer di sungai! HP pulih & speed bertambah!`, 'highlight');
              }
            }
          }

          // Marksman Kiting & Orb-Walking
          if (h.hero.role === 'Marksman' && nearestEnemy && minEnemyDist < 75) {
            const kdx = nearestEnemy.x - h.x;
            const kdy = nearestEnemy.y - h.y;
            h.x -= (kdx / minEnemyDist) * 28 * dt;
            h.y -= (kdy / minEnemyDist) * 28 * dt;
          }

          // Combat Attack Execution with Realistic Cooldowns & Armor Mitigation
          const attackRange = h.hero.role === 'Marksman' || h.hero.role === 'Mage' ? 135 : 70;
          const isEnemy = h.side !== userSide;
          const combatMult = isEnemy && draftResult.difficultyCondition ? draftResult.difficultyCondition.aiCombatMultiplier : 1.0;
          const attackIntervalMs = h.hero.role === 'Marksman' ? 750 : h.hero.role === 'Assassin' ? 800 : h.hero.role === 'Mage' ? 900 : 1050;

          if (nearestEnemy && minEnemyDist <= attackRange && now - h.lastAttackTime > attackIntervalMs && !nearestEnemy.isFrozenInvulnerable) {
            h.lastAttackTime = now;

            // Skill Miss / Dodging Animation (High Mobility Heroes)
            const isMobileHero = ['Assassin', 'Fighter'].includes(nearestEnemy.hero.role);
            if (isMobileHero && Math.random() < 0.10) {
              audioMgr.playDodge();
              damageNumbers.push({ x: nearestEnemy.x, y: nearestEnemy.y - 20, text: '⚡ DODGE!', color: '#bdc3c7', life: 0.6 });
              visualEffects.push({ type: 'shockwave', x: nearestEnemy.x, y: nearestEnemy.y, color: '#ecf0f1', radius: 25, life: 0.2 });
              return;
            }

            // Passive Item Stacks Counter (War Axe & Brute Force)
            if (h.items.some((it: MLBBItem) => it.id === 'war_axe')) {
              h.warAxeStacks = Math.min(8, (h.warAxeStacks || 0) + 1);
            }
            if (h.items.some((it: MLBBItem) => it.id === 'brute_force_breastplate')) {
              h.bruteForceStacks = Math.min(5, (h.bruteForceStacks || 0) + 1);
            }

            // Tower Diving Aggression Alert
            const inEnemyTurret = turrets.some(t => t.side !== h.side && t.hp > 0 && Math.hypot(t.x - nearestEnemy.x, t.y - nearestEnemy.y) < 75);
            if (inEnemyTurret && nearestEnemy.hp < nearestEnemy.maxHp * 0.22) {
              damageNumbers.push({ x: h.x, y: h.y - 28, text: '🏰 TOWER DIVE!', color: '#e74c3c', life: 0.8 });
            }

            // Realistic Armor Reduction Formula: 100 / (100 + targetArmor)
            const targetArmor = 20 + nearestEnemy.level * 3;
            const dmgReduction = 100 / (100 + targetArmor);
            const isCrit = Math.random() < 0.25;
            const baseDmg = h.atk + Math.random() * 25;
            let dmg = Math.round((isCrit ? baseDmg * 1.75 : baseDmg) * dmgReduction * combatMult);

            if (nearestEnemy.wonActive && h.hero.damageType === 'Physical') {
              dmg = 0;
              damageNumbers.push({ x: nearestEnemy.x, y: nearestEnemy.y - 14, text: 'IMMUNE', color: '#2ecc71', life: 0.5 });
            }

            // Ultimate Skill Cast & Burst Damage Trigger
            if (now - h.lastUltTime > 12000) {
              h.lastUltTime = now;
              const ultColor = h.hero.role === 'Mage' ? '#9b59b6' : h.hero.role === 'Assassin' ? '#e74c3c' : h.hero.role === 'Tank' ? '#f39c12' : '#3498db';
              const ultBurst = Math.round((280 + h.level * 45 + h.hero.stats.burst * 2.2) * dmgReduction);
              dmg += ultBurst;

              visualEffects.push({
                type: 'ult_circle',
                x: nearestEnemy.x,
                y: nearestEnemy.y,
                color: ultColor,
                radius: 45,
                life: 0.5
              });
              damageNumbers.push({
                x: h.x,
                y: h.y - 32,
                text: `💥 [ULTIMATE ${h.heroName.toUpperCase()}] (+${ultBurst})`,
                color: '#f1c40f',
                life: 0.9
              });

              if (h.hero.role === 'Tank' || h.hero.role === 'Support' || h.hero.role === 'Mage') {
                nearestEnemy.ccStatus = 'stunned';
                nearestEnemy.ccTimer = 1.3;
                damageNumbers.push({
                  x: nearestEnemy.x,
                  y: nearestEnemy.y - 28,
                  text: '💫 STUNNED!',
                  color: '#f39c12',
                  life: 1.0
                });
                logCommentary(`💫 CROWD CONTROL! ${h.playerName} memberikan efek STUN kepada ${nearestEnemy.playerName}!`, 'highlight');
              }
            }

            // Cancel enemy recall if they take damage
            if (nearestEnemy.isRecalling) {
              nearestEnemy.isRecalling = false;
              nearestEnemy.recallTimer = 0;
              damageNumbers.push({ x: nearestEnemy.x, y: nearestEnemy.y - 18, text: '❌ RECALL CANCELLED!', color: '#e74c3c', life: 0.7 });
            }

            nearestEnemy.hp -= dmg;
            h.damageDealt += dmg;
            nearestEnemy.damageTaken += dmg;

            projectiles.push({
              x: h.x,
              y: h.y,
              targetX: nearestEnemy.x,
              targetY: nearestEnemy.y,
              color: h.hero.role === 'Mage' ? '#9b59b6' : h.hero.role === 'Marksman' ? '#f39c12' : '#00cec9',
              type: h.hero.role === 'Marksman' || h.hero.role === 'Mage' ? 'missile' : 'slash',
              life: 0.25
            });

            if (dmg > 0) {
              damageNumbers.push({
                x: nearestEnemy.x + (Math.random() - 0.5) * 22,
                y: nearestEnemy.y - 14,
                text: `${isCrit ? 'CRIT ' : ''}-${dmg}`,
                color: isCrit ? '#f1c40f' : h.side === 'blue' ? '#3498db' : '#e74c3c',
                life: 0.7
              });
            }

            // Immortality Trigger Check on Fatal Blow
            if (nearestEnemy.hp <= 0 && !nearestEnemy.isDead && !nearestEnemy.isReviving) {
              const hasImmortality = nearestEnemy.items.some((it: MLBBItem) => it.id === 'immortality');
              if (hasImmortality && !nearestEnemy.immortalityUsed) {
                nearestEnemy.immortalityUsed = true;
                nearestEnemy.isReviving = true;
                nearestEnemy.reviveTimer = 2.0;
                nearestEnemy.hp = 0;
                damageNumbers.push({
                  x: nearestEnemy.x,
                  y: nearestEnemy.y - 30,
                  text: '🛡️ IMMORTALITY REVIVE!',
                  color: '#f1c40f',
                  life: 1.2
                });
                logCommentary(`🛡️ IMMORTALITY! ${nearestEnemy.playerName} (${nearestEnemy.heroName}) memasuki fase revive!`, 'highlight');
                return;
              }

              // Real Kill Execution
              nearestEnemy.isDead = true;
              nearestEnemy.hp = 0;
              nearestEnemy.kda.d += 1;
              nearestEnemy.respawnTimer = Math.min(55, 12 + nearestEnemy.level * 2.8);
              
              // Reset victim's streaks upon death
              const victimSpree = nearestEnemy.spreeStreak || nearestEnemy.streak || 0;
              nearestEnemy.streak = 0;
              nearestEnemy.spreeStreak = 0;
              nearestEnemy.multiKillChain = 0;

              h.kda.k += 1;
              h.gold += 320;
              state.score[h.side as 'blue' | 'red'] += 1;

              // Multi-Kill Combo Window (Max 10 seconds between kills for Double/Triple/Maniac/Savage)
              const timeSinceLastKill = now - (h.lastKillTime || 0);
              if (timeSinceLastKill <= 10000) {
                h.multiKillChain = (h.multiKillChain || 0) + 1;
              } else {
                h.multiKillChain = 1;
              }
              h.lastKillTime = now;

              // Spree Streak (Lifetime kills without dying)
              h.spreeStreak = (h.spreeStreak || 0) + 1;
              h.streak = h.spreeStreak;

              // 2. Taunting & Recall Tas-Tas (50% chance on kill)
              if (Math.random() < 0.65) {
                h.isTauntingTasTas = true;
                audioMgr.playTauntTasTas();
                damageNumbers.push({ x: h.x, y: h.y - 32, text: '⚡ TAS-TAS-TAS! 😜', color: '#f1c40f', life: 1.1 });
                logCommentary(`😜 RECALL TAS-TAS! ${h.playerName} (${h.heroName}) melakukan taunting tas-tas di depan jenazah lawan!`, 'normal');
                setTimeout(() => { h.isTauntingTasTas = false; }, 1200);
              }

              // Assists distribution
              heroes.filter(t => t.side === h.side && t.id !== h.id && !t.isDead).forEach(tm => {
                if (Math.hypot(tm.x - nearestEnemy.x, tm.y - nearestEnemy.y) < 270) {
                  tm.kda.a += 1;
                  tm.gold += 160;
                }
              });

              // 12. Kill Banner & Announcer SFX
              let killTitle = 'ELIMINATED';
              let killSub = '';
              const totalKills = state.score.blue + state.score.red;

              if (totalKills === 1) {
                killTitle = 'FIRST BLOOD';
                killSub = 'First Blood Diamankan!';
                logCommentary(`🩸 FIRST BLOOD! ${h.playerName} (${h.heroName}) menumbangkan ${nearestEnemy.playerName} (${nearestEnemy.heroName})!`, 'kill');
                audioMgr.playFirstBlood();
              } else if (h.multiKillChain === 2) {
                killTitle = 'DOUBLE KILL';
                killSub = 'Double Kill!';
                logCommentary(`⚡ DOUBLE KILL! ${h.playerName} (${h.heroName}) membukukan Double Kill!`, 'kill');
                audioMgr.playDoubleKill();
              } else if (h.multiKillChain === 3) {
                killTitle = 'TRIPLE KILL';
                killSub = 'Triple Kill!';
                logCommentary(`🔥 TRIPLE KILL! ${h.playerName} (${h.heroName}) membantai pertahanan musuh!`, 'kill');
                audioMgr.playTripleKill();
              } else if (h.multiKillChain === 4) {
                killTitle = 'MANIAC';
                killSub = 'Maniac!';
                logCommentary(`💥 MANIAC! ${h.playerName} (${h.heroName}) MENDAPATKAN MANIAC!`, 'kill');
                audioMgr.playManiac();
              } else if (h.multiKillChain >= 5) {
                killTitle = 'SAVAGE';
                killSub = 'Savage!';
                logCommentary(`🌟 SAVAGE! ${h.playerName} (${h.heroName}) MENCETAK SAVAGE SENSASIONAL!`, 'kill');
                audioMgr.playSavage();
              } else if (h.spreeStreak === 3) {
                killTitle = 'KILLING SPREE';
                killSub = 'Killing Spree!';
                logCommentary(`🔥 KILLING SPREE! ${h.playerName} (${h.heroName}) sedang on fire!`, 'kill');
              } else if (h.spreeStreak === 4) {
                killTitle = 'MEGA KILL';
                killSub = 'Mega Kill!';
                logCommentary(`🔥 MEGA KILL! Dominasi ${h.playerName} tak terbendung!`, 'kill');
              } else if (h.spreeStreak === 5) {
                killTitle = 'UNSTOPPABLE';
                killSub = 'Unstoppable!';
                logCommentary(`💥 UNSTOPPABLE! ${h.playerName} tak bisa dihentikan!`, 'kill');
              } else if (h.spreeStreak === 6) {
                killTitle = 'MONSTER KILL';
                killSub = 'Monster Kill!';
                logCommentary(`💥 MONSTER KILL! ${h.playerName} mengamuk di Land of Dawn!`, 'kill');
              } else if (h.spreeStreak === 7) {
                killTitle = 'GODLIKE';
                killSub = 'Godlike!';
                logCommentary(`👑 GODLIKE! ${h.playerName} mencapai level Godlike!`, 'kill');
              } else if (h.spreeStreak >= 8) {
                killTitle = 'LEGENDARY';
                killSub = 'Legendary!';
                logCommentary(`🌟 LEGENDARY! ${h.playerName} mencatatkan gelar LEGENDARY!`, 'kill');
              } else {
                logCommentary(`⚔️ ${h.playerName} (${h.heroName}) mengeliminasi ${nearestEnemy.playerName} (${nearestEnemy.heroName})!`, 'kill');
              }

              if (victimSpree >= 3) {
                logCommentary(`🛡️ SHUT DOWN! Dominasi ${nearestEnemy.playerName} (${victimSpree} kill streak) dihentikan oleh ${h.playerName}!`, 'kill');
                audioMgr.playShutdown();
              }

              // 13. Wipeout & Ace Celebration Check
              const deadEnemies = heroes.filter(x => x.side === nearestEnemy.side && x.isDead).length;
              if (deadEnemies >= 5) {
                audioMgr.playWipeout();
                killTitle = '💥 WIPEOUT! ALL 5 SLAIN!';
                logCommentary(`💥 APA YANG TERJADI SAUDARA-SAUDARA?! WIPEOUT! SELURUH SKUAD ${nearestEnemy.side.toUpperCase()} RATA TUMBANG! PUSH SEKARANG!`, 'kill');
              }

              setActiveKillBanner({
                killer: { name: h.playerName, heroName: h.heroName, heroId: h.heroId, side: h.side },
                victim: { name: nearestEnemy.playerName, heroName: nearestEnemy.heroName, heroId: nearestEnemy.heroId, side: nearestEnemy.side },
                title: killTitle,
                subtitle: killSub
              });

              setTimeout(() => {
                setActiveKillBanner(null);
              }, 2600);
            }
          }
        });

        // 8. Objective Contest (Turtle / Lord with Retribution Smite)
        if (state.objective.status === 'alive') {
          const nearHeroes = heroes.filter(h => !h.isDead && Math.hypot(h.x - state.objective.x, h.y - state.objective.y) < 120);
          if (nearHeroes.length > 0) {
            nearHeroes.forEach(h => {
              state.objective.hp -= (h.atk * 0.5) * dt;
            });

            const jungler = nearHeroes.find(h => h.lane === 'Jungle') || nearHeroes[0];
            if (jungler && state.objective.hp < 1800) {
              visualEffects.push({
                type: 'retri_lightning',
                x: state.objective.x,
                y: state.objective.y,
                color: '#f1c40f',
                life: 0.4
              });

              state.objective.hp = 0;
              state.objective.status = 'dead';
              state.objective.killCount++;
              const isLord = state.objective.type !== 'turtle';
              state[isLord ? 'lords' : 'turtles'][jungler.side as 'blue' | 'red'] += 1;

              if (isLord) {
                logCommentary(`👑 RETRIBUTION SENSASIONAL! ${jungler.playerName} (${jungler.heroName}) mengamankan Lord! Lord berbaris menuju base lawan!`, 'objective');
                audioMgr.playLordSlain();
                const isEnhanced = state.gameTime >= 720;
                const isAncient = state.gameTime >= 1080;
                const lordHp = isAncient ? 15000 : isEnhanced ? 10500 : 6800;

                state.marchingLord = {
                  side: jungler.side,
                  lane: 'mid',
                  x: state.objective.x,
                  y: state.objective.y,
                  hp: lordHp,
                  maxHp: lordHp
                };
              } else {
                const turtleNum = state.objective.killCount;
                logCommentary(`🐢 Turtle ke-${turtleNum} (dari maks 3 Turtle) berhasil diamankan oleh ${jungler.playerName} (${jungler.heroName})! Tim mendapatkan Shield & Gold!`, 'objective');
                audioMgr.playTurtleSlain();
                heroes.filter(tm => tm.side === jungler.side).forEach(tm => {
                  tm.shield = 500;
                });
              }

              setTimeout(() => {
                state.objective.status = 'spawning';
              }, 12000);
            }
          }
        }

        // 9. Turret Pushing with Backdoor Protection
        heroes.forEach(h => {
          if (h.isDead) return;
          const enemyTurrets = turrets.filter(t => t.side !== h.side && t.hp > 0 && Math.hypot(t.x - h.x, t.y - h.y) < 75);
          if (enemyTurrets.length > 0) {
            const t = enemyTurrets[0];
            
            const hasFriendlyMinions = minions.some(m => m.side === h.side && Math.hypot(m.x - t.x, m.y - t.y) < 130);
            t.hasBackdoorShield = !hasFriendlyMinions;
            const dmgMult = hasFriendlyMinions ? 1.0 : 0.25;

            t.hp -= (h.atk * 0.7 * dmgMult) * dt;

            if (!hasFriendlyMinions && Math.random() < 0.05) {
              damageNumbers.push({
                x: t.x,
                y: t.y - 25,
                text: '🛡️ BACKDOOR (-75%)',
                color: '#f1c40f',
                life: 0.7
              });
            }

            if (t.hp <= 0) {
              t.hp = 0;
              t.hasBackdoorShield = false;
              state.turrets[t.side as 'blue' | 'red'] -= 1;
              logCommentary(`🏰 TURRET HANCUR! ${h.playerName} merobohkan Turret ${t.lane.toUpperCase()} milik ${t.side.toUpperCase()}!`, 'objective');
              audioMgr.playTurretDestroyed();
            }
          }
        });

        // 10. Win Condition
        const blueDeadCount = heroes.filter(h => h.side === 'blue' && h.isDead).length;
        const redDeadCount = heroes.filter(h => h.side === 'red' && h.isDead).length;

        if (bases.red.hp <= 0 || (state.gameTime > 550 && redDeadCount >= 4 && state.score.blue >= 12)) {
          isGameOver = true;
          finishMatch('blue');
        } else if (bases.blue.hp <= 0 || (state.gameTime > 550 && blueDeadCount >= 4 && state.score.red >= 12)) {
          isGameOver = true;
          finishMatch('red');
        }
      }

      // --- RENDER 2D CANVAS ---
      ctx.fillStyle = '#0f2015';
      ctx.fillRect(0, 0, 800, 600);

      // Lanes
      ctx.strokeStyle = '#1d3b24';
      ctx.lineWidth = 38;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lanePaths.top[0].x, lanePaths.top[0].y);
      lanePaths.top.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.moveTo(lanePaths.mid[0].x, lanePaths.mid[0].y);
      lanePaths.mid.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.moveTo(lanePaths.bot[0].x, lanePaths.bot[0].y);
      lanePaths.bot.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // River
      ctx.fillStyle = 'rgba(41, 128, 185, 0.35)';
      ctx.beginPath();
      ctx.moveTo(220, 80); ctx.lineTo(660, 520); ctx.lineTo(580, 540); ctx.lineTo(140, 100);
      ctx.fill();

      // River Bushes
      ctx.fillStyle = '#1b5e20';
      bushes.forEach(b => {
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 22, 12, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Jungle Buff Camps with Monsters & Mini HP Bars
      jungleCamps.forEach(c => {
        if (c.alive) {
          ctx.fillStyle = c.type === 'blue' ? '#1e3799' : '#b71540';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = c.type === 'blue' ? '#00d2d3' : '#ff6b6b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Monster Glyph
          ctx.fillStyle = '#ffffff';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(c.type === 'blue' ? '👾' : '🦖', c.x, c.y + 4);

          // Mini Camp HP Bar
          ctx.fillStyle = '#222';
          ctx.fillRect(c.x - 14, c.y - 20, 28, 3.5);
          ctx.fillStyle = c.type === 'blue' ? '#00d2d3' : '#ff6b6b';
          ctx.fillRect(c.x - 14, c.y - 20, (c.hp / c.maxHp) * 28, 3.5);
        } else {
          // Respawn countdown ring
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#555';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#aaa';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.ceil(c.respawnTimer)}s`, c.x, c.y + 3);
        }
      });

      // Lithowanderer River Crab
      if (state.litho.alive) {
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(state.litho.x, state.litho.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🦎', state.litho.x, state.litho.y + 4);

        // Mini HP Bar
        ctx.fillStyle = '#222';
        ctx.fillRect(state.litho.x - 12, state.litho.y - 16, 24, 3);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(state.litho.x - 12, state.litho.y - 16, (state.litho.hp / state.litho.maxHp) * 24, 3);
      }

      // Bases
      ctx.fillStyle = '#2980b9';
      ctx.beginPath(); ctx.arc(bases.blue.x, bases.blue.y, 28, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6dd5fa'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BLUE BASE', bases.blue.x, bases.blue.y - 34);

      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.arc(bases.red.x, bases.red.y, 28, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ff7675'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('RED BASE', bases.red.x, bases.red.y + 40);

      // Turrets
      turrets.forEach(t => {
        if (t.hp <= 0) return;

        if (t.hasBackdoorShield) {
          ctx.save();
          ctx.strokeStyle = 'rgba(241, 196, 15, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 19, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.fillStyle = t.side === 'blue' ? '#3498db' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();

        ctx.fillStyle = '#222';
        ctx.fillRect(t.x - 14, t.y - 18, 28, 4);
        ctx.fillStyle = t.side === 'blue' ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(t.x - 14, t.y - 18, (t.hp / t.maxHp) * 28, 4);
      });

      // Minions
      minions.forEach(m => {
        ctx.fillStyle = m.side === 'blue' ? '#74b9ff' : '#ff7675';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.isSuper ? 7.5 : 4.5, 0, Math.PI * 2);
        ctx.fill();

        if (m.isSuper) {
          ctx.strokeStyle = '#f1c40f';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Objective Pit (Turtle / Lord)
      if (state.objective.status === 'alive') {
        const isLord = state.objective.type !== 'turtle';
        ctx.fillStyle = isLord ? '#8e44ad' : '#27ae60';
        ctx.beginPath(); ctx.arc(state.objective.x, state.objective.y, 26, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isLord ? '👑' : '🐢', state.objective.x, state.objective.y + 6);

        ctx.fillStyle = '#222';
        ctx.fillRect(state.objective.x - 24, state.objective.y - 34, 48, 6);
        ctx.fillStyle = isLord ? '#9b59b6' : '#2ecc71';
        ctx.fillRect(state.objective.x - 24, state.objective.y - 34, (state.objective.hp / state.objective.maxHp) * 48, 6);
      }

      // Marching Lord
      // Marching Lord with Live HP Bar & Defense Indicators
      if (state.marchingLord) {
        const ml = state.marchingLord;
        ctx.fillStyle = '#8e44ad';
        ctx.beginPath(); ctx.arc(ml.x, ml.y, 21, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = ml.side === 'blue' ? '#3498db' : '#e74c3c'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('👑 LORD', ml.x, ml.y + 4);

        // Marching Lord HP Bar
        ctx.fillStyle = '#222';
        ctx.fillRect(ml.x - 22, ml.y - 28, 44, 5);
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(ml.x - 22, ml.y - 28, Math.max(0, (ml.hp / ml.maxHp) * 44), 5);
      }

      // Projectiles
      projectiles.forEach((p, idx) => {
        p.life -= dt;
        if (p.life <= 0) {
          projectiles.splice(idx, 1);
          return;
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.type === 'laser' ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.targetX, p.targetY);
        ctx.stroke();
      });

      // Visual Effects (Ultimates, Retribution, Shockwaves, Flash)
      visualEffects.forEach((ve, idx) => {
        ve.life -= dt;
        if (ve.life <= 0) {
          visualEffects.splice(idx, 1);
          return;
        }
        if (ve.type === 'ult_circle') {
          ctx.strokeStyle = ve.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ve.x, ve.y, ve.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (ve.type === 'shockwave') {
          ctx.strokeStyle = ve.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ve.x, ve.y, ve.radius * (1 - ve.life), 0, Math.PI * 2);
          ctx.stroke();
        } else if (ve.type === 'flicker_flash') {
          ctx.fillStyle = 'rgba(241, 196, 15, 0.6)';
          ctx.beginPath();
          ctx.arc(ve.x, ve.y, 18, 0, Math.PI * 2);
          ctx.fill();
        } else if (ve.type === 'retri_lightning') {
          ctx.strokeStyle = '#f1c40f';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(ve.x, ve.y - 80);
          ctx.lineTo(ve.x + 10, ve.y - 40);
          ctx.lineTo(ve.x - 10, ve.y - 20);
          ctx.lineTo(ve.x, ve.y);
          ctx.stroke();
        }
      });

      // Render Heroes
      heroes.forEach(h => {
        if (h.isDead) return;

        // Immortality Revive Golden Cocoon
        if (h.isReviving) {
          ctx.fillStyle = 'rgba(241, 196, 15, 0.85)';
          ctx.beginPath();
          ctx.arc(h.x, h.y, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#000';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🛡️ REVIVE', h.x, h.y + 4);
          return;
        }

        // Winter Crown Ice Cube
        if (h.isFrozenInvulnerable) {
          ctx.fillStyle = 'rgba(116, 185, 255, 0.85)';
          ctx.fillRect(h.x - 16, h.y - 16, 32, 32);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(h.x - 16, h.y - 16, 32, 32);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('❄️ ICE', h.x, h.y + 4);
          return;
        }

        // Draw Recall animation
        if (h.isRecalling) {
          ctx.save();
          // Vertical light beam
          const gradient = ctx.createLinearGradient(h.x, h.y - 70, h.x, h.y + 10);
          gradient.addColorStop(0, 'rgba(0, 206, 201, 0)');
          gradient.addColorStop(0.5, 'rgba(0, 206, 201, 0.45)');
          gradient.addColorStop(1, 'rgba(0, 206, 201, 0.85)');
          ctx.fillStyle = gradient;
          ctx.fillRect(h.x - 12, h.y - 70, 24, 80);

          // Concentric magic ring at feet
          ctx.strokeStyle = '#00cec9';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(h.x, h.y + 6, 18, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#00cec9';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🛡️ RECALL...', h.x, h.y - 45);
          ctx.restore();
        }

        // Wind of Nature Green Shield Aura
        if (h.wonActive) {
          ctx.strokeStyle = 'rgba(46, 204, 113, 0.85)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(h.x, h.y, 20, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Buff auras
        if (h.hasBlueBuff) {
          ctx.save();
          ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(h.x, h.y + 6, 22, h.buffAuraAngle, h.buffAuraAngle + Math.PI * 1.5);
          ctx.stroke();
          ctx.restore();
        }
        if (h.hasRedBuff) {
          ctx.save();
          ctx.strokeStyle = 'rgba(231, 76, 60, 0.8)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(h.x, h.y + 6, 24, h.buffAuraAngle + Math.PI, h.buffAuraAngle + Math.PI * 2.5);
          ctx.stroke();
          ctx.restore();
        }

        // Apply Bush Stealth Alpha
        ctx.save();
        if (h.inBush) {
          ctx.globalAlpha = 0.45;
        }

        ctx.beginPath();
        ctx.arc(h.x, h.y, 16, 0, Math.PI * 2);
        ctx.clip();

        const img = heroImageCache[h.heroId];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, h.x - 16, h.y - 16, 32, 32);
        } else {
          ctx.fillStyle = h.side === 'blue' ? '#2980b9' : '#c0392b';
          ctx.fillRect(h.x - 16, h.y - 16, 32, 32);
        }
        ctx.restore();

        // Outer Ring
        ctx.save();
        if (h.inBush) ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.arc(h.x, h.y, 16, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = h.side === 'blue' ? '#3498db' : '#e74c3c';
        ctx.stroke();

        // Level Badge
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(h.x + 12, h.y + 12, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'black 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${h.level}`, h.x + 12, h.y + 14.5);

        // Name Tag
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${h.playerName} (${h.heroName})`, h.x, h.y - 20);

        // 1. Lithowanderer Speed & Healing Ring
        if (h.hasLithoBuff) {
          ctx.save();
          ctx.strokeStyle = 'rgba(46, 204, 113, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(h.x, h.y + 6, 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 2. Taunting Tas-Tas text
        if (h.isTauntingTasTas) {
          ctx.fillStyle = '#f1c40f';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ TAS-TAS! 😜', h.x, h.y - 34);
        }

        // 15. War Axe / Brute Force Stacks badge
        if (h.warAxeStacks > 0 || h.bruteForceStacks > 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(h.x - 14, h.y + 14, 28, 9);
          ctx.fillStyle = '#f1c40f';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          const txt = h.warAxeStacks > 0 ? `🗡️x${h.warAxeStacks}` : `🛡️x${h.bruteForceStacks}`;
          ctx.fillText(txt, h.x, h.y + 21);
        }

        // CC Stun Indicator
        if (h.ccStatus === 'stunned') {
          ctx.fillStyle = '#f1c40f';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('💫 STUN', h.x, h.y - 32);
        }

        // HP Bar
        ctx.fillStyle = '#111';
        ctx.fillRect(h.x - 18, h.y - 16, 36, 4.5);
        ctx.fillStyle = h.side === 'blue' ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(h.x - 18, h.y - 16, Math.max(0, (h.hp / h.maxHp) * 36), 4.5);
        if (h.shield > 0) {
          ctx.fillStyle = '#ecf0f1';
          ctx.fillRect(h.x - 18, h.y - 16, Math.min(36, (h.shield / 500) * 36), 4.5);
        }
        ctx.restore();
      });

      // Damage Numbers
      damageNumbers.forEach((d, idx) => {
        d.y -= 22 * dt;
        d.life -= dt;
        if (d.life <= 0) {
          damageNumbers.splice(idx, 1);
          return;
        }
        ctx.fillStyle = d.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.text, d.x, d.y);
      });

      setMatchState({
        ...state,
        heroes: heroes.map(h => ({
          id: h.id,
          heroId: h.heroId,
          side: h.side,
          lane: h.lane,
          playerName: h.playerName,
          heroName: h.heroName,
          heroIcon: h.heroIcon,
          level: h.level,
          hp: h.hp,
          maxHp: h.maxHp,
          gold: h.gold,
          items: h.items,
          kda: { ...h.kda },
          isDead: h.isDead,
          respawnTimer: h.respawnTimer,
          damageDealt: h.damageDealt,
          damageTaken: h.damageTaken
        }))
      });

      if (!isGameOver) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    const finishMatch = (winnerSide: 'blue' | 'red') => {
      if (winnerSide === userSide) {
        audioMgr.playVictory();
      } else {
        audioMgr.playDefeat();
      }

      logCommentary(`🏆 BASE HANCUR! TIM ${winnerSide.toUpperCase()} MEMENANGKAN PERTANDINGAN!`, 'highlight');

      setTimeout(() => {
        let mvp = heroes[0];
        let highestRating = -1;
        heroes.filter(h => h.side === winnerSide).forEach(h => {
          const r = (h.kda.k * 3) + (h.kda.a * 1.5) - (h.kda.d * 1.5) + (h.damageDealt / 25000);
          if (r > highestRating) {
            highestRating = r;
            mvp = h;
          }
        });

        onMatchFinish({
          winnerSide,
          winnerTeam: winnerSide === 'blue' ? draftResult.blueTeam : draftResult.redTeam,
          loserTeam: winnerSide === 'blue' ? draftResult.redTeam : draftResult.blueTeam,
          duration: Math.floor(state.gameTime),
          score: { ...state.score },
          gold: { ...state.gold },
          turrets: { ...state.turrets },
          turtles: { ...state.turtles },
          lords: { ...state.lords },
          mvp,
          heroes,
          bans: [...(draftResult.blueBans || []), ...(draftResult.redBans || [])],
          difficultyCondition: draftResult.difficultyCondition
        });
      }, 2500);
    };

    engineRef.current = {
      speed: 1,
      isPaused: false,
      applyTactic: (tactic: string) => {
        setActiveTactic(tactic);
        logCommentary(`📢 COACH TACTIC: Tim beralih ke instruksi ${tactic.toUpperCase()}!`, 'coach');
        audioMgr.playTacticalOrder();

        heroes.filter(h => h.side === userSide && !h.isDead).forEach(h => {
          if (tactic === 'lord_contest') {
            h.targetX = 400 + (Math.random() - 0.5) * 50;
            h.targetY = 280 + (Math.random() - 0.5) * 50;
          } else if (tactic === 'teamfight') {
            h.targetX = 400 + (Math.random() - 0.5) * 80;
            h.targetY = 300 + (Math.random() - 0.5) * 80;
          } else if (tactic === 'split_push') {
            if (h.lane === 'EXP') { h.targetX = userSide === 'blue' ? 420 : 160; h.targetY = 120; }
            if (h.lane === 'Gold') { h.targetX = userSide === 'blue' ? 640 : 380; h.targetY = 480; }
          } else if (tactic === 'defensive') {
            h.targetX = userSide === 'blue' ? 180 : 620;
            h.targetY = userSide === 'blue' ? 440 : 160;
          } else if (tactic === 'invade') {
            h.targetX = userSide === 'blue' ? 580 : 220;
            h.targetY = userSide === 'blue' ? 200 : 400;
          } else {
            h.targetX = h.laneTarget.x;
            h.targetY = h.laneTarget.y;
          }
        });
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [draftResult, userSide, onMatchFinish]);

  const handleApplyTactic = (tacticId: string) => {
    if (!globalRateLimiter.isAllowed('apply_tactic', 300)) return;
    if (engineRef.current) {
      engineRef.current.applyTactic(tacticId);
    }
  };

  const handleTogglePause = () => {
    setIsPaused(p => {
      const next = !p;
      if (engineRef.current) engineRef.current.isPaused = next;
      return next;
    });
  };

  const handleSetSpeed = (s: number) => {
    setSpeed(s);
    if (engineRef.current) engineRef.current.speed = s;
  };

  const min = matchState ? Math.floor(matchState.gameTime / 60) : 0;
  const sec = matchState ? Math.floor(matchState.gameTime % 60).toString().padStart(2, '0') : '00';

  const blueGold = matchState?.gold.blue || 1500;
  const redGold = matchState?.gold.red || 1500;
  const goldDiff = Math.abs(blueGold - redGold);
  const isBlueAhead = blueGold >= redGold;
  const totalGold = blueGold + redGold || 3000;
  const blueGoldPct = Math.min(85, Math.max(15, (blueGold / totalGold) * 100));

  return (
    <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 animate-fadeIn text-gray-900">
      {/* 1. Official MPL Match Scoreboard Bar */}
      <div className="bg-gradient-to-r from-[#0d1622] via-[#141f2e] to-[#0d1622] px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-white/10 flex flex-col shadow-2xl mb-3 text-white gap-2">
        <div className="flex items-center justify-between">
          {/* Blue Team Banner */}
          <div className="flex items-center gap-2 sm:gap-3 w-1/3">
            <div className="w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center p-1 bg-white rounded-xl shadow shrink-0">
              <img
                src={getTeamLogoUrl(draftResult.blueTeam.tag, draftResult.blueTeam.themeColor)}
                alt={draftResult.blueTeam.tag}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-[11px] sm:text-sm font-black text-blue-400 uppercase tracking-wide truncate font-mpl-title">
                {draftResult.blueTeam.name}
              </div>
              <div className="text-[8px] sm:text-[10px] text-gray-400 font-mono">
                🐢 {matchState?.turtles.blue || 0}/3 • 👑 {matchState?.lords.blue || 0} • 🏰 {matchState?.turrets.blue || 6} • 💰 {(blueGold / 1000).toFixed(1)}k
              </div>
            </div>
          </div>

          {/* Center Score & Match Clock */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 sm:gap-4 text-xl sm:text-3xl md:text-4xl font-black font-mono">
              <span className="text-blue-400">{matchState?.score.blue || 0}</span>
              <span className="text-gray-500 text-sm sm:text-lg">:</span>
              <span className="text-red-400">{matchState?.score.red || 0}</span>
            </div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-mpl-gold bg-black/60 px-2 sm:px-3 py-0.5 rounded-full border border-white/10 mt-0.5">
              ⏱️ {min}:{sec}
            </div>
          </div>

          {/* Red Team Banner */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/3 text-right">
            <div>
              <div className="text-[11px] sm:text-sm font-black text-red-400 uppercase tracking-wide truncate font-mpl-title">
                {draftResult.redTeam.name}
              </div>
              <div className="text-[8px] sm:text-[10px] text-gray-400 font-mono">
                💰 {(redGold / 1000).toFixed(1)}k • 🏰 {matchState?.turrets.red || 6} • 👑 {matchState?.lords.red || 0} • 🐢 {matchState?.turtles.red || 0}/3
              </div>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center p-1 bg-white rounded-xl shadow shrink-0">
              <img
                src={getTeamLogoUrl(draftResult.redTeam.tag, draftResult.redTeam.themeColor)}
                alt={draftResult.redTeam.tag}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Live Broadcast Gold Lead Bar */}
        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] sm:text-[10px] font-mono">
          <div className="flex items-center gap-1 text-blue-400 font-bold">
            <span>{draftResult.blueTeam.shortName}</span>
            <span>{blueGold.toLocaleString()}g</span>
          </div>

          <div className="flex-1 mx-2 sm:mx-4 flex flex-col items-center">
            <div className="w-full bg-red-950/60 h-1.5 sm:h-2 rounded-full overflow-hidden flex border border-white/10">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${blueGoldPct}%` }}
              />
              <div
                className="bg-red-500 h-full transition-all duration-300"
                style={{ width: `${100 - blueGoldPct}%` }}
              />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase text-mpl-gold mt-0.5 tracking-wider">
              {goldDiff < 400
                ? '⚖️ GOLD IMBANG'
                : isBlueAhead
                ? `🔵 +${(goldDiff / 1000).toFixed(1)}k ${draftResult.blueTeam.shortName} LEAD`
                : `🔴 +${(goldDiff / 1000).toFixed(1)}k ${draftResult.redTeam.shortName} LEAD`}
            </span>
          </div>

          <div className="flex items-center gap-1 text-red-400 font-bold">
            <span>{redGold.toLocaleString()}g</span>
            <span>{draftResult.redTeam.shortName}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Match Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Blue Squad Column (Desktop or Active Tab on Mobile) */}
        <div className={`lg:col-span-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-md flex-col gap-2 ${
          mobileMatchTab === 'squads' ? 'flex' : 'hidden lg:flex'
        }`}>
          <h4 className="text-xs font-black text-blue-700 uppercase mb-1 flex items-center gap-1.5 font-mpl-title">
            🔵 {draftResult.blueTeam.shortName} SQUAD
          </h4>
          {matchState?.heroes.filter(h => h.side === 'blue').map(h => (
            <div
              key={h.id}
              className={`p-1.5 sm:p-2 rounded-xl bg-gray-50 border border-gray-200 flex flex-col gap-1 transition ${
                h.isDead ? 'opacity-40 grayscale bg-red-50/40' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-blue-400/60 bg-gray-900 shrink-0 flex items-center justify-center shadow">
                    <img
                      src={getHeroImageUrl(h.heroId, h.heroName)}
                      alt={h.heroName}
                      className="w-full h-full object-cover"
                    />
                    {h.isDead && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[8px] text-red-400 font-mono font-bold">
                        {Math.ceil(h.respawnTimer)}s
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-gray-900 text-[10px] sm:text-[11px] flex items-center gap-1">
                      <span>{h.playerName}</span>
                      <img
                        src={getPlayerAvatarUrl(h.playerName, draftResult.blueTeam.themeColor)}
                        alt={h.playerName}
                        className="w-3.5 h-3.5 rounded-full border border-gray-300"
                      />
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-gray-500 font-mono">Lv.{h.level} • {h.heroName} ({h.lane})</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-gray-900 font-black text-[10px] sm:text-[11px]">{h.kda.k}/{h.kda.d}/{h.kda.a}</div>
                  <div className="text-[8px] sm:text-[9px] text-gray-500 font-mono font-bold">{h.gold}g</div>
                </div>
              </div>

              {/* 6 Real MLBB Item Slots */}
              <div className="flex items-center gap-1 pt-0.5 border-t border-gray-200">
                {[0, 1, 2, 3, 4, 5].map(idx => {
                  const it = h.items && h.items[idx];
                  return (
                    <div
                      key={idx}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gray-900 border border-amber-500/40 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition cursor-help"
                      title={it ? `${it.name} (${it.category})\n💰 ${it.cost}g\n${it.passive || ''}` : 'Slot Kosong'}
                    >
                      {it ? (
                        <img
                          src={getItemImageUrl(it.id, it.name)}
                          alt={it.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[7px] text-gray-500 font-mono">•</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Center: Land of Dawn Arena Canvas & Real Kill Banner */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative rounded-2xl overflow-hidden border-2 border-gray-300 shadow-2xl bg-black w-full aspect-[4/3] flex items-center justify-center">
            <canvas ref={canvasRef} width={800} height={600} className="w-full h-full object-contain block" />

            {/* Top-Center Animated Kill Banner */}
            {activeKillBanner && (
              <div className="absolute top-2 sm:top-4 inset-x-0 flex justify-center pointer-events-none animate-bounce z-20">
                <div className="bg-gradient-to-r from-red-950/90 via-black/95 to-red-950/90 border-2 border-amber-400 px-3 sm:px-6 py-1.5 sm:py-2 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-4 text-white">
                  <img
                    src={getHeroImageUrl(activeKillBanner.killer.heroId, activeKillBanner.killer.heroName)}
                    alt="Killer"
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-blue-400 object-cover"
                  />
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-black uppercase text-amber-400 font-mpl-title tracking-wider">
                      {activeKillBanner.title}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-gray-300 font-bold">
                      {activeKillBanner.killer.name} ⚔️ {activeKillBanner.victim.name}
                    </div>
                  </div>
                  <img
                    src={getHeroImageUrl(activeKillBanner.victim.heroId, activeKillBanner.victim.heroName)}
                    alt="Victim"
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-red-500 object-cover opacity-60 grayscale"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Coach Tactical Directives */}
          <div className="w-full bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200 mt-2.5 sm:mt-3 shadow-md">
            <div className="text-[10px] sm:text-[11px] font-black text-[#680008] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mpl-title">
              <Zap className="w-3.5 h-3.5 text-mpl-gold" /> INSTRUKSI TAKTIKAL HEAD COACH (LIVE):
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5">
              {[
                { id: 'balanced', label: '⚖️ Standar' },
                { id: 'lord_contest', label: '👑 Setup Lord' },
                { id: 'teamfight', label: '⚔️ 5-Man War' },
                { id: 'split_push', label: '🏃 Split Push' },
                { id: 'defensive', label: '🛡️ High Ground' },
                { id: 'invade', label: '🗡️ Invasi Buff' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => handleApplyTactic(t.id)}
                  className={`px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black transition border ${
                    activeTactic === t.id
                      ? 'bg-[#680008] text-white border-[#680008] shadow-md'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Speed & Pause Controls */}
            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500">Speed:</span>
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => handleSetSpeed(s)}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-black ${
                      speed === s ? 'bg-[#680008] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                onClick={handleTogglePause}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-gray-900 hover:bg-black text-white text-[10px] sm:text-xs font-bold transition shadow"
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {isPaused ? 'Lanjut' : 'Jeda'}
              </button>
            </div>
          </div>

          {/* Mobile Bottom Tabs Switcher (< 1024px) */}
          <div className="lg:hidden w-full flex rounded-xl bg-gray-200 p-1 mt-2.5 gap-1 text-xs font-bold font-mpl-title">
            <button
              onClick={() => setMobileMatchTab('squads')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                mobileMatchTab === 'squads' ? 'bg-[#680008] text-white shadow' : 'text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Skuad & Item
            </button>
            <button
              onClick={() => setMobileMatchTab('caster')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                mobileMatchTab === 'caster' ? 'bg-[#680008] text-white shadow' : 'text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> Caster Feed
            </button>
          </div>
        </div>

        {/* Red Squad Column & Live Caster Feed */}
        <div className={`lg:col-span-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-md flex-col gap-3 ${
          mobileMatchTab === 'squads' || mobileMatchTab === 'caster' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Red Squad */}
          <div className={mobileMatchTab === 'caster' ? 'hidden lg:block' : 'block'}>
            <h4 className="text-xs font-black text-red-700 uppercase mb-1 flex items-center gap-1.5 font-mpl-title">
              🔴 {draftResult.redTeam.shortName} SQUAD
            </h4>
            <div className="flex flex-col gap-1.5">
              {matchState?.heroes.filter(h => h.side === 'red').map(h => (
                <div
                  key={h.id}
                  className={`p-1.5 sm:p-2 rounded-xl bg-gray-50 border border-gray-200 flex flex-col gap-1 transition ${
                    h.isDead ? 'opacity-40 grayscale bg-red-50/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-red-400/60 bg-gray-900 shrink-0 flex items-center justify-center shadow">
                        <img
                          src={getHeroImageUrl(h.heroId, h.heroName)}
                          alt={h.heroName}
                          className="w-full h-full object-cover"
                        />
                        {h.isDead && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[8px] text-red-400 font-mono font-bold">
                            {Math.ceil(h.respawnTimer)}s
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-gray-900 text-[10px] sm:text-[11px] flex items-center gap-1">
                          <span>{h.playerName}</span>
                          <img
                            src={getPlayerAvatarUrl(h.playerName, draftResult.redTeam.themeColor)}
                            alt={h.playerName}
                            className="w-3.5 h-3.5 rounded-full border border-gray-300"
                          />
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-gray-500 font-mono">Lv.{h.level} • {h.heroName} ({h.lane})</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-gray-900 font-black text-[10px] sm:text-[11px]">{h.kda.k}/{h.kda.d}/{h.kda.a}</div>
                      <div className="text-[8px] sm:text-[9px] text-gray-500 font-mono font-bold">{h.gold}g</div>
                    </div>
                  </div>

                  {/* 6 Real MLBB Item Slots */}
                  <div className="flex items-center gap-1 pt-0.5 border-t border-gray-200">
                    {[0, 1, 2, 3, 4, 5].map(idx => {
                      const it = h.items && h.items[idx];
                      return (
                        <div
                          key={idx}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gray-900 border border-amber-500/40 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition cursor-help"
                          title={it ? `${it.name} (${it.category})\n💰 ${it.cost}g\n${it.passive || ''}` : 'Slot Kosong'}
                        >
                          {it ? (
                            <img
                              src={getItemImageUrl(it.id, it.name)}
                              alt={it.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-[7px] text-gray-500 font-mono">•</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Caster Feed */}
          <div className={`flex-1 flex-col pt-2 border-t border-gray-100 ${
            mobileMatchTab === 'squads' ? 'hidden lg:flex' : 'flex'
          }`}>
            <h4 className="text-[10px] sm:text-[11px] font-black text-[#680008] uppercase mb-1.5 font-mpl-title">
              🎙️ Live Caster Feed
            </h4>
            <div className="flex-1 max-h-[170px] overflow-y-auto space-y-1.5 pr-1 text-[10px] sm:text-[11px]">
              {commentaries.map((c, i) => (
                <div
                  key={i}
                  className={`p-1.5 sm:p-2 rounded-xl leading-snug border ${
                    c.type === 'kill'
                      ? 'bg-red-50 text-red-900 border-red-200 font-bold'
                      : c.type === 'objective'
                      ? 'bg-green-50 text-green-900 border-green-200 font-bold'
                      : c.type === 'coach'
                      ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <span className="text-[#680008] font-mono font-black text-[8px] sm:text-[9px] mr-1">[{c.time}]</span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
