import { NewsArticle, NetizenComment, NewsCategory, Team, PostMatchData, AwardsData, PlayoffMatch } from '@/types';
import { TournamentEngine } from '@/lib/tournamentEngine';

export const MEDIA_OUTLETS = [
  { name: 'RevivaLTV', tag: 'REVIVAL', logoColor: '#E60000', badgeColor: 'bg-red-600' },
  { name: 'ONE Esports ID', tag: 'ONE', logoColor: '#0052FF', badgeColor: 'bg-blue-600' },
  { name: 'KINCIR Esports', tag: 'KINCIR', logoColor: '#FF6B00', badgeColor: 'bg-amber-600' },
  { name: 'Dunia Games', tag: 'DG', logoColor: '#9B51E0', badgeColor: 'bg-purple-600' },
  { name: 'Upstation Media', tag: 'UPSTATION', logoColor: '#00C853', badgeColor: 'bg-emerald-600' },
  { name: 'MPL Indonesia Official', tag: 'MPL-PRESS', logoColor: '#680008', badgeColor: 'bg-[#680008]' }
];

const NETIZEN_HANDLES = [
  { name: 'Aldo "Kingdom" Pratama', handle: '@rrq_aldo99', avatar: '👑' },
  { name: 'Fajar "Sonic" Hidayat', handle: '@sonic_fajar', avatar: '⚡' },
  { name: 'Dimas EvosFams', handle: '@dimas_roar', avatar: '🐯' },
  { name: 'BTR Robot Troopers', handle: '@btr_fanbase_id', avatar: '🤖' },
  { name: 'AlterChamps Indo', handle: '@champs_ae', avatar: '⚔️' },
  { name: 'Reza Analyst TikTok', handle: '@reza_mlbbanalyst', avatar: '📊' },
  { name: 'Putri Esports Lover', handle: '@putri_mpl2026', avatar: '💖' },
  { name: 'Caster Wannabe', handle: '@caster_dadakan', avatar: '🎙️' }
];

export class NewsEngine {
  public articles: NewsArticle[] = [];

  constructor() {
    this.articles = [];
  }

