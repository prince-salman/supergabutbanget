import { Team, TrendingTopic } from '@/types';
import { TournamentEngine } from '@/lib/tournamentEngine';

export class TrendingEngine {
  generateTrendingTopics(
    userTeam: Team,
    coachName: string,
    tournament: TournamentEngine
  ): TrendingTopic[] {
    const userStanding = tournament.standings.find(s => s.teamId === userTeam.id);
    const winRate = userStanding && userStanding.matchesPlayed > 0
      ? (userStanding.matchesWon / userStanding.matchesPlayed) * 100
      : 50;

    const topics: TrendingTopic[] = [];

    // 1. Coach Performance Tag (#InCoachWeTrust vs #CoachOut)
    if (winRate >= 50 || tournament.schedule.filter(m => m.completed).length === 0) {
      topics.push({
        id: 't_coach_trust',
        rank: 1,
        tag: `#InCoach${coachName.replace(/\s+/g, '')}WeTrust`,
        category: 'Trending di Indonesia • Esports',
        tweetCountStr: '54.2K Tweets',
        sentiment: 'positive',
        headline: `Komunitas suporter memuji racikan 10-Ban dan konsistensi drafting Coach ${coachName}!`,
        topTweet: {
          user: 'Aldo "Kingdom" Pratama',
          handle: '@rrq_aldo99',
          avatar: '👑',
          text: `Gila racikan draft Coach ${coachName} ga pernah gagal! Respect setinggi-tingginya! 🔥 #InCoach${coachName.replace(/\s+/g, '')}WeTrust`,
          likes: 1420
        }
      });
    } else {
      topics.push({
        id: 't_coach_out',
        rank: 1,
        tag: `#EvaluasiCoach${coachName.replace(/\s+/g, '')}`,
        category: 'Trending di Indonesia • Esports',
        tweetCountStr: '68.9K Tweets',
        sentiment: 'negative',
        headline: `Suporter mendesak perombakan strategi drafting usai hasil match yang belum maksimal.`,
        topTweet: {
          user: 'Reza Analyst TikTok',
          handle: '@reza_mlbbanalyst',
          avatar: '📊',
          text: `Hero pool kita luas, tolong fase ban jangan blunder lagi Coach! Saatnya berbenah! #EvaluasiCoach${coachName.replace(/\s+/g, '')}`,
          likes: 2180
        }
      });
    }

    // 2. Team Hype Tag
    topics.push({
      id: 't_team_tag',
      rank: 2,
      tag: `#${userTeam.tag}GO`,
      category: 'Olahraga & Esports • Populer',
      tweetCountStr: '41.7K Tweets',
      sentiment: 'positive',
      headline: `Dukungan suporter membanjiri lini masa MPL ID menjelang laga pekan krusial.`,
      topTweet: {
        user: `${userTeam.shortName} Fanbase ID`,
        handle: `@${userTeam.tag.toLowerCase()}_famz`,
        avatar: '🤖',
        text: `Kawal terus sampai angkat piala MPL musim ini! Gasskeun anak-anak! 🏆 #${userTeam.tag}GO`,
        likes: 980
      }
    });

    // 3. 10-Ban Meta Discussion
    topics.push({
      id: 't_meta_ban',
      rank: 3,
      tag: '#10BanMPL2026',
      category: 'Esports • Sedang Hangat',
      tweetCountStr: '29.3K Tweets',
      sentiment: 'neutral',
      headline: 'Format 10-Hero Ban memaksa seluruh tim beradaptasi dengan fleksibilitas role dan hero counter.',
      topTweet: {
        user: 'Caster Wannabe',
        handle: '@caster_dadakan',
        avatar: '🎙️',
        text: 'Format 10-Ban ngebuktiin mana coach yang punya taktik dalam dan mana yang cuma ngandelin hero META doang!',
        likes: 670
      }
    });

    // 4. Playoff Race or Derby Tag
    if (tournament.stage === 'playoffs') {
      topics.push({
        id: 't_playoffs',
        rank: 4,
        tag: '#MPLIDPlayoffs',
        category: 'Esports • Sorotan Utama',
        tweetCountStr: '88.4K Tweets',
        sentiment: 'positive',
        headline: 'Perebutan takhta juara di babak Upper dan Lower Bracket menyajikan duel BO5 dan BO7 super panas!',
        topTweet: {
          user: 'MPL Lovers Indonesia',
          handle: '@mpl_indo_update',
          avatar: '🏆',
          text: 'Tensi playoff emang beda level! Gak ada ruang buat bikin satu kesalahan kecil pun!',
          likes: 3120
        }
      });
    } else {
      topics.push({
        id: 't_elclasico',
        rank: 4,
        tag: '#DerbyMPLID',
        category: 'Esports • Paling Dicari',
        tweetCountStr: '33.1K Tweets',
        sentiment: 'neutral',
        headline: 'Adu gengsi duel derbi rivalitas memanaskan panggung MPL Arena minggu ini.',
        topTweet: {
          user: 'Dimas EvosFams',
          handle: '@dimas_roar',
          avatar: '🐯',
          text: 'Laga derbi wajib menang, harga diri suporter dipertaruhkan! ⚔️ #DerbyMPLID',
          likes: 840
        }
      });
    }

    // 5. MVP Player Tag
    const topPlayer = tournament.playerStats[0];
    if (topPlayer) {
      topics.push({
        id: 't_mvp_star',
        rank: 5,
        tag: `#${topPlayer.name}Gacor`,
        category: 'Pemain Terbaik • Populer',
        tweetCountStr: '19.8K Tweets',
        sentiment: 'positive',
        headline: `Statistik KDA dan dominasi teamfight ${topPlayer.name} mencuri perhatian publik.`,
        topTweet: {
          user: 'Fajar "Sonic" Hidayat',
          handle: '@sonic_fajar',
          avatar: '⚡',
          text: `${topPlayer.name} mekaniknya emang ga masuk akal! Calon Regular Season MVP nih! 👑`,
          likes: 560
        }
      });
    }

    return topics;
  }
}

export const trendingEngine = new TrendingEngine();
