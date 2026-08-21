// Strict TypeScript Definitions for MPL ID Coach Simulator

export type LaneRole = 'EXP' | 'Jungle' | 'Mid' | 'Gold' | 'Roam';
export type HeroClass = 'Assassin' | 'Fighter' | 'Mage' | 'Marksman' | 'Tank' | 'Support';
export type MetaTier = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B';
export type DamageType = 'Physical' | 'Magic' | 'Hybrid';

export type MatchDifficultyKey = 'god_mode' | 'prime' | 'balanced' | 'slump' | 'wildcard';

export interface MatchDifficultyCondition {
  key: MatchDifficultyKey;
  name: string;
  badgeColor: string;
  bgGradient: string;
  icon: string;
  description: string;
  aiDraftBonus: number;
  aiCombatMultiplier: number;
  aiReactionSpeedMs: number;
  aiRetributionAccuracy: number;
  formBonusText: string;
}

export interface Player {
  id: string;
  name: string;
  realName: string;
  role: LaneRole;
  rating: number;
  confidence: number;
  signature: string[];
  avatarUrl?: string;
}

export interface Staff {
  assistantCoach: {
    name: string;
    role: string;
    personality: string;
  };
  analyst?: {
    name: string;
    role: string;
  };
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  logoColor: string;
  themeColor: string;
  secondaryColor: string;
  description: string;
  budget: number;
  reputation: number;
  logoUrl?: string;
  staff?: Staff;
  roster: Player[];
}

export interface HeroStats {
  early: number;
  mid: number;
  late: number;
  cc: number;
  burst: number;
  sustain: number;
  frontline: number;
  waveclear: number;
}

export interface Hero {
  id: string;
  name: string;
  role: HeroClass;
  secondaryRole?: HeroClass | null;
  lane: LaneRole;
  secondaryLane?: LaneRole | null;
  tier: MetaTier;
  damageType: DamageType;
  avatarBg: string;
  avatarIcon: string;
  avatarUrl?: string;
  stats: HeroStats;
  counteredBy: string[];
  counters: string[];
  tags: string[];
}

export interface CoachReplyOption {
  label: string;
  effect: 'suggest' | 'morale';
  heroId?: string;
  confidence?: number;
}

export interface DraftCommsSpeaker {
  name: string;
  role: string;
  type: 'assistant' | 'player';
  avatar: string;
}

export interface SquadDiscussionEntry {
  id: string;
  speakerName: string;
  speakerRole: string;
  avatarIcon: string;
  message: string;
  suggestedHeroName?: string;
  suggestedHeroId?: string;
  isHeadCoach?: boolean;
}

export interface DraftCommsMessage {
  speaker: DraftCommsSpeaker;
  text: string;
  suggestedHeroIds: string[];
  coachReplyOptions: CoachReplyOption[];
  squadDiscussion?: SquadDiscussionEntry[];
}

export interface DraftTurn {
  phase: 'ban' | 'pick';
  side: 'blue' | 'red';
  num: number;
  label: string;
  phaseStage: 'ban_p1' | 'pick_p1' | 'ban_p2' | 'pick_p2';
}

export interface HeroAssignment {
  lane: LaneRole;
  player: Player;
  hero: Hero;
  isSignature: boolean;
}

export interface TeamSynergyStats {
  cc: number;
  burst: number;
  frontline: number;
  sustain: number;
  early: number;
  late: number;
  waveclear: number;
  overall: number;
}

export interface DraftResult {
  blueTeam: Team;
  redTeam: Team;
  bluePicks: Hero[];
  redPicks: Hero[];
  blueBans: Hero[];
  redBans: Hero[];
  blueAssignments: HeroAssignment[];
  redAssignments: HeroAssignment[];
  blueStats: TeamSynergyStats;
  redStats: TeamSynergyStats;
  teamConfidenceBoost: number;
  difficultyCondition?: MatchDifficultyCondition;
}

