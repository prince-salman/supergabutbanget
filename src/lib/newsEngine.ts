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

  // 2. Generate Highly Realistic & Dynamic Match Coverage Article
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

    const winnerSide = matchData.winnerSide;
    const loserSide = winnerSide === 'blue' ? 'red' : 'blue';

    const winnerKills = matchData.score ? matchData.score[winnerSide] : 15;
    const loserKills = matchData.score ? matchData.score[loserSide] : 8;
    const winnerLords = matchData.lords ? matchData.lords[winnerSide] : 1;
    const loserLords = matchData.lords ? matchData.lords[loserSide] : 0;
    const winnerTurrets = matchData.turrets ? matchData.turrets[winnerSide] : 6;
    const loserTurrets = matchData.turrets ? matchData.turrets[loserSide] : 1;
    const durationMin = Math.floor((matchData.duration || 720) / 60);

    const gameNum = seriesInfo ? seriesInfo.gameNumber : 1;
    const isSeriesOver = seriesInfo ? seriesInfo.isSeriesOver : true;
    const homeWins = seriesInfo ? seriesInfo.homeWins : 1;
    const awayWins = seriesInfo ? seriesInfo.awayWins : 0;
    const scoreStr = seriesInfo ? `${homeWins} - ${awayWins}` : `${winnerKills} - ${loserKills} Kills`;

    // Dynamic Scenario Detection
    const isComeback = winnerKills < loserKills;
    const isStomp = (winnerKills - loserKills >= 10) || (loserTurrets === 0);
    const isBloodBath = (winnerKills + loserKills) >= 28;
    const isLateGameWar = durationMin >= 18;
    const isStealLord = winnerLords > 0 && loserKills >= winnerKills - 3;
    const isCleanZeroDeath = mvp.kda.d === 0;

    // Detect Derby Matchup
    const tag1 = matchData.winnerTeam.tag.toLowerCase();
    const tag2 = matchData.loserTeam.tag.toLowerCase();
    const isElClasico = (tag1.includes('rrq') && tag2.includes('evos')) || (tag1.includes('evos') && tag2.includes('rrq'));
    const isRoyalDerby = (tag1.includes('onic') && tag2.includes('rrq')) || (tag1.includes('rrq') && tag2.includes('onic'));
    const isDerbySTM = (tag1.includes('btr') && tag2.includes('ae')) || (tag1.includes('ae') && tag2.includes('btr'));

    let headline = '';
    let subheadline = '';
    let body: string[] = [];
    let quotes: { speaker: string; role: string; quote: string }[] = [];

    // --- Scenario 1: EL CLASICO INDONESIA ---
    if (isElClasico) {
      if (isUserWinner) {
        headline = `👑 RAJA EL CLASICO! ${matchData.winnerTeam.name} Pecundangi ${matchData.loserTeam.name} Lewat Taktik Jenius Coach ${coachName}!`;
        subheadline = `Atmosfer panggung meledak saat ${mvp.player.name} dinobatkan sebagai Player of the Match.`;
      } else {
        headline = `👑 Laga Sarat Emosi! ${matchData.winnerTeam.name} Rengkuh Kemenangan El Clasico atas ${matchData.loserTeam.name} (${scoreStr})`;
        subheadline = `Coach ${coachName} akui pertahanan lawan sangat disiplin saat perebutan Lord krusial.`;
      }
      body.push(`Laga bertajuk El Clasico Indonesia antara ${matchData.winnerTeam.name} dan ${matchData.loserTeam.name} menyajikan tontonan dengan tensi luar biasa tinggi di arena MPL.`);
    }
    // --- Scenario 2: THE ROYAL DERBY ---
    else if (isRoyalDerby) {
      headline = `⚡ THE ROYAL DERBY MEMANAS! ${matchData.winnerTeam.name} Tundukkan ${matchData.loserTeam.name} dengan Skor ${scoreStr}!`;
      subheadline = `Perang strategi 10-Ban dan perang mekanik tingkat dewa tersaji sepanjang ${durationMin} menit laga.`;
      body.push(`Duel para raja di Land of Dawn kembali membuktikan bahwa The Royal Derby selalu menghadirkan pertarungan mekanik paling presisi di MPL ID.`);
    }
    // --- Scenario 3: DERBY STM ---
    else if (isDerbySTM) {
      headline = `🥊 DERBY STM BERDARAH! ${matchData.winnerTeam.name} Keluar Sebagai Pemenang Usai Hantam ${matchData.loserTeam.name}!`;
      subheadline = `Adu taunting dan jual beli serangan brutal berakhir manis untuk kubu ${matchData.winnerTeam.name}.`;
      body.push(`Sesuai julukannya, Derby STM antara ${matchData.winnerTeam.name} dan ${matchData.loserTeam.name} berlangsung tanpa kompromi sejak menit pertama.`);
    }
    // --- Scenario 4: DRAMATIC COMEBACK (Kalah Kills tapi Menang Game) ---
    else if (isComeback) {
      if (isUserWinner) {
        headline = `🔥 COMEBACK IS REAL! Sempat Tertinggal Kills, ${matchData.winnerTeam.name} Balikkan Keadaan Lawan ${matchData.loserTeam.name}!`;
        subheadline = `Kecerdikan makro Coach ${coachName} membuahkan teamfight pembalik keadaan di menit ke-${durationMin}.`;
      } else {
        headline = `😱 Kena Tikung Menit Akhir! ${matchData.winnerTeam.name} Curi Kemenangan Dramatis dari ${matchData.loserTeam.name}`;
        subheadline = `Satu teamfight di area Lord mengubah segalanya bagi kubu ${matchData.loserTeam.name}.`;
      }
      body.push(`Pertandingan ini membuktikan bahwa selisih kill bukanlah segalanya di Land of Dawn. Meskipun ${matchData.loserTeam.name} sempat unggul agresivitas (${loserKills} vs ${winnerKills} kills), ${matchData.winnerTeam.name} menunjukkan mentalitas baja.`);
    }
    // --- Scenario 5: STOMP / DOMINASI TOTAL (Bantai Mutlak) ---
    else if (isStomp) {
      if (isUserWinner) {
        headline = `🚀 BANTAI MUTLAK! Coach ${coachName} Bawa ${matchData.winnerTeam.name} Gilas ${matchData.loserTeam.name} Tanpa Ampun (${winnerKills}-${loserKills})!`;
        subheadline = `Dominasi total di semua lane, ${mvp.player.name} (${mvp.hero.name}) panen kill tanpa perlawanan berarti.`;
      } else {
        headline = `🌪️ Terkena Badai Agresivitas! ${matchData.loserTeam.name} Tak Berdaya Dihantam ${matchData.winnerTeam.name} (${scoreStr})`;
        subheadline = `Evaluasi besar menanti skuad asuhan Coach ${coachName} usai kalah tempo sejak early game.`;
      }
      body.push(`Permainan luar biasa disiplin dan tempo super agresif dipertontonkan oleh ${matchData.winnerTeam.name}. Sejak menit awal, mereka mengunci seluruh area jungle dan menghabisi ${loserTurrets === 0 ? 'seluruh turret musuh tanpa sisa' : 'pertahanan lawan dengan mulus'}.`);
    }
    // --- Scenario 6: HIGH-KILL BLOODBATH ---
    else if (isBloodBath) {
      headline = `🩸 HUJAN KILL DI LAND OF DAWN! ${matchData.winnerTeam.name} Tundukkan ${matchData.loserTeam.name} dalam Duel ${winnerKills + loserKills} Kills!`;
      subheadline = `Pertarungan penuh kontak fisik dan jual beli serangan tanpa henti memukau ribuan penonton.`;
      body.push(`Tidak ada kata mundur bagi kedua skuad. Sebanyak total ${winnerKills + loserKills} kills tercipta dalam duel berkecepatan tinggi yang menguras fisik dan mental kedua tim.`);
    }
    // --- Scenario 7: STANDARD TACTICAL MASTERCLASS ---
    else {
      if (isUserWinner) {
        headline = `🎯 Taktik 10-Ban Berjalan Sempurna, ${matchData.winnerTeam.name} Kunci Kemenangan Lawan ${matchData.loserTeam.name} (${scoreStr})!`;
        subheadline = `Rotasi objektif disiplin dan pengawalan Lord mengantar tim asuhan Coach ${coachName} meraih poin krusial.`;
      } else {
        headline = `⚔️ Adu Taktik Sengit: ${matchData.winnerTeam.name} Amankan Kemenangan Berharga atas ${matchData.loserTeam.name}`;
        subheadline = `Perlawanan ketat tersaji hingga Lord terakhir mengakhiri duel di menit ke-${durationMin}.`;
      }
      body.push(`Pertandingan sarat analisis taktikal tersaji antara ${matchData.winnerTeam.name} dan ${matchData.loserTeam.name}. Kedua tim saling membaca komposisi draft 10-Ban yang dipersiapkan oleh masing-masing Head Coach.`);
    }

    // Detail Body Content & MVP Accolades
    body.push(
      `${mvp.player.name} yang dipercaya menunggangi hero comfort [${mvp.hero.name}] keluar sebagai pahlawan pertandingan. Dengan torehan statistik ${mvp.kda.k} Kills, ${mvp.kda.d} Deaths, dan ${mvp.kda.a} Assists${isCleanZeroDeath ? ' (Perfect KDA tanpa terbunuh sekali pun!)' : ''}, kontribusinya saat kontes perebutan Lord di menit ke-${durationMin} menjadi kunci mutlak keberhasilan mengunci kemenangan.`
    );

    if (isUserWinner) {
      body.push(
        `Kemenangan ini membawa suntikan moral dan antusiasme luar biasa bagi fanbase ${matchData.winnerTeam.name}, sekaligus menegaskan tangan dingin Coach ${coachName} dalam meracik strategi turnamen kasta tertinggi.`
      );
      quotes = [
        {
          speaker: `Coach ${coachName}`,
          role: `Head Coach ${matchData.winnerTeam.name}`,
          quote: isComeback
            ? `Kami tahu di early game kami tertekan, tapi saya selalu bilang ke pemain: tetap sabar, tunggu momentum Lord dan scaling hero kita. Eksekusi anak-anak luar biasa!`
            : `Draft kami berjalan sesuai rencana 100%. Kami menghukum kesalahan posisi musuh dan bermain dengan kedisiplinan tinggi.`
        },
        {
          speaker: mvp.player.name,
          role: `MVP Match (${mvp.player.role})`,
          quote: `Terima kasih untuk Coach ${coachName} atas draft yang sangat nyaman. Kemenangan ini untuk semua suporter yang selalu percaya pada kami!`
        }
      ];
    } else if (isUserMatch) {
      body.push(
        `Bagi ${matchData.loserTeam.name}, kekalahan ini menjadi bahan refleksi berharga. Coach ${coachName} menyatakan bahwa skuadnya akan segera mempelajari rekaman match untuk memperbaiki transisi teamfight jelang laga selanjutnya.`
      );
      quotes = [
        {
          speaker: `Coach ${coachName}`,
          role: `Head Coach ${matchData.loserTeam.name}`,
          quote: `Kami kehilangan beberapa objektif penting saat momen perebutan Lord. Ini pelajaran berharga dan kami berjanji akan bangkit lebih kuat di laga berikutnya.`
        }
      ];
    } else {
      quotes = [
        {
          speaker: mvp.player.name,
          role: `Player of the Match (${matchData.winnerTeam.name})`,
          quote: `Pertandingan yang sangat keras. ${matchData.loserTeam.name} tim yang tangguh, tapi kami berhasil menjaga fokus hingga base terakhir musuh tumbang.`
        }
      ];
    }

    // Generate Dynamic Real Netizen Reactions
    const randomNetizens = [...NETIZEN_HANDLES].sort(() => 0.5 - Math.random()).slice(0, 3);
    const comments: NetizenComment[] = randomNetizens.map((n, idx) => {
      let content = '';
      if (isElClasico) {
        content = isUserWinner 
          ? `EL CLASICO IS OURS! 👑 Coach ${coachName} emang masternya panggung besar! #Viva${matchData.winnerTeam.tag}`
          : `Gila El Clasico panas banget, match terseru musim ini! Respect kedua tim! 🔥`;
      } else if (isComeback) {
        content = `GOKIL COMEBACK IS REAL! Udah ketar-ketir liat kill ketinggalan, taunya dibalikin pas war Lord! 😱🔥`;
      } else if (isStomp) {
        content = isUserWinner 
          ? `Gak ada obat pembantaian ini mah! 10-Ban Coach ${coachName} bener-bener matiin hero core musuh! 🚀`
          : `Harus evaluasi draft sih, early game langsung kena bantai gitu tempo musuh kenceng bgt.`;
      } else if (isCleanZeroDeath) {
        content = `${mvp.player.name} main ${mvp.hero.name} 0 death gila banget positioningnya! MVP tanpa tanding! 👑`;
      } else {
        const standardPool = isUserWinner
          ? [
              `Gameplay ${mvp.player.name} gacor parah! MVP layak banget! 👑`,
              `Draft Coach ${coachName} emang selalu di luar nalar, respect! 🔥`,
              `Kawal terus sampe Grand Finals! Skuad lagi on-fire banget!`,
              `Mantap rotasinya rapih banget, pertahankan performa ini!`
            ]
          : [
              `Game seru tapi sayang kalah tipis di Lord terakhir, semangat next match Coach! 💪`,
              `Draft game tadi butuh lebih banyak anti-burst sih menurutku, tapi overall udah bagus!`,
              `Tetap dukung, masih ada game berikutnya untuk bangkit!`
            ];
        content = standardPool[Math.floor(Math.random() * standardPool.length)];
      }

      return {
        id: `c_${Date.now()}_${idx}`,
        username: n.name,
        handle: n.handle,
        avatar: n.avatar,
        timeAgo: `${(idx + 1) * 6}m lalu`,
        content,
        likes: Math.floor(Math.random() * 320) + 25
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
      viewsCount: Math.floor(Math.random() * 24000) + 7500,
      readTime: `${Math.max(2, Math.floor(durationMin / 5))} min read`
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
