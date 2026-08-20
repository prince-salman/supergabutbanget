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
  public isStarted: boolean = false;
  public isCompleted: boolean = false;
  public isSwapPhase: boolean = false;

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
    if (this.isStarted) return;
    this.isStarted = true;
    this.turnIndex = 0;
    this.timer = 25;
    this.isCompleted = false;
    this.isSwapPhase = false;
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
      
      // Check if enemy has heroes we can strongly counter
      let counterRecommendation: Hero | null = null;
      let counterTargetName = '';

      if (enemyPicks.length > 0) {
        for (const enemyH of enemyPicks) {
          const directCounter = available.find(h => 
            (h.lane === nextRole || h.secondaryLane === nextRole) && 
            h.counters && h.counters.includes(enemyH.name)
          );
          if (directCounter) {
            counterRecommendation = directCounter;
            counterTargetName = enemyH.name;
            break;
          }
        }
      }

      const bestPicks = available.filter(h => (h.lane === nextRole || h.secondaryLane === nextRole) && (h.tier === 'S+' || h.tier === 'S')).slice(0, 2);
      if (counterRecommendation && !suggestedHeroIds.includes(counterRecommendation.id)) {
        suggestedHeroIds.push(counterRecommendation.id);
      }
      bestPicks.forEach(h => {
        if (!suggestedHeroIds.includes(h.id)) suggestedHeroIds.push(h.id);
      });

      let analystMsg = `Coach, prioritas kita sekarang adalah mengisi ${nextRole} Lane. Rekomendasi data statistik: ${bestPicks.map(h => h.name).join(' atau ')}!`;
      if (counterRecommendation) {
        analystMsg = `💡 COUNTER-PICK DETECTED! Musuh sudah pick ${counterTargetName}. Rekomendasi tajam saya adalah ambil [${counterRecommendation.name}] untuk shut down pergerakan mereka!`;
      }

      squadDiscussion.push({
        id: `asst_${Date.now()}`,
        speakerName: asstCoach.name,
        speakerRole: 'Tactical Analyst',
        avatarIcon: '💡',
        message: analystMsg,
        suggestedHeroName: counterRecommendation?.name || bestPicks[0]?.name,
        suggestedHeroId: counterRecommendation?.id || bestPicks[0]?.id
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
    const enemyTeam = enemySide === 'blue' ? this.blueTeam : this.redTeam;

    if (phase === 'ban') {
      if (this.turnIndex < 6) {
        // Phase 1 Ban: Ban Opponent's S+ Signature Heroes or Priority OP Meta
        const enemySignatures = availableHeroes.filter(h => 
          (h.tier === 'S+' || h.tier === 'S') && 
          enemyTeam.roster.some(p => p.signature.includes(h.name))
        );
        if (enemySignatures.length > 0) {
          return enemySignatures[Math.floor(Math.random() * enemySignatures.length)];
        }
        const sPlus = availableHeroes.filter(h => h.tier === 'S+');
        if (sPlus.length > 0) {
          return sPlus[Math.floor(Math.random() * sPlus.length)];
        }
      } else {
        // Phase 2 Ban: Target Ban Opponent's missing roles & signatures!
        const enemyNeededRoles = this.getNeededLanes(enemyPicks);
        const targetedMissingBans = availableHeroes.filter(h => 
          enemyNeededRoles.includes(h.lane) && 
          (h.tier === 'S+' || h.tier === 'S' || h.tier === 'A+') &&
          enemyTeam.roster.some(p => p.role === h.lane && p.signature.includes(h.name))
        );
        if (targetedMissingBans.length > 0) {
          return targetedMissingBans[0];
        }
        const generalMissingBans = availableHeroes.filter(h => enemyNeededRoles.includes(h.lane) && (h.tier === 'S+' || h.tier === 'S'));
        if (generalMissingBans.length > 0) {
          return generalMissingBans[Math.floor(Math.random() * generalMissingBans.length)];
        }
      }
      const tierS = availableHeroes.filter(h => h.tier === 'S+' || h.tier === 'S');
      return tierS.length > 0 ? tierS[Math.floor(Math.random() * tierS.length)] : availableHeroes[0];
    }

    // Phase Pick: Smart Counter-Pick & Synergy Optimizer
    const neededLanes = this.getNeededLanes(myPicks);
    let candidates = availableHeroes.filter(h => neededLanes.includes(h.lane) || (h.secondaryLane && neededLanes.includes(h.secondaryLane)));

    if (candidates.length === 0) {
      candidates = availableHeroes;
    }

    let scored = candidates.map(hero => {
      let score = 0;
      
      // 1. Signature Hero Bonus
      const hasSignaturePlayer = myTeam.roster.some(p => p.role === hero.lane && p.signature.includes(hero.name));
      if (hasSignaturePlayer) score += 35;

      // 2. Base Tier Power & Meta Urgency (Priority S+ First Picks)
      if (hero.tier === 'S+') {
        score += (myPicks.length < 2 ? 45 : 32); // Huge first-pick meta priority!
      } else if (hero.tier === 'S') {
        score += 24;
      } else if (hero.tier === 'A+') {
        score += 16;
      } else if (hero.tier === 'A') {
        score += 10;
      }

      // 3. Flex Pick Versatility Bonus (Can flex into 2 roles)
      if (hero.secondaryLane) {
        score += 20;
      }

      // 4. Iconic Teammate Duo Combos & Wombo-Combo Synergies
      myPicks.forEach(myHero => {
        // Johnson + Odette / Kadita
        if (myHero.name === 'Johnson' && (hero.name === 'Odette' || hero.name === 'Kadita')) score += 55;
        if ((myHero.name === 'Odette' || myHero.name === 'Kadita') && hero.name === 'Johnson') score += 55;

        // Carmilla + Cecilion
        if (myHero.name === 'Carmilla' && hero.name === 'Cecilion') score += 60;
        if (myHero.name === 'Cecilion' && hero.name === 'Carmilla') score += 60;

        // Tigreal / Atlas + Pharsa / Yve / Gord / Novaria (Wombo Combo AoE)
        if (['Tigreal', 'Atlas', 'Minotaur'].includes(myHero.name) && ['Pharsa', 'Yve', 'Gord', 'Zetian', 'Odette', 'Luo Yi'].includes(hero.name)) score += 48;
        if (['Pharsa', 'Yve', 'Gord', 'Zetian', 'Odette'].includes(myHero.name) && ['Tigreal', 'Atlas', 'Minotaur'].includes(hero.name)) score += 48;

        // Dive Assassin + Angela / Floryn (Global Shield Dive)
        if (['Fanny', 'Ling', 'Suyou', 'Nolan', 'Lancelot', 'Joy', 'Hirara'].includes(myHero.name) && (hero.name === 'Angela' || hero.name === 'Floryn')) score += 48;
        if ((myHero.name === 'Angela' || myHero.name === 'Floryn') && ['Fanny', 'Ling', 'Suyou', 'Nolan', 'Lancelot', 'Joy', 'Hirara'].includes(hero.name)) score += 48;

        // Sustain Deathball: Estes / Rafaela + Barats / Fredrinn / Uranus / Hylos
        if (['Estes', 'Rafaela', 'Floryn'].includes(myHero.name) && ['Barats', 'Fredrinn', 'Uranus', 'Hylos', 'Baxia', 'Terizla'].includes(hero.name)) score += 48;
        if (['Barats', 'Fredrinn', 'Uranus', 'Hylos', 'Baxia', 'Terizla'].includes(myHero.name) && ['Estes', 'Rafaela', 'Floryn'].includes(hero.name)) score += 48;

        // Arlott + CC Displacers (Chou, Ruby, Jawhead, Martis)
        if (myHero.name === 'Arlott' && ['Chou', 'Ruby', 'Jawhead', 'Martis', 'Akai', 'Franco'].includes(hero.name)) score += 42;
        if (['Chou', 'Ruby', 'Jawhead', 'Martis', 'Akai', 'Franco'].includes(myHero.name) && hero.name === 'Arlott') score += 42;

        // Diggie / Mathilda + Hard Hypercarry (Claude, Karrie, Beatrix, Bruno)
        if (['Diggie', 'Mathilda'].includes(myHero.name) && ['Claude', 'Karrie', 'Beatrix', 'Bruno', 'Moskov'].includes(hero.name)) score += 42;
      });

      // 5. Deep Tactical Counter-Pick Intelligence
      enemyPicks.forEach(enemyHero => {
        // Direct counter list check
        if (hero.counters && hero.counters.includes(enemyHero.name)) {
          score += 48; // Heavy priority counter-pick!
        }
        if (hero.counteredBy && hero.counteredBy.includes(enemyHero.name)) {
          score -= 34; // Avoid being counter-picked!
        }

        // Anti-Mobility Counter Check
        const isEnemyMobile = ['Fanny', 'Ling', 'Joy', 'Lancelot', 'Benedetta', 'Harith', 'Suyou', 'Nolan', 'Hayabusa', 'Hirara'].includes(enemyHero.name);
        if (isEnemyMobile) {
          if (['Khufra', 'Minsitthar', 'Kaja', 'Franco', 'Phoveus', 'Ruby', 'Chou', 'Akai', 'Saber', 'Kalea'].includes(hero.name)) {
            score += 45;
          }
        }

        // Anti-Heal / Anti-Sustain Counter Check
        const isEnemyHealer = ['Estes', 'Floryn', 'Rafaela', 'Uranus', 'Fredrinn', 'Barats', 'Hylos', 'Kalea'].includes(enemyHero.name);
        if (isEnemyHealer) {
          if (['Baxia', 'Luo Yi', 'Carmilla', 'Dyrroth', 'Lunox', 'Valir', 'Karrie'].includes(hero.name)) {
            score += 42;
          }
        }

        // Anti-Marksman / Anti-Projectile Counter Check
        const isEnemyBasicMM = ['Claude', 'Beatrix', 'Moskov', 'Bruno', 'Karrie', 'Wanwan', 'Miya', 'Layla', 'Irithel', 'Obsidia'].includes(enemyHero.name);
        if (isEnemyBasicMM) {
          if (['Lolita', 'Belerick', 'Gatotkaca', 'Saber', 'Chou', 'Hayabusa', 'Marcel'].includes(hero.name)) {
            score += 40;
          }
        }

        // Anti-Artillery Mage Counter Check
        const isEnemyArtillery = ['Pharsa', 'Novaria', 'Yve', 'Xavier', 'Cecilion', 'Gord', 'Zetian', 'Odette'].includes(enemyHero.name);
        if (isEnemyArtillery) {
          if (['Ling', 'Hayabusa', 'Nolan', 'Suyou', 'Yu Zhong', 'Joy', 'Lancelot', 'Hirara', 'Sora'].includes(hero.name)) {
            score += 40;
          }
        }

        // Anti-Big CC Teamfight Counter Check
        const isEnemyHardCC = ['Atlas', 'Tigreal', 'Minotaur', 'Terizla', 'Grock', 'Kalea'].includes(enemyHero.name);
        if (isEnemyHardCC) {
          if (['Diggie', 'Kadita', 'Valir', 'Akai', 'Wanwan', 'Gloo'].includes(hero.name)) {
            score += 42;
          }
        }
      });

      // 6. Team Synergy & Composition Balance
      const currentStats = this.calculateTeamStats(myPicks);
      if (currentStats.frontline < 50 && (hero.stats.frontline > 75 || hero.lane === 'EXP' || hero.lane === 'Roam' || hero.role === 'Tank')) {
        score += 24;
      }
      if (currentStats.cc < 50 && hero.stats.cc > 80) {
        score += 24;
      }
      if (currentStats.waveclear < 50 && hero.stats.waveclear > 85) {
        score += 18;
      }

      // Hybrid Damage Check
      const hasPhysical = myPicks.some(p => p.damageType === 'Physical');
      const hasMagic = myPicks.some(p => p.damageType === 'Magic');
      if (myPicks.length >= 3) {
        if (!hasPhysical && hero.damageType === 'Physical') score += 22;
        if (!hasMagic && hero.damageType === 'Magic') score += 22;
      }

      return { hero, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topChoices = scored.slice(0, Math.min(2, scored.length));
    return topChoices[0]?.hero || availableHeroes[0];
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