  // 1. Initial Season Launch News
  initSeasonNews(userTeam: Team, coachName: string) {
    const timeNow = '1 jam yang lalu';

    this.articles = [
      {
        id: `news_init_1_${Date.now()}`,
        mediaOutlet: MEDIA_OUTLETS[0], // RevivaLTV
        headline: `RESMI: Coach ${coachName} Mengambil Alih Kemudi ${userTeam.name} di MPL ID 2026!`,
        subheadline: `Manajemen ${userTeam.name} yakin perombakan filosofi draft akan membawa trofi juara ke markas mereka.`,
        category: 'breaking',
        categoryLabel: '⚡ BREAKING NEWS',
        timestamp: timeNow,
        weekOrStage: 'Pre-Season',
        author: 'Redaksi RevivaLTV',
        featuredTeamTag: userTeam.tag,
        body: [
          `Panggung MPL Indonesia 2026 dikejutkan dengan pengumuman resmi dari ${userTeam.name}. Manajemen tim secara resmi mengontrak Coach ${coachName} sebagai Head Coach baru untuk mengarungi musim kompetisi kasta tertinggi Mobile Legends ini.`,
          `Coach ${coachName} dikenal memiliki pendekatan analitis mendalam terhadap 10-Hero Ban dan pemahaman luas terhadap komposisi hero power pick. Langkah ini disambut hangat oleh komunitas esports dan suporter setia ${userTeam.name}.`,
          `"Target kita jelas bukan sekadar lolos playoff, tapi membawa pulang piala juara ke rumah," tegas Coach ${coachName} dalam sesi perkenalan resmi.`
        ],
        quotes: [
          {
            speaker: `Coach ${coachName}`,
            role: `Head Coach ${userTeam.name}`,
            quote: 'Kami sudah menyusun strategi matang untuk menghadapi semua tim. Bersiaplah melihat eksekusi draft terbaik kami!'
          }
        ],
        netizenReactions: [
          {
            id: 'comm_1',
            username: 'BTR Robot Troopers',
            handle: '@btr_fanbase_id',
            avatar: '🤖',
            timeAgo: '45m lalu',
            content: `Gokil! Welcome Coach ${coachName}! Semoga musim ini draft kita ga bikin ketar-ketir lagi! 🔥`,
            likes: 342,
            badge: 'Top Fan'
          },
          {
            id: 'comm_2',
            username: 'Reza Analyst TikTok',
            handle: '@reza_mlbbanalyst',
            avatar: '📊',
            timeAgo: '30m lalu',
            content: `Menarik banget ngeliat racikan 10-Ban Coach ${coachName}. Hero pool pemain mereka luas, potensi juara gede!`,
            likes: 189
          }
        ],
        isUserRelated: true,
        viewsCount: 14250,
        readTime: '2 min read'
      },
      {
        id: `news_init_2_${Date.now()}`,
        mediaOutlet: MEDIA_OUTLETS[1], // ONE Esports ID
        headline: `Bedah 9 Tim MPL ID 2026: Skuad Mana yang Paling Siap Dominasi Regular Season?`,
        subheadline: `Pertarungan sengit memperebutkan 6 tiket Playoff diprediksi akan berlangsung luar biasa ketat.`,
        category: 'meta_analysis',
        categoryLabel: '📊 ANALISIS META',
        timestamp: '3 jam yang lalu',
        weekOrStage: 'Pre-Season',
        author: 'Robby ONE Esports',
        body: [
          `Musim baru MPL Indonesia 2026 telah resmi bergulir. Format 10-Hero Ban yang semakin menuntut kedalaman hero pool membuat peran Head Coach menjadi faktor paling krusial di panggung Land of Dawn.`,
          `Tim-tim raksasa seperti Fnatic ONIC, RRQ Hoshi, Bigetron Alpha, Team Liquid ID, dan EVOS Glory siap unjuk gigi dengan strategi terbaru mereka. Seluruh mata kini tertuju pada laga pembuka Week 1!`
        ],
        netizenReactions: [
          {
            id: 'comm_3',
            username: 'Dimas EvosFams',
            handle: '@dimas_roar',
            avatar: '🐯',
            timeAgo: '2j lalu',
            content: 'Musim ini bener-bener gak bisa nebak siapa yang bakal juara, semua tim ngeri-ngeri!',
            likes: 95
          }
        ],
        isUserRelated: false,
        viewsCount: 8900,
        readTime: '3 min read'
      }
    ];
  }

