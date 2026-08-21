import { Team, CasterPrediction, MatchDeskAnalysis } from '@/types';
import { TournamentEngine } from '@/lib/tournamentEngine';

export interface CasterProfile {
  name: string;
  role: string;
  avatar: string;
  personality: 'analytical' | 'hype' | 'macro' | 'narrative' | 'global';
}

export const OFFICIAL_CASTERS: CasterProfile[] = [
  {
    name: 'Ko Lius',
    role: 'Lead Esports Analyst',
    avatar: '👨‍💼',
    personality: 'analytical'
  },
  {
    name: 'Ranger Emas',
    role: 'Play-by-Play Shoutcaster',
    avatar: '🎙️',
    personality: 'hype'
  },
  {
    name: 'Om Wawa',
    role: 'Senior Macro Analyst',
    avatar: '🧠',
    personality: 'macro'
  },
  {
    name: 'Pak Pulung',
    role: 'Storyline & Narrative Caster',
    avatar: '🔥',
    personality: 'narrative'
  },
  {
    name: 'Clara Mongstar',
    role: 'Stage Host & Analyst',
    avatar: '✨',
    personality: 'narrative'
  },
  {
    name: 'Mirko',
    role: 'Global Meta Specialist',
    avatar: '🌐',
    personality: 'global'
  }
];

export function generateMatchDeskAnalysis(
  homeTeam: Team,
  awayTeam: Team,
  tournament: TournamentEngine,
  coachName: string
): MatchDeskAnalysis {
  // 1. Calculate community vote based on reputation and standings
  const homeStandings = tournament.standings.find(s => s.teamId === homeTeam.id);
  const awayStandings = tournament.standings.find(s => s.teamId === awayTeam.id);

  const homeScore = (homeTeam.reputation * 1.2) + (homeStandings ? homeStandings.points * 4 : 10);
  const awayScore = (awayTeam.reputation * 1.2) + (awayStandings ? awayStandings.points * 4 : 10);
  const total = homeScore + awayScore;

  let homePercent = Math.round((homeScore / total) * 100);
  homePercent = Math.max(20, Math.min(80, homePercent));
  const awayPercent = 100 - homePercent;

  // 2. Select 3 casters randomly
  const shuffledCasters = [...OFFICIAL_CASTERS].sort(() => 0.5 - Math.random()).slice(0, 3);

  const predictions: CasterPrediction[] = shuffledCasters.map(caster => {
    // Pick prediction based on odds with slight variety
    const favorHome = (Math.random() * 100) < homePercent;
    const predictedWinner = favorHome ? homeTeam : awayTeam;
    const opponent = favorHome ? awayTeam : homeTeam;

    let analysisQuote = '';
    let predictedScore = '2-1';

    if (caster.personality === 'analytical') {
      analysisQuote = `Saya melihat kedalaman 10-Ban Coach di kubu ${predictedWinner.name} lebih variatif. Jika mereka berhasil mengamankan power pick di Phase 1, game ini akan jadi milik mereka.`;
      predictedScore = Math.random() > 0.5 ? '2-0' : '2-1';
    } else if (caster.personality === 'hype') {
      analysisQuote = `Wah ini match bakal meledak parah! Tapi saya jagoin ${predictedWinner.name} karena agresivitas early game Jungler mereka lagi ngeri-ngerinya!`;
      predictedScore = '2-1';
    } else if (caster.personality === 'macro') {
      analysisQuote = `Kunci kemenangan ada di perebutan Turtle pertama. Disiplin set-up objektif ${predictedWinner.name} menurut statistik data jauh lebih solid dibanding ${opponent.name}.`;
      predictedScore = Math.random() > 0.6 ? '2-0' : '2-1';
    } else if (caster.personality === 'narrative') {
      analysisQuote = `Tensi panggung lagi panas banget. Mentalitas skuad ${predictedWinner.name} di bawah asuhan Coach ${coachName} terlihat sangat siap menghadapi tekanan match besar!`;
      predictedScore = '2-1';
    } else {
      analysisQuote = `From a macro perspective, ${predictedWinner.name}'s draft flexibility around the current meta heroes gives them a clear tactical edge in this series.`;
      predictedScore = '2-0';
    }

    return {
      casterName: caster.name,
      role: caster.role,
      avatar: caster.avatar,
      predictedWinnerId: predictedWinner.id,
      predictedScore,
      analysisQuote
    };
  });

  return {
    matchTitle: `${homeTeam.name} vs ${awayTeam.name}`,
    communityVote: {
      homePercent,
      awayPercent
    },
    casterPredictions: predictions
  };
}