export interface MatchHeroState {
  id: string;
  heroId: string;
  side: 'blue' | 'red';
  lane: LaneRole;
  playerName: string;
  heroName: string;
  heroIcon: string;
  level: number;
  hp: number;
  maxHp: number;
  gold: number;
  kda: { k: number; d: number; a: number };
  isDead: boolean;
  respawnTimer: number;
  damageDealt: number;
  damageTaken: number;
  items?: any[];
}

export interface MatchObjectiveState {
  type: 'turtle' | 'lord' | 'enhanced_lord';
  status: 'spawning' | 'alive' | 'dead';
  timer: number;
  hp: number;
  maxHp: number;
}

export interface MatchState {
  gameTime: number;
  score: { blue: number; red: number };
  gold: { blue: number; red: number };
  turrets: { blue: number; red: number };
  turtles: { blue: number; red: number };
  lords: { blue: number; red: number };
  objective: MatchObjectiveState;
  tactics: { blue: string; red: string };
  tacticCooldown: number;
  heroes: MatchHeroState[];
  difficultyCondition?: MatchDifficultyCondition;
}

export interface CommentaryEntry {
  time: string;
  text: string;
  type: 'normal' | 'highlight' | 'kill' | 'objective' | 'coach';
}

export interface MatchSeriesInfo {
  matchId: number | string;
  gameNumber: number;
  homeWins: number;
  awayWins: number;
  homeTeam: Team;
  awayTeam: Team;
  isSeriesOver: boolean;
}

export interface PostMatchData {
  winnerSide: 'blue' | 'red';
  winnerTeam: Team;
  loserTeam: Team;
  duration: number;
  score: { blue: number; red: number };
  gold: { blue: number; red: number };
  turrets: { blue: number; red: number };
  turtles: { blue: number; red: number };
  lords: { blue: number; red: number };
  mvp: any;
  heroes: any[];
  difficultyCondition?: MatchDifficultyCondition;
  seriesInfo?: MatchSeriesInfo;
}

export interface StandingsItem {
  teamId: string;
  teamName: string;
  shortName: string;
  logoColor: string;
  themeColor: string;
  logoUrl?: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  gamesWon: number;
  gamesLost: number;
  gameDiff: number;
  points: number;
}

export interface ScheduleMatch {
  id: number;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  completed: boolean;
  result: { winnerId: string; homeScore: number; awayScore: number } | null;
  difficultyCondition?: MatchDifficultyCondition;
}

export interface PlayoffMatch {
  id: string;
  title: string;
  stageName: 'Round 1' | 'UB Semifinals' | 'LB Semifinals' | 'UB Final' | 'LB Final' | 'Grand Finals';
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: number;
  awayScore: number;
  winner: Team | null;
  loser: Team | null;
  completed: boolean;
  difficultyCondition?: MatchDifficultyCondition;
}

export interface PlayerSeasonStats {
  id: string;
  name: string;
  realName: string;
  role: LaneRole;
  rating: number;
  teamId: string;
  teamName: string;
  teamTag: string;
  teamColor: string;
  kills: number;
  deaths: number;
  assists: number;
  mvpCount: number;
  gamesPlayed: number;
  wins: number;
  totalDamage: number;
  mvpPoints?: number;
  heroPool?: {
    heroId: string;
    heroName: string;
    picks: number;
    wins?: number;
    winRate: number;
  }[];
}

export interface AllStarTeam {
  exp: PlayerSeasonStats;
  jungle: PlayerSeasonStats;
  mid: PlayerSeasonStats;
  gold: PlayerSeasonStats;
  roam: PlayerSeasonStats;
}

export interface AwardsData {
  championTeam: Team;
  regularSeasonMvp: PlayerSeasonStats;
  finalsMvp: PlayerSeasonStats;
  coachOfTheSeason: {
    name: string;
    team: Team;
    isUser: boolean;
  };
  firstTeamAllStar: AllStarTeam;
  rookieOfTheSeason: PlayerSeasonStats;
  topSlayer: PlayerSeasonStats;
  topPlaymaker: PlayerSeasonStats;
  topKda: PlayerSeasonStats;
}