  // 2. Generate Match Coverage Article
  generateMatchArticle(
    matchData: PostMatchData,
    seriesInfo: any,
    tournament: TournamentEngine,
    coachName: string,
    userTeamId: string
  ): NewsArticle {
    const isUserMatch = matchData.winnerTeam.id === userTeamId || matchData.loserTeam.id === userTeamId;
    const isUserWinner = matchData.winnerTeam.id === userTeamId;
    const media = MEDIA_OUTLETS[Math.floor(Math.random() * MEDIA_OUTLETS.length)];
    const mvp = matchData.mvp;

    const gameNum = seriesInfo ? seriesInfo.gameNumber : 1;
    const isSeriesOver = seriesInfo ? seriesInfo.isSeriesOver : true;
    const scoreStr = seriesInfo ? `${seriesInfo.homeWins} - ${seriesInfo.awayWins}` : `${matchData.score.blue} - ${matchData.score.red} Kills`;

    let headline = '';
    let subheadline = '';
    let body: string[] = [];
    let quotes: { speaker: string; role: string; quote: string }[] = [];

    if (isUserMatch && isUserWinner) {
      const victoryTitles = [
        `Kecerdikan Taktik Coach ${coachName} Antar ${matchData.winnerTeam.name} Tundukkan ${matchData.loserTeam.name}!`,
        `${mvp.player.name} Tampil Gemilang dengan ${mvp.hero.name}, ${matchData.winnerTeam.name} Raih Kemenangan Krusial!`,
        `Masterclass 10-Ban! ${matchData.winnerTeam.name} Bungkam ${matchData.loserTeam.name} dengan Skor ${scoreStr}!`,
        `Dominasi Total di Land of Dawn: ${matchData.winnerTeam.name} Kunci Poin Berharga Lawan ${matchData.loserTeam.name}!`
      ];
      headline = victoryTitles[Math.floor(Math.random() * victoryTitles.length)];
      subheadline = `Performa memukau dari ${mvp.player.name} (${mvp.hero.name}) dinobatkan sebagai MVP pertandingan.`;

      body = [
        `Pertandingan sengit antara ${matchData.winnerTeam.name} dan ${matchData.loserTeam.name} berakhir dengan senyum lebar bagi kubu ${matchData.winnerTeam.name}. Di bawah arahan taktis Coach ${coachName}, tim berhasil mengeksekusi rencana draft dengan sangat rapi.`,
        `Fase laning disiplin dan penguasaan objektif Lord/Turtle menjadi pembeda utama. ${mvp.player.name} yang memainkan hero andalannya [${mvp.hero.name}] keluar sebagai pahlawan dengan torehan KDA memukau (${mvp.kda.k}/${mvp.kda.d}/${mvp.kda.a}) serta kontribusi teamfight masif.`,
        `${matchData.loserTeam.name} sempat memberikan perlawanan sengit, namun pertahanan kokoh dan inisiasi tepat waktu dari skuad Coach ${coachName} berhasil mengamankan kemenangan mutlak.`
      ];

      quotes = [
        {
          speaker: `Coach ${coachName}`,
          role: `Head Coach ${matchData.winnerTeam.name}`,
          quote: `Anak-anak menjalankan instruksi dengan sangat disiplin. Kami tahu titik lemah draft musuh dan memanfaatkannya sejak fase kontes Turtle.`
        },
        {
          speaker: mvp.player.name,
          role: `MVP Match (${mvp.player.role})`,
          quote: `Kredit untuk Coach ${coachName} yang ngasih hero nyaman buat saya. Sinergi tim lagi on-fire banget!`
        }
      ];
    } else if (isUserMatch && !isUserWinner) {
      const defeatTitles = [
        `${matchData.winnerTeam.name} Tampil Perkasa, Redam Strategi ${matchData.loserTeam.name} dengan Skor ${scoreStr}`,
        `Pertarungan Ketat! ${matchData.winnerTeam.name} Curi Kemenangan dari ${matchData.loserTeam.name}`,
        `Evaluasi Draft Menanti: ${matchData.loserTeam.name} Harus Mengakui Keunggulan ${matchData.winnerTeam.name}`
      ];
      headline = defeatTitles[Math.floor(Math.random() * defeatTitles.length)];
      subheadline = `Coach ${coachName} berjanji akan melakukan evaluasi menyeluruh jelang pertandingan berikutnya.`;

      body = [
        `${matchData.loserTeam.name} harus menelan pil pahit setelah ditaklukkan oleh ${matchData.winnerTeam.name} dalam duel berintensitas tinggi di panggung MPL.`,
        `Meski sempat memberikan perlawanan lewat aksi individu apik, eksekusi teamfight dan keunggulan makro dari ${matchData.winnerTeam.name} terbukti terlalu tangguh. ${mvp.player.name} dari tim pemenang mengamankan gelar MVP.`,
        `Coach ${coachName} dalam sesi tanya jawab media menyatakan timnya akan segera mereset mental dan mempertajam drafting untuk laga berikutnya.`
      ];

      quotes = [
        {
          speaker: `Coach ${coachName}`,
          role: `Head Coach ${matchData.loserTeam.name}`,
          quote: 'Kami melakukan beberapa kesalahan kecil saat rotasi yang berakibat fatal. Kami akan belajar dan bangkit lebih kuat!'
        }
      ];
    } else {
      // AI vs AI Match
      headline = `${matchData.winnerTeam.name} Taklukkan ${matchData.loserTeam.name} (${scoreStr}) dalam Laga Penuh Gengsi!`;
      subheadline = `${mvp.player.name} dinobatkan sebagai MVP usai membawa timnya mengunci poin penuh.`;
      body = [
        `Pertandingan sengit antara dua tim raksasa ${matchData.winnerTeam.name} dan ${matchData.loserTeam.name} menyuguhkan aksi adu mekanik kelas dunia.`,
        `${matchData.winnerTeam.name} berhasil keluar sebagai pemenang berkat keunggulan strategi 10-Ban dan penguasaan area Lord yang disiplin.`
      ];
    }

    const randomNetizens = [...NETIZEN_HANDLES].sort(() => 0.5 - Math.random()).slice(0, 3);
    const comments: NetizenComment[] = randomNetizens.map((n, idx) => {
      const posComments = [
        `Gila gameplay ${mvp.player.name} gacor parah! MVP layak banget! 👑`,
        `Draft Coach ${coachName} emang selalu di luar nalar, respect! 🔥`,
        `Match seru banget parah, Land of Dawn bergetar!`,
        `Mantap banget rotasinya rapih, pertahankan konsistensi ini!`
      ];
      const negComments = [
        `Game seru tapi sayang kalah tipis, semangat next match Coach! 💪`,
        `Draft game tadi butuh lebih banyak frontline tank sih menurutku.`,
        `Tetap dukung, masih ada game berikutnya untuk bangkit!`
      ];

      const pool = isUserWinner ? posComments : negComments;
      return {
        id: `c_${Date.now()}_${idx}`,
        username: n.name,
        handle: n.handle,
        avatar: n.avatar,
        timeAgo: `${(idx + 1) * 7}m lalu`,
        content: pool[Math.floor(Math.random() * pool.length)],
        likes: Math.floor(Math.random() * 250) + 15
      };
    });

    const newArticle: NewsArticle = {
      id: `news_match_${Date.now()}`,
      mediaOutlet: media,
      headline,
      subheadline,
      category: isSeriesOver ? 'match_recap' : 'breaking',
      categoryLabel: isSeriesOver ? '🏆 MATCH RECAP' : '⚡ GAME RESULT',
      timestamp: 'Baru Saja',
      weekOrStage: tournament.stage === 'playoffs' ? 'Playoffs' : `Week ${tournament.currentWeek}`,
      author: `${media.name} Esports Desk`,
      featuredTeamTag: matchData.winnerTeam.tag,
      featuredPlayerName: mvp.player.name,
      featuredHeroName: mvp.hero.name,
      body,
      quotes,
      netizenReactions: comments,
      isUserRelated: isUserMatch,
      viewsCount: Math.floor(Math.random() * 20000) + 5000,
      readTime: '2 min read'
    };

    this.articles.unshift(newArticle);
    return newArticle;
  }

