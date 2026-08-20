import { 
  Team, 
  Hero, 
  DraftTurn, 
  DraftCommsMessage, 
  DraftCommsSpeaker,
  SquadDiscussionEntry,
  CoachReplyOption, 
  DraftResult, 
  HeroAssignment, 
  TeamSynergyStats, 
  LaneRole,
  MatchDifficultyCondition 
} from '@/types';
import { MLBB_HEROES } from '@/lib/data/heroes';
import { audioMgr } from '@/lib/audioManager';

// 10-Hero Ban Tournament Draft Pick Engine in TypeScript
export class DraftEngine {
  public blueTeam: Team;
  public redTeam: Team;
  public userSide: 'blue' | 'red';
  public difficultyCondition?: MatchDifficultyCondition;

  public blueBans: Hero[] = [];
  public redBans: Hero[] = [];
  public bluePicks: Hero[] = [];
  public redPicks: Hero[] = [];

  public blueAssignments: HeroAssignment[] = [];
  public redAssignments: HeroAssignment[] = [];

  public turnIndex: number = 0;
  public timer: number = 25;
  public timerInterval: any = null;
  public isCompleted: boolean = false;

  public commsMessages: DraftCommsMessage[] = [];
  public currentComms: DraftCommsMessage | null = null;
  public highlightedHeroIds: string[] = [];
  public teamConfidenceBoost: number = 0;

  public turnSequence: DraftTurn[] = [
    { phase: 'ban', side: 'blue', num: 1, label: 'Blue Ban 1', phaseStage: 'ban_p1' },
    { phase: 'ban', side: 'red',   num: 1, label: 'Red Ban 1', phaseStage: 'ban_p1' },
    { phase: 'ban', side: 'blue', num: 2, label: 'Blue Ban 2', phaseStage: 'ban_p1' },
    { phase: 'ban', side: 'red',   num: 2, label: 'Red Ban 2', phaseStage: 'ban_p1' },
    { phase: 'ban', side: 'blue', num: 3, label: 'Blue Ban 3', phaseStage: 'ban_p1' },
    { phase: 'ban', side: 'red',   num: 3, label: 'Red Ban 3', phaseStage: 'ban_p1' },

    { phase: 'pick', side: 'blue', num: 1, label: 'Blue Pick 1', phaseStage: 'pick_p1' },
    { phase: 'pick', side: 'red',   num: 1, label: 'Red Pick 1', phaseStage: 'pick_p1' },
    { phase: 'pick', side: 'red',   num: 2, label: 'Red Pick 2', phaseStage: 'pick_p1' },
    { phase: 'pick', side: 'blue', num: 2, label: 'Blue Pick 2', phaseStage: 'pick_p1' },
    { phase: 'pick', side: 'blue', num: 3, label: 'Blue Pick 3', phaseStage: 'pick_p1' },
    { phase: 'pick', side: 'red',   num: 3, label: 'Red Pick 3', phaseStage: 'pick_p1' },

    { phase: 'ban', side: 'red',   num: 4, label: 'Red Ban 4', phaseStage: 'ban_p2' },
    { phase: 'ban', side: 'blue', num: 4, label: 'Blue Ban 4', phaseStage: 'ban_p2' },
    { phase: 'ban', side: 'red',   num: 5, label: 'Red Ban 5', phaseStage: 'ban_p2' },
    { phase: 'ban', side: 'blue', num: 5, label: 'Blue Ban 5', phaseStage: 'ban_p2' },

    { phase: 'pick', side: 'red',   num: 4, label: 'Red Pick 4', phaseStage: 'pick_p2' },
    { phase: 'pick', side: 'blue', num: 4, label: 'Blue Pick 4', phaseStage: 'pick_p2' },
    { phase: 'pick', side: 'blue', num: 5, label: 'Blue Pick 5', phaseStage: 'pick_p2' },
    { phase: 'pick', side: 'red',   num: 5, label: 'Red Pick 5', phaseStage: 'pick_p2' }
  ];

  public onStateChange?: () => void;
  public onTurnTimer?: (timeLeft: number) => void;
  public onDraftComplete?: (result: DraftResult) => void;
  public onCommsUpdate?: (comms: DraftCommsMessage) => void;

  constructor(blueTeam: Team, redTeam: Team, userSide: 'blue' | 'red' = 'blue', difficultyCondition?: MatchDifficultyCondition) {
    this.blueTeam = blueTeam;
    this.redTeam = redTeam;
    this.userSide = userSide;
    this.difficultyCondition = difficultyCondition;
  }