export interface TeamSeasonStats {
  teamId: string;
  teamName: string;
  shortName: string;
  tag: string;
  themeColor: string;
  logoUrl?: string;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  damage: number;
  lord: number;
  tortoise: number;
  tower: number;
}

export interface HeroSeasonStats {
  heroId: string;
  heroName: string;
  heroClass: HeroClass;
  lane: LaneRole;
  avatarIcon: string;
  tier: MetaTier;
  picks: number;
  bans: number;
  wins: number;
  losses: number;
  winRate: number;
}

export type NewsCategory = 'match_recap' | 'interview' | 'meta_analysis' | 'breaking' | 'playoffs' | 'awards';

export interface NetizenComment {
  id: string;
  username: string;
  avatar: string;
  handle: string;
  timeAgo: string;
  content: string;
  likes: number;
  badge?: string;
}

export interface NewsArticle {
  id: string;
  mediaOutlet: {
    name: string;
    tag: string;
    logoColor: string;
    badgeColor: string;
  };
  headline: string;
  subheadline: string;
  category: NewsCategory;
  categoryLabel: string;
  timestamp: string;
  weekOrStage: string;
  author: string;
  featuredTeamTag?: string;
  featuredPlayerName?: string;
  featuredHeroName?: string;
  body: string[];
  quotes?: {
    speaker: string;
    role: string;
    quote: string;
  }[];
  netizenReactions: NetizenComment[];
  isUserRelated: boolean;
  viewsCount: number;
  readTime: string;
}

// 1. Caster & Analyst Desk Prediction (Feature 53)
export interface CasterPrediction {
  casterName: string;
  role: string;
  avatar: string;
  predictedWinnerId: string;
  predictedScore: string;
  analysisQuote: string;
}

export interface MatchDeskAnalysis {
  matchTitle: string;
  communityVote: {
    homePercent: number;
    awayPercent: number;
  };
  casterPredictions: CasterPrediction[];
}

// 2. Pre-Match Derby & Trash Talk (Feature 52)
export interface DerbyInfo {
  isDerby: boolean;
  derbyName: string;
  derbyBadge: string;
  description: string;
  hypeMultiplier: number;
}

export interface TrashTalkOption {
  id: string;
  tone: 'spicy' | 'humble' | 'tactical';
  title: string;
  quote: string;
  hypeBoost: number;
  moraleBoost: number;
}

// 3. Interactive Press Conference (Feature 51)
export interface PressOption {
  id: string;
  text: string;
  tone: 'confident' | 'humble' | 'spicy' | 'analytical';
  effectDescription: string;
  moraleChange: number;
  hypeChange: number;
  reputationChange: number;
}

export interface PressQuestion {
  id: string;
  reporterName: string;
  outletName: string;
  outletTag: string;
  outletColor: string;
  question: string;
  options: PressOption[];
  selectedOptionId?: string;
}

export interface PressConferenceSession {
  matchTitle: string;
  questions: PressQuestion[];
  isCompleted: boolean;
}

// 4. Draft History Head-to-Head (Feature 38)
export interface HeadToHeadDraftRecord {
  matchId: string | number;
  dateStr: string;
  stageStr: string;
  userPicks: string[];
  enemyPicks: string[];
  userBans: string[];
  enemyBans: string[];
  userWon: boolean;
  score: string;
}

// 5. Trending Topics & Netizen Hashtags (Feature 57)
export interface TrendingTopic {
  id: string;
  rank: number;
  tag: string;
  category: string;
  tweetCountStr: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  headline: string;
  topTweet: {
    user: string;
    handle: string;
    avatar: string;
    text: string;
    likes: number;
  };
}