  // 3. Weekly Standing & Meta Recap
  generateWeeklyRecap(week: number, tournament: TournamentEngine) {
    const standings = tournament.getStandingsSorted();
    const topTeam = standings[0];
    const media = MEDIA_OUTLETS[2]; // KINCIR

    const article: NewsArticle = {
      id: `news_week_${week}_${Date.now()}`,
      mediaOutlet: media,
      headline: `Rekap MPL ID Week ${week}: ${topTeam.teamName} Puncaki Klasemen, Persaingan 6 Besar Memanas!`,
      subheadline: `Hanya tim paling konsisten dalam drafting dan eksekusi yang mampu bertahan di puncak klasemen.`,
      category: 'meta_analysis',
      categoryLabel: '📊 REKAP MINGGUAN',
      timestamp: 'Baru Saja',
      weekOrStage: `Week ${week}`,
      author: 'KINCIR Analyst Team',
      body: [
        `Pekan ke-${week} MPL Indonesia telah resmi usai. ${topTeam.teamName} sukses mengamankan posisi teratas klasemen sementara berkat konsistensi performa yang luar biasa.`,
        `Sementara itu, perebutan zona aman playoff (Top 6) semakin sengit di papan tengah. Setiap poin kemenangan di match berikutnya akan sangat menentukan nasib tim untuk melaju ke babak penyisihan Upper dan Lower Bracket!`
      ],
      netizenReactions: [
        {
          id: `c_w_${Date.now()}`,
          username: 'Reza Analyst TikTok',
          handle: '@reza_mlbbanalyst',
          avatar: '📊',
          timeAgo: '15m lalu',
          content: `Klasemen makin ketat! Tim papan tengah wajib evaluasi hero pool sebelum kehabisan waktu!`,
          likes: 412
        }
      ],
      isUserRelated: false,
      viewsCount: 16500,
      readTime: '3 min read'
    };

    this.articles.unshift(article);
    return article;
  }