  start() {
    this.turnIndex = 0;
    this.timer = 25;
    this.isCompleted = false;
    this.teamConfidenceBoost = 0;
    this.commsMessages = [];
    this.startTurn();
  }

  getCurrentTurn(): DraftTurn | null {
    return this.turnSequence[this.turnIndex] || null;
  }

  isUserTurn(): boolean {
    const current = this.getCurrentTurn();
    if (!current) return false;
    return current.side === this.userSide;
  }

  getAllUnavailableHeroIds(): string[] {
    return [
      ...this.blueBans.map(h => h.id),
      ...this.redBans.map(h => h.id),
      ...this.bluePicks.map(h => h.id),
      ...this.redPicks.map(h => h.id)
    ];
  }

  startTurn() {
    if (this.turnIndex >= this.turnSequence.length) {
      this.finishDraft();
      return;
    }

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timer = 25;

    this.generateStageComms();

    if (this.onStateChange) this.onStateChange();

    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.onTurnTimer) this.onTurnTimer(this.timer);
      if (this.timer <= 5 && this.timer > 0) {
        audioMgr.playTimerTick();
      }

      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeout();
      }
    }, 1000);

    if (!this.isUserTurn()) {
      const delay = 1500 + Math.random() * 1200;
      setTimeout(() => {
        if (!this.isCompleted && !this.isUserTurn()) {
          this.executeAITurn();
        }
      }, delay);
    }
  }

  generateStageComms() {
    const current = this.getCurrentTurn();
    if (!current) return;

    const userTeam = this.userSide === 'blue' ? this.blueTeam : this.redTeam;
    const enemyTeam = this.userSide === 'blue' ? this.redTeam : this.blueTeam;
    const myPicks = this.userSide === 'blue' ? this.bluePicks : this.redPicks;
    const enemyPicks = this.userSide === 'blue' ? this.redPicks : this.bluePicks;

    const asstCoach = userTeam.staff?.assistantCoach || { name: "Coach Asisten", role: "Tactical Analyst", personality: "Analitis" };
    const starters = userTeam.roster.slice(0, 5);

    const unavail = this.getAllUnavailableHeroIds();
    const available = MLBB_HEROES.filter(h => !unavail.includes(h.id));

    const squadDiscussion: SquadDiscussionEntry[] = [];
    let suggestedHeroIds: string[] = [];
    let coachReplyOptions: CoachReplyOption[] = [];

    // 1. Assistant Coach Meta & Strategy Analysis
    if (current.phase === 'ban') {
      const topBans = available.filter(h => h.tier === 'S+' || h.tier === 'S').slice(0, 2);
      suggestedHeroIds = topBans.map(h => h.id);
      squadDiscussion.push({
        id: `asst_${Date.now()}`,
        speakerName: asstCoach.name,
        speakerRole: 'Tactical Analyst',
        avatarIcon: '📋',
        message: `Coach, di fase Ban ${current.phaseStage.toUpperCase()} ini, musuh sering mengandalkan ${topBans.map(h => h.name).join(' & ')}. Sebaiknya kita tutup opsi mereka!`,
        suggestedHeroName: topBans[0]?.name,
        suggestedHeroId: topBans[0]?.id
      });
    } else {
      const needed = this.getNeededLanes(myPicks);
      const nextRole = needed[0] || 'Jungle';
      const bestPicks = available.filter(h => (h.lane === nextRole || h.secondaryLane === nextRole) && (h.tier === 'S+' || h.tier === 'S')).slice(0, 2);
      suggestedHeroIds = bestPicks.map(h => h.id);
      squadDiscussion.push({
        id: `asst_${Date.now()}`,
        speakerName: asstCoach.name,
        speakerRole: 'Tactical Analyst',
        avatarIcon: '💡',
        message: `Coach, prioritas kita sekarang adalah mengisi ${nextRole} Lane. Rekomendasi data statistik: ${bestPicks.map(h => h.name).join(' atau ')}!`,
        suggestedHeroName: bestPicks[0]?.name,
        suggestedHeroId: bestPicks[0]?.id
      });
    }

    // 2. All 5 Players speak according to their role & signature heroes
    starters.forEach(player => {
      const isAlreadyPicked = myPicks.some((h, idx) => {
        const assignment = (this.userSide === 'blue' ? this.blueAssignments : this.redAssignments)[idx];
        return assignment?.player?.id === player.id;
      });

      const playerSignature = available.find(h => player.signature.includes(h.name) && (h.lane === player.role || h.secondaryLane === player.role));
      const poolHero = available.find(h => h.lane === player.role || h.secondaryLane === player.role);
      const chosenHero = playerSignature || poolHero;

      if (chosenHero && !suggestedHeroIds.includes(chosenHero.id)) {
        suggestedHeroIds.push(chosenHero.id);
      }

      let msg = "";
      if (player.role === 'EXP') {
        msg = playerSignature
          ? `Coach, lepas ${playerSignature.name} ke saya! Saya siap freeze lane, cut minion, dan flank backline musuh pas war Lord!`
          : `Coach, untuk EXP Lane saya siap main hero badan tebal buat tahan frontline tim!`;
      } else if (player.role === 'Jungle') {
        msg = playerSignature
          ? `Coach, saya pede banget pake ${playerSignature.name}! Saya jamin amankan semua Turtle & Retribution objektif Lord!`
          : `Coach, amankan Assassin/Fighter Jungle untuk saya, siap rotasi invasi buff lawan!`;
      } else if (player.role === 'Mid') {
        msg = playerSignature
          ? `Coach, pick-in ${playerSignature.name}! Saya bisa berikan High Ground defense & zoning AoE magic damage!`
          : `Coach, saya siap pick Mage poke & CC buat backup invasi Jungler di River!`;
      } else if (player.role === 'Gold') {
        msg = playerSignature
          ? `Coach, kasih saya ${playerSignature.name}! Saya siap farming disiplin dan gendong tim pas masuk late game!`
          : `Coach, tolong amankan Marksman andalan, saya butuh Roamer cover pas laning!`;
      } else { // Roam
        msg = playerSignature
          ? `Coach, saya mau pick ${playerSignature.name}! Siap open map di bush sungai, sediakan vision, dan inisiasi teamfight!`
          : `Coach, Roamer siap ambil Tank CC / Support heal buat lindungi carry kita!`;
      }

      squadDiscussion.push({
        id: `p_${player.id}_${Date.now()}`,
        speakerName: player.name,
        speakerRole: `${player.role} Lane`,
        avatarIcon: '🎮',
        message: msg,
        suggestedHeroName: chosenHero?.name,
        suggestedHeroId: chosenHero?.id
      });
    });

    // 3. Coach Tactical Replies
    coachReplyOptions = [
      {
        label: `🔥 "Gunakan hero andalan kalian! Main agresif & percaya diri!"`,
        effect: 'morale',
        confidence: 15
      },
      {
        label: `🎯 "Fokus counter-pick komposisi musuh, ikuti arahan analis!"`,
        effect: 'suggest',
        heroId: suggestedHeroIds[0],
        confidence: 10
      },
      {
        label: `🛡️ "Disiplin objektif Turtle/Lord, jangan overcommit war!"`,
        effect: 'morale',
        confidence: 10
      }
    ];

    const speaker: DraftCommsSpeaker = {
      name: `${userTeam.shortName} SQUAD DISCUSSION`,
      role: 'Intercom 5-Player & Analyst',
      type: 'assistant',
      avatar: '🎙️'
    };

    this.currentComms = {
      speaker,
      text: squadDiscussion[0]?.message || 'Diskusi draft aktif.',
      suggestedHeroIds,
      coachReplyOptions,
      squadDiscussion
    };

    this.highlightedHeroIds = suggestedHeroIds;
    this.commsMessages.unshift(this.currentComms);
    if (this.commsMessages.length > 20) this.commsMessages.pop();

    audioMgr.playCommsBeep();
    if (this.onCommsUpdate) this.onCommsUpdate(this.currentComms);
  }

  handleCoachDialogue(option: CoachReplyOption): Hero | null {
    if (!option) return null;

    if (option.confidence) {
      this.teamConfidenceBoost += option.confidence;
    }

    if (option.heroId) {
      const hero = MLBB_HEROES.find(h => h.id === option.heroId);
      if (hero && !this.getAllUnavailableHeroIds().includes(hero.id)) {
        return hero;
      }
    }

    return null;
  }

  handleTimeout() {
    const current = this.getCurrentTurn();
    if (!current) return;
    const hero = this.selectBestHeroForSide(current.side, current.phase);
    if (hero) {
      this.commitHeroAction(hero);
    }
  }

  executeAITurn() {
    const current = this.getCurrentTurn();
    if (!current || this.isUserTurn()) return;
    const hero = this.selectBestHeroForSide(current.side, current.phase);
    if (hero) {
      this.commitHeroAction(hero);
    }
  }

  userSelectHero(hero: Hero): boolean {
    if (!this.isUserTurn() || this.isCompleted) return false;
    const unavailable = this.getAllUnavailableHeroIds();
    if (unavailable.includes(hero.id)) return false;
    return this.commitHeroAction(hero);
  }

  commitHeroAction(hero: Hero): boolean {
    const current = this.getCurrentTurn();
    if (!current) return false;

    if (current.phase === 'ban') {
      if (current.side === 'blue') {
        this.blueBans.push(hero);
      } else {
        this.redBans.push(hero);
      }
      audioMgr.playBanSound();
    } else {
      if (current.side === 'blue') {
        this.bluePicks.push(hero);
      } else {
        this.redPicks.push(hero);
      }
      audioMgr.playLockPick();
    }

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.turnIndex++;

    if (this.turnIndex < this.turnSequence.length) {
      this.startTurn();
    } else {
      this.startSwapPhase();
    }
    return true;
  }

  selectBestHeroForSide(side: 'blue' | 'red', phase: 'ban' | 'pick'): Hero | null {
    const unavailable = this.getAllUnavailableHeroIds();
    const availableHeroes = MLBB_HEROES.filter(h => !unavailable.includes(h.id));
    if (availableHeroes.length === 0) return null;

    const myTeam = side === 'blue' ? this.blueTeam : this.redTeam;
    const enemySide = side === 'blue' ? 'red' : 'blue';
    const myPicks = side === 'blue' ? this.bluePicks : this.redPicks;
    const enemyPicks = side === 'blue' ? this.redPicks : this.bluePicks;

    if (phase === 'ban') {
      if (this.turnIndex < 6) {
        const sPlus = availableHeroes.filter(h => h.tier === 'S+');
        if (sPlus.length > 0) {
          const enemyTeam = enemySide === 'blue' ? this.blueTeam : this.redTeam;
          const signatureTarget = sPlus.find(h => enemyTeam.roster.some(p => p.signature.includes(h.name)));
          return signatureTarget || sPlus[Math.floor(Math.random() * sPlus.length)];
        }
      } else {
        const enemyNeededRoles = this.getNeededLanes(enemyPicks);
        const targetBans = availableHeroes.filter(h => enemyNeededRoles.includes(h.lane) && (h.tier === 'S+' || h.tier === 'S'));
        if (targetBans.length > 0) {
          return targetBans[Math.floor(Math.random() * targetBans.length)];
        }
      }
      const tierS = availableHeroes.filter(h => h.tier === 'S+' || h.tier === 'S');
      return tierS.length > 0 ? tierS[Math.floor(Math.random() * tierS.length)] : availableHeroes[0];
    }

    const neededLanes = this.getNeededLanes(myPicks);
    let candidates = availableHeroes.filter(h => neededLanes.includes(h.lane) || (h.secondaryLane && neededLanes.includes(h.secondaryLane)));

    if (candidates.length === 0) {
      candidates = availableHeroes;
    }

    let scored = candidates.map(hero => {
      let score = 0;
      const hasSignaturePlayer = myTeam.roster.some(p => p.signature.includes(hero.name));
      if (hasSignaturePlayer) score += 35;

      if (hero.tier === 'S+') score += 30;
      else if (hero.tier === 'S') score += 20;
      else if (hero.tier === 'A') score += 12;

      enemyPicks.forEach(enemyHero => {
        if (hero.counters && hero.counters.includes(enemyHero.name)) score += 18;
        if (hero.counteredBy && hero.counteredBy.includes(enemyHero.name)) score -= 12;
      });

      const currentStats = this.calculateTeamStats(myPicks);
      if (currentStats.frontline < 50 && (hero.stats.frontline > 75 || hero.lane === 'EXP' || hero.lane === 'Roam')) {
        score += 15;
      }
      if (currentStats.cc < 50 && hero.stats.cc > 80) {
        score += 15;
      }

      return { hero, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topChoices = scored.slice(0, Math.min(3, scored.length));
    return topChoices[Math.floor(Math.random() * topChoices.length)].hero;
  }

  getNeededLanes(currentPicks: Hero[]): LaneRole[] {
    const allLanes: LaneRole[] = ['EXP', 'Jungle', 'Mid', 'Gold', 'Roam'];
    const filledLanes: LaneRole[] = [];

    currentPicks.forEach(h => {
      // Find an unfilled lane matching primary or secondary
      const match = allLanes.find(l => !filledLanes.includes(l) && (l === h.lane || l === h.secondaryLane));
      if (match) {
        filledLanes.push(match);
      } else {
        // Force primary lane if already filled
        if (!filledLanes.includes(h.lane)) {
          filledLanes.push(h.lane);
        }
      }
    });

    const needed = allLanes.filter(l => !filledLanes.includes(l));
    return needed.length > 0 ? needed : allLanes;
  }

  calculateTeamStats(picks: Hero[]): TeamSynergyStats {
    if (!picks || picks.length === 0) {
      return { cc: 0, burst: 0, frontline: 0, sustain: 0, early: 0, late: 0, waveclear: 0, overall: 0 };
    }
    const sum = picks.reduce((acc, h) => {
      acc.cc += h.stats.cc;
      acc.burst += h.stats.burst;
      acc.frontline += h.stats.frontline;
      acc.sustain += h.stats.sustain;
      acc.early += h.stats.early;
      acc.late += h.stats.late;
      acc.waveclear += h.stats.waveclear;
      return acc;
    }, { cc: 0, burst: 0, frontline: 0, sustain: 0, early: 0, late: 0, waveclear: 0 });

    const n = picks.length;
    const cc = Math.round(sum.cc / n);
    const burst = Math.round(sum.burst / n);
    const frontline = Math.round(sum.frontline / n);
    const sustain = Math.round(sum.sustain / n);
    const early = Math.round(sum.early / n);
    const late = Math.round(sum.late / n);
    const waveclear = Math.round(sum.waveclear / n);
    const overall = Math.round((cc + burst + frontline + sustain + ((early + late) / 2)) / 4.5);

    return { cc, burst, frontline, sustain, early, late, waveclear, overall };
  }

  public isSwapPhase: boolean = false;

  autoAssignRosterToHeroes(team: Team, picks: Hero[]): HeroAssignment[] {
    const assignments: HeroAssignment[] = [];
    const lanes: LaneRole[] = ['EXP', 'Jungle', 'Mid', 'Gold', 'Roam'];
    const unassignedHeroes = [...picks];
    const starters = team.roster.slice(0, 5);

    lanes.forEach(lane => {
      const player = starters.find(p => p.role === lane) || starters.find(p => !assignments.some(a => a.player.id === p.id)) || starters[0];
      
      // Look for primary lane match
      let heroIdx = unassignedHeroes.findIndex(h => h.lane === lane);
      // If not, secondary lane match
      if (heroIdx === -1) {
        heroIdx = unassignedHeroes.findIndex(h => h.secondaryLane === lane);
      }
      // If still not, take first available
      if (heroIdx === -1) {
        heroIdx = 0;
      }

      const hero = unassignedHeroes.splice(heroIdx, 1)[0] || picks[0];
      assignments.push({
        lane,
        player,
        hero,
        isSignature: player ? player.signature.includes(hero.name) : false
      });
    });

    return assignments;
  }

  swapHeroes(side: 'blue' | 'red', index1: number, index2: number) {
    const assignments = side === 'blue' ? this.blueAssignments : this.redAssignments;
    if (!assignments[index1] || !assignments[index2]) return;

    const tempHero = assignments[index1].hero;
    assignments[index1].hero = assignments[index2].hero;
    assignments[index1].isSignature = assignments[index1].player.signature.includes(assignments[index1].hero.name);

    assignments[index2].hero = tempHero;
    assignments[index2].isSignature = assignments[index2].player.signature.includes(assignments[index2].hero.name);

    audioMgr.playTacticalOrder();
    if (this.onStateChange) this.onStateChange();
  }

  startSwapPhase() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isSwapPhase = true;
    this.timer = 15;
    this.blueAssignments = this.autoAssignRosterToHeroes(this.blueTeam, this.bluePicks);
    this.redAssignments = this.autoAssignRosterToHeroes(this.redTeam, this.redPicks);

    if (this.onStateChange) this.onStateChange();

    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.onTurnTimer) this.onTurnTimer(this.timer);
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.finishDraft();
      }
    }, 1000);
  }

  finishDraft() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isCompleted = true;
    this.isSwapPhase = false;

    if (this.blueAssignments.length === 0) {
      this.blueAssignments = this.autoAssignRosterToHeroes(this.blueTeam, this.bluePicks);
    }
    if (this.redAssignments.length === 0) {
      this.redAssignments = this.autoAssignRosterToHeroes(this.redTeam, this.redPicks);
    }

    if (this.onStateChange) this.onStateChange();
    if (this.onDraftComplete) {
      this.onDraftComplete({
        blueTeam: this.blueTeam,
        redTeam: this.redTeam,
        bluePicks: this.bluePicks,
        redPicks: this.redPicks,
        blueBans: this.blueBans,
        redBans: this.redBans,
        blueAssignments: this.blueAssignments,
        redAssignments: this.redAssignments,
        blueStats: this.calculateTeamStats(this.bluePicks),
        redStats: this.calculateTeamStats(this.redPicks),
        teamConfidenceBoost: this.teamConfidenceBoost,
        difficultyCondition: this.difficultyCondition
      });
    }
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
