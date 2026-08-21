import { 
  Team, 
  StandingsItem, 
  ScheduleMatch, 
  PlayoffMatch, 
  PlayerSeasonStats, 
  TeamSeasonStats,
  HeroSeasonStats,
  AwardsData, 
  AllStarTeam, 
  LaneRole,
  PostMatchData
} from '@/types';
import { MLBB_HEROES } from '@/lib/data/heroes';

// Tournament & Dynamic Match Engine with Playoff Bracket, Statistics and Awards Gala
export class TournamentEngine {
  public teams: Team[];
  public userTeamId: string;
  public currentWeek: number = 1;
  public totalWeeks: number = 9;
  public stage: 'regular' | 'playoffs' | 'awards' | 'completed' = 'regular';

  public playerStats: Record<string, PlayerSeasonStats> = {};
  public teamStats: Record<string, TeamSeasonStats> = {};
  public heroStats: Record<string, HeroSeasonStats> = {};
  public standings: StandingsItem[] = [];
  public schedule: ScheduleMatch[] = [];
  public playoffMatches: PlayoffMatch[] = [];
  public awards: AwardsData | null = null;
  public championTeam: Team | null = null;

  constructor(teams: Team[], userTeamId: string) {
    this.teams = teams;
    this.userTeamId = userTeamId;
    this.initPlayerStats();
    this.initTeamStats();
    this.initHeroStats();
    this.standings = this.initStandings();
    this.schedule = this.generateSchedule();
  }

  initPlayerStats() {
    this.teams.forEach(team => {
      team.roster.forEach(p => {
        this.playerStats[p.id] = {
          id: p.id,
          name: p.name,
          realName: p.realName,
          role: p.role,
          rating: p.rating,
          teamId: team.id,
          teamName: team.name,
          teamTag: team.tag,
          teamColor: team.themeColor,
          kills: 0,
          deaths: 0,
          assists: 0,
          mvpCount: 0,
          mvpPoints: 0,
          gamesPlayed: 0,
          wins: 0,
          totalDamage: 0,
          heroPool: []
        };
      });
    });
  }

  initTeamStats() {
    this.teams.forEach(team => {
      this.teamStats[team.id] = {
        teamId: team.id,
        teamName: team.name,
        shortName: team.shortName,
        tag: team.tag,
        themeColor: team.themeColor,
        logoUrl: team.logoUrl,
        kills: 0,
        deaths: 0,
        assists: 0,
        gold: 0,
        damage: 0,
        lord: 0,
        tortoise: 0,
        tower: 0
      };
    });
  }

  initHeroStats() {
    MLBB_HEROES.forEach(h => {
      this.heroStats[h.id] = {
        heroId: h.id,
        heroName: h.name,
        heroClass: h.role,
        lane: h.lane,
        avatarIcon: h.avatarIcon,
        tier: h.tier,
        picks: 0,
        bans: 0,
        wins: 0,
        losses: 0,
        winRate: 0
      };
    });
  }