  // 4. Playoffs & Grand Finals News
  generatePlayoffNews(match: PlayoffMatch, coachName: string, isGrandFinal: boolean = false) {
    const media = MEDIA_OUTLETS[5]; // MPL Press
    const winner = match.winner || match.homeTeam;
    const loser = match.loser || match.awayTeam;

    let headline = '';
    let subheadline = '';

    if (isGrandFinal) {
      headline = `🏆 JUARA SEJATI: ${winner?.name.toUpperCase()} ANGKAT TROFI MPL INDONESIA 2026!`;
      subheadline = `Pertarungan epik Best of 7 (BO7) menobatkan ${winner?.name} sebagai raja baru Mobile Legends Indonesia.`;
    } else {
      headline = `DRAMA PLAYOFFS: ${winner?.name} Tumbangkan ${loser?.name} (${match.homeScore}-${match.awayScore}), Melaju ke Babak Berikutnya!`;
      subheadline = `Tensi tinggi di panggung playoff menghasilkan duel strategi 10-Ban berkelas dunia.`;
    }

    const article: NewsArticle = {
      id: `news_playoff_${match.id}_${Date.now()}`,
      mediaOutlet: media,
      headline,
      subheadline,
      category: isGrandFinal ? 'awards' : 'playoffs',
      categoryLabel: isGrandFinal ? '👑 GRAND FINALS CHAMPION' : '🔥 PLAYOFFS HIGHLIGHT',
      timestamp: 'Baru Saja',
      weekOrStage: 'Playoffs',
      author: 'MPL Official Newsroom',
      featuredTeamTag: winner?.tag,
      body: [
        `Panggung utama Playoffs MPL Indonesia bergemuruh saat ${winner?.name} berhasil menuntaskan perlawanan ${loser?.name}.`,
        `Kemenangan ini membuktikan kematangan strategi, ketenangan mental di bawah tekanan BO5/BO7, dan kejelian drafting sang pelatih di fase krusial.`
      ],
      netizenReactions: [
        {
          id: `c_p_${Date.now()}`,
          username: 'Caster Wannabe',
          handle: '@caster_dadakan',
          avatar: '🎙️',
          timeAgo: '5m lalu',
          content: isGrandFinal ? 'SELAMAT KEPADA SANG JUARA! MATCH TERGOKIL SEPANJANG SEJARAH MPL! 🏆👑' : 'Game playoff emang beda level tegangnya!',
          likes: 850
        }
      ],
      isUserRelated: true,
      viewsCount: 38000,
      readTime: '3 min read'
    };

    this.articles.unshift(article);
    return article;
  }
}

export const newsEngine = new NewsEngine();