  initStandings(): StandingsItem[] {
    return this.teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      shortName: team.shortName,
      logoColor: team.logoColor,
      themeColor: team.themeColor,
      logoUrl: team.logoUrl,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      gamesWon: 0,
      gamesLost: 0,
      gameDiff: 0,
      points: 0
    }));
  }

  generateSchedule(): ScheduleMatch[] {
    const teamIds = this.teams.map(t => t.id);
    const slots = [...teamIds, 'BYE'];
    const totalRounds = slots.length - 1; // 9 rounds
    const singleRRRounds: [string, string][][] = [];

    let currentSlots = [...slots];
    for (let r = 0; r < totalRounds; r++) {
      const roundMatches: [string, string][] = [];
      for (let i = 0; i < currentSlots.length / 2; i++) {
        const home = currentSlots[i];
        const away = currentSlots[currentSlots.length - 1 - i];
        if (home !== 'BYE' && away !== 'BYE') {
          roundMatches.push([home, away]);
        }
      }
      singleRRRounds.push(roundMatches);

      // Rotate slots keeping slot[0] fixed (Berger algorithm)
      const fixed = currentSlots[0];
      const rest = currentSlots.slice(1);
      const last = rest.pop()!;
      currentSlots = [fixed, last, ...rest];
    }

    const schedule: ScheduleMatch[] = [];
    let matchIdCounter = 1;

    for (let w = 1; w <= 9; w++) {
      const rA_idx = (2 * w - 2);
      const rB_idx = (2 * w - 1);

      const getMatchesForRoundIndex = (idx: number): [string, string][] => {
        if (idx < 9) {
          return singleRRRounds[idx];
        } else {
          // Leg 2 (reverse home/away sides so teams meet twice)
          return singleRRRounds[idx - 9].map(([h, a]) => [a, h]);
        }
      };

      const matchesA = getMatchesForRoundIndex(rA_idx);
      const matchesB = getMatchesForRoundIndex(rB_idx);
      const weekMatches = [...matchesA, ...matchesB];

      weekMatches.forEach(([homeId, awayId]) => {
        schedule.push({
          id: matchIdCounter++,
          week: w,
          homeTeamId: homeId,
          awayTeamId: awayId,
          completed: false,
          result: null
        });
      });
    }

    return schedule;
  }

  getStandingsSorted(): StandingsItem[] {
    return [...this.standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
      if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff;
      return b.gamesWon - a.gamesWon;
    });
  }

  getCurrentWeekMatches(): ScheduleMatch[] {
    return this.schedule.filter(m => m.week === this.currentWeek);
  }

  getUserNextMatch(): ScheduleMatch | PlayoffMatch | null {
    if (this.stage === 'playoffs') {
      return this.getNextPlayoffMatchForUser();
    }
    return this.schedule.find(m => 
      m.week === this.currentWeek && 
      !m.completed && 
      (m.homeTeamId === this.userTeamId || m.awayTeamId === this.userTeamId)
    ) || null;
  }

  recordMatchResult(matchId: number, winnerTeamId: string, homeScore: number, awayScore: number, customStats: any = null) {
    const match = this.schedule.find(m => m.id === matchId);
    if (!match || match.completed) return;

    match.completed = true;
    match.result = { winnerId: winnerTeamId, homeScore, awayScore };

    const homeTeamStand = this.standings.find(s => s.teamId === match.homeTeamId);
    const awayTeamStand = this.standings.find(s => s.teamId === match.awayTeamId);

    if (homeTeamStand && awayTeamStand) {
      homeTeamStand.matchesPlayed++;
      awayTeamStand.matchesPlayed++;

      homeTeamStand.gamesWon += homeScore;
      homeTeamStand.gamesLost += awayScore;
      awayTeamStand.gamesWon += awayScore;
      awayTeamStand.gamesLost += homeScore;

      homeTeamStand.gameDiff = homeTeamStand.gamesWon - homeTeamStand.gamesLost;
      awayTeamStand.gameDiff = awayTeamStand.gamesWon - awayTeamStand.gamesLost;

      if (winnerTeamId === match.homeTeamId) {
        homeTeamStand.matchesWon++;
        homeTeamStand.points += 1;
        awayTeamStand.matchesLost++;
      } else {
        awayTeamStand.matchesWon++;
        awayTeamStand.points += 1;
        homeTeamStand.matchesLost++;
      }
    }

    const homeTeam = this.teams.find(t => t.id === match.homeTeamId);
    const awayTeam = this.teams.find(t => t.id === match.awayTeamId);
    if (homeTeam && awayTeam) {
      this.simulatePlayerStatsForMatch(homeTeam, awayTeam, winnerTeamId, homeScore, awayScore, customStats);
      this.updateTeamStatsForMatch(homeTeam, awayTeam, winnerTeamId, homeScore, awayScore, customStats);
    }
  }

  updateTeamStatsForMatch(homeTeam: Team, awayTeam: Team, winnerTeamId: string, homeScore: number, awayScore: number, customStats: any) {
    const homeTStat = this.teamStats[homeTeam.id];
    const awayTStat = this.teamStats[awayTeam.id];

    if (homeTStat && awayTStat) {
      if (customStats) {
        homeTStat.kills += customStats.score?.blue || 15;
        homeTStat.deaths += customStats.score?.red || 12;
        homeTStat.assists += (customStats.score?.blue || 15) * 2;
        homeTStat.gold += customStats.gold?.blue || 65000;
        homeTStat.damage += 250000;
        homeTStat.lord += customStats.lords?.blue || 1;
        homeTStat.tortoise += customStats.turtles?.blue || 2;
        homeTStat.tower += customStats.turrets?.blue || 6;

        awayTStat.kills += customStats.score?.red || 12;
        awayTStat.deaths += customStats.score?.blue || 15;
        awayTStat.assists += (customStats.score?.red || 12) * 2;
        awayTStat.gold += customStats.gold?.red || 58000;
        awayTStat.damage += 220000;
        awayTStat.lord += customStats.lords?.red || 0;
        awayTStat.tortoise += customStats.turtles?.red || 1;
        awayTStat.tower += customStats.turrets?.red || 3;
      } else {
        const hKills = homeScore * 14 + Math.floor(Math.random() * 8);
        const aKills = awayScore * 14 + Math.floor(Math.random() * 8);

        homeTStat.kills += hKills;
        homeTStat.deaths += aKills;
        homeTStat.assists += hKills * 2;
        homeTStat.gold += hKills * 3500 + 45000;
        homeTStat.damage += hKills * 40000 + 100000;
        homeTStat.lord += homeScore * 2;
        homeTStat.tortoise += homeScore * 2 + 1;
        homeTStat.tower += homeScore * 7 + 2;

        awayTStat.kills += aKills;
        awayTStat.deaths += hKills;
        awayTStat.assists += aKills * 2;
        awayTStat.gold += aKills * 3500 + 45000;
        awayTStat.damage += aKills * 40000 + 100000;
        awayTStat.lord += awayScore * 2;
        awayTStat.tortoise += awayScore * 2 + 1;
        awayTStat.tower += awayScore * 7 + 2;
      }
    }
  }

  recordGameStats(data: PostMatchData) {
    if (!data || !data.heroes) return;

    const winnerSide = data.winnerSide;

    // 1. Update Individual Player Stats & Hero Pool
    data.heroes.forEach((h: any) => {
      const playerId = h.player?.id || h.id;
      const pStat = this.playerStats[playerId];
      if (pStat) {
        pStat.gamesPlayed += 1;
        pStat.kills += (h.kda?.k || 0);
        pStat.deaths += (h.kda?.d || 0);
        pStat.assists += (h.kda?.a || 0);
        pStat.totalDamage += (h.damageDealt || 0);
        
        const isWin = h.side === winnerSide;
        if (isWin) pStat.wins += 1;

        if (!pStat.heroPool) pStat.heroPool = [];
        const heroId = h.hero?.id || h.heroId;
        const heroName = h.hero?.name || h.heroName;
        const existingHero = pStat.heroPool.find((hp: any) => hp.heroId === heroId);
        if (existingHero) {
          existingHero.picks += 1;
          const currentWins = (existingHero.wins || 0) + (isWin ? 1 : 0);
          existingHero.wins = currentWins;
          existingHero.winRate = Math.round((currentWins / existingHero.picks) * 100);
        } else if (heroId) {
          pStat.heroPool.push({
            heroId,
            heroName: heroName || 'Hero',
            picks: 1,
            wins: isWin ? 1 : 0,
            winRate: isWin ? 100 : 0
          });
        }
      }

      // 2. Update Global Hero Stats
      const heroId = h.hero?.id || h.heroId;
      if (heroId && this.heroStats[heroId]) {
        const hStat = this.heroStats[heroId];
        hStat.picks += 1;
        if (h.side === winnerSide) {
          hStat.wins += 1;
        } else {
          hStat.losses += 1;
        }
        hStat.winRate = Math.round((hStat.wins / Math.max(1, hStat.picks)) * 100);
      }
    });

    // 2b. Update Global Hero Ban Stats
    if (data.bans && Array.isArray(data.bans)) {
      data.bans.forEach((b: any) => {
        const banHeroId = typeof b === 'string' ? b : (b.id || b.heroId);
        if (banHeroId && this.heroStats[banHeroId]) {
          this.heroStats[banHeroId].bans += 1;
        }
      });
    }

    // 3. Update MVP Points (+10 per Game MVP)
    if (data.mvp) {
      const mvpPlayerId = data.mvp.player?.id || data.mvp.id;
      const mvpPStat = this.playerStats[mvpPlayerId];
      if (mvpPStat) {
        mvpPStat.mvpCount += 1;
        mvpPStat.mvpPoints = (mvpPStat.mvpPoints || 0) + 10;
      }
    }

    // 4. Update Team Stats
    const blueTeamId = data.winnerSide === 'blue' ? data.winnerTeam?.id : data.loserTeam?.id;
    const redTeamId = data.winnerSide === 'red' ? data.winnerTeam?.id : data.loserTeam?.id;
    if (blueTeamId && this.teamStats[blueTeamId]) {
      const bTStat = this.teamStats[blueTeamId];
      bTStat.kills += (data.score?.blue || 0);
      bTStat.deaths += (data.score?.red || 0);
      bTStat.assists += Math.floor((data.score?.blue || 0) * 1.8);
      bTStat.gold += (data.gold?.blue || 55000);
      bTStat.damage += 220000;
      bTStat.lord += (data.lords?.blue || 0);
      bTStat.tortoise += (data.turtles?.blue || 0);
      bTStat.tower += (data.turrets?.blue || 0);
    }
    if (redTeamId && this.teamStats[redTeamId]) {
      const rTStat = this.teamStats[redTeamId];
      rTStat.kills += (data.score?.red || 0);
      rTStat.deaths += (data.score?.blue || 0);
      rTStat.assists += Math.floor((data.score?.red || 0) * 1.8);
      rTStat.gold += (data.gold?.red || 55000);
      rTStat.damage += 220000;
      rTStat.lord += (data.lords?.red || 0);
      rTStat.tortoise += (data.turtles?.red || 0);
      rTStat.tower += (data.turrets?.red || 0);
    }
  }

  simulatePlayerStatsForMatch(homeTeam: Team, awayTeam: Team, winnerTeamId: string, homeScore: number, awayScore: number, customStats: any) {
    const totalGames = homeScore + awayScore;

    if (customStats && customStats.heroes) {
      this.recordGameStats(customStats);
      return;
    }

    const addTeamSimStats = (team: Team, isWinner: boolean, gamesWon: number) => {
      const starters = team.roster.slice(0, 5);
      let teamMvpCandidate: PlayerSeasonStats | null = null;
      let highestScore = -1;

      for (const p of starters) {
        const pStat = this.playerStats[p.id];
        if (!pStat) continue;

        pStat.gamesPlayed += totalGames;
        pStat.wins += gamesWon;

        let k = 0, d = 0, a = 0;
        if (p.role === 'Jungle' || p.role === 'Gold') {
          k = Math.floor(Math.random() * 5 * totalGames) + (isWinner ? 4 : 1);
          d = Math.floor(Math.random() * 3 * totalGames) + (isWinner ? 1 : 3);
          a = Math.floor(Math.random() * 4 * totalGames) + 2;
        } else if (p.role === 'Mid') {
          k = Math.floor(Math.random() * 4 * totalGames) + 2;
          d = Math.floor(Math.random() * 3 * totalGames) + 2;
          a = Math.floor(Math.random() * 6 * totalGames) + 3;
        } else if (p.role === 'EXP') {
          k = Math.floor(Math.random() * 3 * totalGames) + 1;
          d = Math.floor(Math.random() * 3 * totalGames) + 2;
          a = Math.floor(Math.random() * 5 * totalGames) + 3;
        } else {
          k = Math.floor(Math.random() * 2 * totalGames);
          d = Math.floor(Math.random() * 4 * totalGames) + 2;
          a = Math.floor(Math.random() * 8 * totalGames) + 5;
        }

        pStat.kills += k;
        pStat.deaths += d;
        pStat.assists += a;
        pStat.totalDamage += (k * 25000) + (a * 10000) + Math.floor(Math.random() * 20000);

        // Assign hero from signature/pool
        const sigHeroName = p.signature[Math.floor(Math.random() * p.signature.length)] || 'Suyou';
        const foundHero = MLBB_HEROES.find(h => h.name.toLowerCase() === sigHeroName.toLowerCase()) || MLBB_HEROES[0];
        
        if (!pStat.heroPool) pStat.heroPool = [];
        const existingH = pStat.heroPool.find((hp: any) => hp.heroId === foundHero.id);
        if (existingH) {
          existingH.picks += totalGames;
          const currentWins = (existingH.wins || 0) + gamesWon;
          existingH.wins = currentWins;
          existingH.winRate = Math.round((currentWins / existingH.picks) * 100);
        } else {
          pStat.heroPool.push({
            heroId: foundHero.id,
            heroName: foundHero.name,
            picks: totalGames,
            wins: gamesWon,
            winRate: Math.round((gamesWon / totalGames) * 100)
          });
        }

        // Update global hero stats
        const gHeroStat = this.heroStats[foundHero.id];
        if (gHeroStat) {
          gHeroStat.picks += totalGames;
          gHeroStat.wins += gamesWon;
          gHeroStat.losses += (totalGames - gamesWon);
          gHeroStat.winRate = Math.round((gHeroStat.wins / Math.max(1, gHeroStat.picks)) * 100);
        }

        const score = (k * 3) + (a * 1.5) - (d * 1.5);
        if (score > highestScore) {
          highestScore = score;
          teamMvpCandidate = pStat;
        }
      }

      if (isWinner && teamMvpCandidate) {
        teamMvpCandidate.mvpCount += totalGames > 2 ? 2 : 1;
        teamMvpCandidate.mvpPoints = (teamMvpCandidate.mvpPoints || 0) + (totalGames > 2 ? 20 : 10);
      }
    };

    const isHomeWinner = winnerTeamId === homeTeam.id;
    addTeamSimStats(homeTeam, isHomeWinner, homeScore);
    addTeamSimStats(awayTeam, !isHomeWinner, awayScore);

    // Simulate Meta 10-Hero Bans for AI vs AI Matches
    const metaBanHeroes = [
      'harith', 'ling', 'fanny', 'zhuxin', 'suyou', 'nolan', 
      'hayabusa', 'valentina', 'mathilda', 'joy', 'chip', 'baxia', 
      'tigreal', 'roger', 'julian', 'phoveus', 'helcurt', 'novaria'
    ];
    const shuffledBans = [...metaBanHeroes].sort(() => 0.5 - Math.random()).slice(0, 10);
    shuffledBans.forEach(bId => {
      const bhStat = this.heroStats[bId];
      if (bhStat) {
        bhStat.bans += totalGames;
      }
    });
  }

  simulateRestOfWeek() {
    const uncompletedMatches = this.schedule.filter(m => m.week === this.currentWeek && !m.completed);

    uncompletedMatches.forEach(m => {
      const homeTeam = this.teams.find(t => t.id === m.homeTeamId)!;
      const awayTeam = this.teams.find(t => t.id === m.awayTeamId)!;

      const homePower = homeTeam.reputation + (Math.random() * 20 - 10);
      const awayPower = awayTeam.reputation + (Math.random() * 20 - 10);

      let winnerId = homeTeam.id;
      let homeScore = 2;
      let awayScore = 0;

      if (homePower > awayPower + 5) {
        winnerId = homeTeam.id;
        homeScore = 2;
        awayScore = Math.random() > 0.6 ? 1 : 0;
      } else if (awayPower > homePower + 5) {
        winnerId = awayTeam.id;
        awayScore = 2;
        homeScore = Math.random() > 0.6 ? 1 : 0;
      } else {
        if (Math.random() > 0.5) {
          winnerId = homeTeam.id;
          homeScore = 2;
          awayScore = 1;
        } else {
          winnerId = awayTeam.id;
          awayScore = 2;
          homeScore = 1;
        }
      }

      this.recordMatchResult(m.id, winnerId, homeScore, awayScore);
    });
  }

  simulateOtherWeekMatches() {
    this.simulateRestOfWeek();
  }

  advanceWeek(): { status: 'playoffs_started' | 'week_advanced' } {
    this.simulateRestOfWeek();

    if (this.currentWeek < this.totalWeeks) {
      this.currentWeek++;
      return { status: 'week_advanced' };
    } else {
      this.stage = 'playoffs';
      this.initPlayoffs();
      return { status: 'playoffs_started' };
    }
  }

  // --- Statistics Helpers ---

  getTeamStatsList(): TeamSeasonStats[] {
    return Object.values(this.teamStats).sort((a, b) => b.kills - a.kills);
  }

  getTopKills(limit: number = 5): PlayerSeasonStats[] {
    return Object.values(this.playerStats)
      .sort((a, b) => b.kills - a.kills)
      .slice(0, limit);
  }

  getTopAssists(limit: number = 5): PlayerSeasonStats[] {
    return Object.values(this.playerStats)
      .sort((a, b) => b.assists - a.assists)
      .slice(0, limit);
  }

  getTopAvgKda(limit: number = 5): (PlayerSeasonStats & { kdaRatio: number })[] {
    return Object.values(this.playerStats)
      .map(p => {
        const deaths = Math.max(1, p.deaths);
        const kdaRatio = Number(((p.kills + p.assists) / deaths).toFixed(2));
        return { ...p, kdaRatio };
      })
      .sort((a, b) => b.kdaRatio - a.kdaRatio)
      .slice(0, limit);
  }

  getFilteredPlayerStats(laneFilter: string = 'ALL', teamFilter: string = 'ALL'): (PlayerSeasonStats & {
    avgKills: string;
    avgDeaths: string;
    avgAssists: string;
    avgKda: string;
    killParticipation: string;
  })[] {
    return Object.values(this.playerStats)
      .filter(p => {
        if (laneFilter !== 'ALL' && p.role.toUpperCase() !== laneFilter.toUpperCase()) return false;
        if (teamFilter !== 'ALL' && p.teamId !== teamFilter) return false;
        return true;
      })
      .map(p => {
        const games = Math.max(1, p.gamesPlayed);
        const teamTStat = this.teamStats[p.teamId];
        const teamKills = teamTStat ? Math.max(1, teamTStat.kills) : 1;
        const kp = Math.min(100, Math.round(((p.kills + p.assists) / teamKills) * 100));

        const avgK = (p.kills / games).toFixed(2);
        const avgD = (p.deaths / games).toFixed(2);
        const avgA = (p.assists / games).toFixed(2);
        const kda = ((p.kills + p.assists) / Math.max(1, p.deaths)).toFixed(2);

        return {
          ...p,
          avgKills: avgK,
          avgDeaths: avgD,
          avgAssists: avgA,
          avgKda: kda,
          killParticipation: `${kp}%`
        };
      })
      .sort((a, b) => b.kills - a.kills);
  }

  getTopHeroPicks(limit: number = 5): HeroSeasonStats[] {
    return Object.values(this.heroStats)
      .sort((a, b) => b.picks - a.picks)
      .slice(0, limit);
  }

  getTopHeroBans(limit: number = 5): HeroSeasonStats[] {
    return Object.values(this.heroStats)
      .sort((a, b) => b.bans - a.bans)
      .slice(0, limit);
  }

  getTopHeroWinRates(limit: number = 5): HeroSeasonStats[] {
    return Object.values(this.heroStats)
      .filter(h => h.picks >= 3)
      .sort((a, b) => b.winRate - a.winRate || b.picks - a.picks)
      .slice(0, limit);
  }

  getHeroStatsList(): HeroSeasonStats[] {
    return Object.values(this.heroStats).sort((a, b) => a.heroName.localeCompare(b.heroName));
  }

  getMvpLeaderboard(limit: number = 10): PlayerSeasonStats[] {
    return Object.values(this.playerStats)
      .filter(p => (p.mvpPoints || 0) > 0 || p.mvpCount > 0)
      .sort((a, b) => (b.mvpPoints || 0) - (a.mvpPoints || 0) || b.mvpCount - a.mvpCount)
      .slice(0, limit);
  }

  getMvpStandingsCards(limit: number = 8): {
    rank: number;
    player: PlayerSeasonStats;
    pts: number;
  }[] {
    const sorted = Object.values(this.playerStats)
      .filter(p => (p.mvpPoints || 0) > 0 || p.mvpCount > 0)
      .sort((a, b) => (b.mvpPoints || 0) - (a.mvpPoints || 0) || b.mvpCount - a.mvpCount)
      .slice(0, limit);

    return sorted.map((p, idx) => ({
      rank: idx + 1,
      player: p,
      pts: p.mvpPoints || (p.mvpCount * 10)
    }));
  }

  getPlayerHeroPools(laneFilter: string = 'ALL', teamFilter: string = 'ALL') {
    return Object.values(this.playerStats)
      .filter(p => {
        if (laneFilter !== 'ALL' && p.role.toUpperCase() !== laneFilter.toUpperCase()) return false;
        if (teamFilter !== 'ALL' && p.teamId !== teamFilter) return false;
        return true;
      })
      .map(p => ({
        player: p,
        lane: p.role,
        totalUniqueHeroes: p.heroPool?.length || 0,
        heroes: p.heroPool || []
      }))
      .sort((a, b) => b.totalUniqueHeroes - a.totalUniqueHeroes || b.player.kills - a.player.kills);
  }

  getHeroPlayerPools(limit: number = 15) {
    const heroMap: Record<string, { heroName: string; heroId: string; players: { player: PlayerSeasonStats; picks: number; winRate: number }[] }> = {};

    Object.values(this.playerStats).forEach(p => {
      p.heroPool?.forEach(h => {
        if (!heroMap[h.heroId]) {
          heroMap[h.heroId] = {
            heroName: h.heroName,
            heroId: h.heroId,
            players: []
          };
        }
        heroMap[h.heroId].players.push({
          player: p,
          picks: h.picks,
          winRate: h.winRate
        });
      });
    });

    return Object.values(heroMap)
      .map(h => ({
        ...h,
        totalPlayers: h.players.length
      }))
      .sort((a, b) => b.totalPlayers - a.totalPlayers)
      .slice(0, limit);
  }

  // --- Playoffs Engine ---

  initPlayoffs() {
    const sorted = this.getStandingsSorted();
    const seeds = sorted.slice(0, 6).map(s => this.teams.find(t => t.id === s.teamId)!);

    this.playoffMatches = [
      {
        id: 'r1_m1',
        title: 'Play-in Match 1 (Seed 3 vs Seed 6) • BO5',
        stageName: 'Round 1',
        homeTeam: seeds[2] || this.teams[2],
        awayTeam: seeds[5] || this.teams[5],
        homeScore: 0,
        awayScore: 0,
        winner: null,
        loser: null,
        completed: false
      },
      {
        id: 'r1_m2',
        title: 'Play-in Match 2 (Seed 4 vs Seed 5) • BO5',
        stageName: 'Round 1',
        homeTeam: seeds[3] || this.teams[3],
        awayTeam: seeds[4] || this.teams[4],
        homeScore: 0,
        awayScore: 0,
        winner: null,
        loser: null,
        completed: false
      },
      {
        id: 'ub_semi_1',
        title: 'Upper Bracket Semifinal 1 (Seed 1 vs P2 Winner) • BO5',
        stageName: 'UB Semifinals',
        homeTeam: seeds[0] || this.teams[0],
        awayTeam: null,
        homeScore: 0,
        awayScore: 0,
        winner: null,
        loser: null,
        completed: false
      },
      {
        id: 'ub_semi_2',
        title: 'Upper Bracket Semifinal 2 (Seed 2 vs P1 Winner) • BO5',
        stageName: 'UB Semifinals',
        homeTeam: seeds[1] || this.teams[1],
        awayTeam: null,
        homeScore: 0,
        awayScore: 0,
        winner: null,
        loser: null,
        completed: false
      },
      {
        id: 'lb_semi',
        title: 'Lower Bracket Semifinal (Eliminasi) • BO5',
        stageName: 'LB Semifinals',
        homeTeam: null,
        awayTeam: null,
        homeScore: 0,
        awayScore: 0,
        winner: null,
        loser: null,
        completed: false
      },
      {
        id: 'ub_final',
        title: 'Upper Bracket Final (Tiket Grand Final) • BO5',
        stageName: 'UB Final',
        homeTeam: null,
        awayTeam: null,
        homeScore: 0,
        awayScore: 0,
        winner: null,
        loser: null,
        completed: false
      },
      {
        id: 'lb_final',
        title: 'Lower Bracket Final (Bronze Match / Decider) • BO5',
        stageName: 'LB Final',
        homeTeam: null,
        awayTeam: null,
        homeScore: 0,
        awayScore: 0,
        winner: null,
        loser: null,
        completed: false
      },
      {
        id: 'grand_final',
        title: '🏆 Grand Finals MPL ID 2026 (First to 4 Wins!) • BO7',
        stageName: 'Grand Finals',
        homeTeam: null,
        awayTeam: null,
        homeScore: 0,
        awayScore: 0,
        winner: null,
        loser: null,
        completed: false
      }
    ];
  }

  getCurrentPlayoffMatch(): PlayoffMatch | null {
    return this.playoffMatches.find(m => !m.completed && m.homeTeam && m.awayTeam) || null;
  }

  getNextPlayoffMatchForUser(): PlayoffMatch | null {
    return this.playoffMatches.find(m => 
      !m.completed && 
      m.homeTeam && 
      m.awayTeam && 
      (m.homeTeam.id === this.userTeamId || m.awayTeam.id === this.userTeamId)
    ) || null;
  }

  recordPlayoffMatchResult(matchId: string, winnerId: string, homeScore: number, awayScore: number, customStats: any = null) {
    const match = this.playoffMatches.find(m => m.id === matchId);
    if (!match || match.completed || !match.homeTeam || !match.awayTeam) return;

    match.completed = true;
    match.homeScore = homeScore;
    match.awayScore = awayScore;

    const winner = winnerId === match.homeTeam.id ? match.homeTeam : match.awayTeam;
    const loser = winnerId === match.homeTeam.id ? match.awayTeam : match.homeTeam;

    match.winner = winner;
    match.loser = loser;

    if (customStats && match.homeTeam && match.awayTeam) {
      this.simulatePlayerStatsForMatch(match.homeTeam, match.awayTeam, winnerId, homeScore, awayScore, customStats);
      this.updateTeamStatsForMatch(match.homeTeam, match.awayTeam, winnerId, homeScore, awayScore, customStats);
    }

    this.advancePlayoffTree(match);
  }

  advancePlayoffTree(completedMatch: PlayoffMatch) {
    if (completedMatch.id === 'r1_m1') {
      const ub2 = this.playoffMatches.find(m => m.id === 'ub_semi_2');
      if (ub2) ub2.awayTeam = completedMatch.winner;
    } else if (completedMatch.id === 'r1_m2') {
      const ub1 = this.playoffMatches.find(m => m.id === 'ub_semi_1');
      if (ub1) ub1.awayTeam = completedMatch.winner;
    } else if (completedMatch.id === 'ub_semi_1' || completedMatch.id === 'ub_semi_2') {
      const ub1 = this.playoffMatches.find(m => m.id === 'ub_semi_1');
      const ub2 = this.playoffMatches.find(m => m.id === 'ub_semi_2');
      const ubFinal = this.playoffMatches.find(m => m.id === 'ub_final');
      const lbSemi = this.playoffMatches.find(m => m.id === 'lb_semi');

      if (ub1?.completed && ub2?.completed) {
        if (ubFinal) {
          ubFinal.homeTeam = ub1.winner;
          ubFinal.awayTeam = ub2.winner;
        }
        if (lbSemi) {
          lbSemi.homeTeam = ub1.loser;
          lbSemi.awayTeam = ub2.loser;
        }
      }
    } else if (completedMatch.id === 'lb_semi' || completedMatch.id === 'ub_final') {
      const ubFinal = this.playoffMatches.find(m => m.id === 'ub_final');
      const lbSemi = this.playoffMatches.find(m => m.id === 'lb_semi');
      const lbFinal = this.playoffMatches.find(m => m.id === 'lb_final');

      if (ubFinal?.completed && lbSemi?.completed && lbFinal) {
        lbFinal.homeTeam = ubFinal.loser;
        lbFinal.awayTeam = lbSemi.winner;
      }
    } else if (completedMatch.id === 'lb_final') {
      const ubFinal = this.playoffMatches.find(m => m.id === 'ub_final');
      const grandFinal = this.playoffMatches.find(m => m.id === 'grand_final');

      if (ubFinal && grandFinal) {
        grandFinal.homeTeam = ubFinal.winner;
        grandFinal.awayTeam = completedMatch.winner;
      }
    } else if (completedMatch.id === 'grand_final') {
      this.championTeam = completedMatch.winner;
      this.stage = 'completed';
      this.calculateSeasonAwards();
    }
  }

  simulateCurrentPlayoffMatch() {
    const match = this.getCurrentPlayoffMatch();
    if (!match || !match.homeTeam || !match.awayTeam) return;

    const homePower = match.homeTeam.reputation + (Math.random() * 20 - 10);
    const awayPower = match.awayTeam.reputation + (Math.random() * 20 - 10);

    const isBO7 = match.stageName === 'Grand Finals';
    const targetWins = isBO7 ? 4 : 3;

    let winnerId = match.homeTeam.id;
    let homeScore = targetWins;
    let awayScore = Math.floor(Math.random() * targetWins);

    if (awayPower > homePower) {
      winnerId = match.awayTeam.id;
      awayScore = targetWins;
      homeScore = Math.floor(Math.random() * targetWins);
    }

    this.recordPlayoffMatchResult(match.id, winnerId, homeScore, awayScore);
  }

  calculateSeasonAwards(coachName: string = 'Coach Salman'): AwardsData {
    const allPlayers = Object.values(this.playerStats);

    const sortedByMvp = [...allPlayers].sort((a, b) => b.mvpCount - a.mvpCount || b.kills - a.kills);
    const regularSeasonMvp = sortedByMvp[0] || allPlayers[0];

    const sortedByKills = [...allPlayers].sort((a, b) => b.kills - a.kills);
    const topSlayer = sortedByKills[0] || allPlayers[0];

    const sortedByAssists = [...allPlayers].sort((a, b) => b.assists - a.assists);
    const topPlaymaker = sortedByAssists[0] || allPlayers[0];

    const sortedByKda = [...allPlayers].sort((a, b) => {
      const kdaA = (a.kills + a.assists) / Math.max(1, a.deaths);
      const kdaB = (b.kills + b.assists) / Math.max(1, b.deaths);
      return kdaB - kdaA;
    });
    const topKda = sortedByKda[0] || allPlayers[0];

    const getBestInRole = (role: LaneRole): PlayerSeasonStats => {
      const inRole = allPlayers.filter(p => p.role === role);
      inRole.sort((a, b) => {
        const perfA = a.kills * 2 + a.assists + a.mvpCount * 10 - a.deaths;
        const perfB = b.kills * 2 + b.assists + b.mvpCount * 10 - b.deaths;
        return perfB - perfA;
      });
      return inRole[0] || allPlayers[0];
    };

    const firstTeamAllStar: AllStarTeam = {
      exp: getBestInRole('EXP'),
      jungle: getBestInRole('Jungle'),
      mid: getBestInRole('Mid'),
      gold: getBestInRole('Gold'),
      roam: getBestInRole('Roam')
    };

    const champion = this.championTeam || this.teams[0];
    const champPlayers = champion.roster.map(p => this.playerStats[p.id]).filter(Boolean);
    champPlayers.sort((a, b) => (b.kills + b.assists) - (a.kills + a.assists));
    const finalsMvp = champPlayers[0] || regularSeasonMvp;

    const rookiePool = allPlayers.filter(p => ['tlid_faviannn', 'tlid_aeronn', 'rrq_hajirin', 'ae_gebe'].includes(p.id));
    const rookieOfTheSeason = rookiePool[0] || allPlayers[2];

    const standings = this.getStandingsSorted();
    const topTeamStand = standings[0];
    const topTeam = this.teams.find(t => t.id === topTeamStand.teamId) || this.teams[0];
    const isUserCoach = topTeam.id === this.userTeamId;

    this.awards = {
      championTeam: champion,
      regularSeasonMvp,
      finalsMvp,
      coachOfTheSeason: {
        name: isUserCoach ? (coachName || 'Head Coach') : topTeam.staff?.assistantCoach.name || 'Coach Yeb',
        team: topTeam,
        isUser: isUserCoach
      },
      firstTeamAllStar,
      rookieOfTheSeason,
      topSlayer,
      topPlaymaker,
      topKda
    };

    return this.awards;
  }

  calculateAwards(coachName: string = 'Coach Salman'): AwardsData {
    return this.calculateSeasonAwards(coachName);
  }
}
