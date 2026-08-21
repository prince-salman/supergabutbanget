import { Team, PostMatchData, PressQuestion, PressConferenceSession, PressOption } from '@/types';

export class PressConferenceEngine {
  public currentSession: PressConferenceSession | null = null;

  generatePostMatchPressConference(
    matchData: PostMatchData,
    seriesInfo: any,
    coachName: string,
    userTeam: Team
  ): PressConferenceSession {
    const isUserWin = matchData.winnerTeam.id === userTeam.id;
    const enemyTeam = isUserWin ? matchData.loserTeam : matchData.winnerTeam;
    const mvp = matchData.mvp;
    const gameNum = seriesInfo ? seriesInfo.gameNumber : 1;
    const scoreStr = seriesInfo ? `${seriesInfo.homeWins} - ${seriesInfo.awayWins}` : `${matchData.score.blue} - ${matchData.score.red}`;

    const questions: PressQuestion[] = [];

    // Question 1: Draft & Strategy Question (RevivaLTV)
    if (isUserWin) {
      questions.push({
        id: 'q_draft_win',
        reporterName: 'Rian Prasetya',
        outletName: 'RevivaLTV',
        outletTag: 'REVIVAL',
        outletColor: '#E60000',
        question: `Selamat atas kemenangan atas ${enemyTeam.name}! Drafting 10-Ban Coach ${coachName} terlihat sangat mendominasi fase pick hero. Apa instruksi kunci yang Anda tekankan sebelum masuk ke panggung tadi?`,
        options: [
          {
            id: 'opt_1_a',
            tone: 'confident',
            text: `Kami sudah membaca 100% pola hero musuh. Anak-anak cuma tinggal eksekusi sesuai skenario latihan dan terbukti berhasil sempurna!`,
            effectDescription: '🔥 Hype Media +20, Moral Skuad +15',
            moraleChange: 15,
            hypeChange: 20,
            reputationChange: 10
          },
          {
            id: 'opt_1_b',
            tone: 'humble',
            text: `Kredit terbesar untuk kelima pemain di arena. Mereka mengeksekusi draft dengan tenang meski ${enemyTeam.name} memberi perlawanan sengit.`,
            effectDescription: '🤝 Reputasi Pelatih +20, Moral Skuad +10',
            moraleChange: 10,
            hypeChange: 10,
            reputationChange: 20
          },
          {
            id: 'opt_1_c',
            tone: 'analytical',
            text: `Kuncinya ada di penguasaan lane dan kontrol Retri. Kami prioritaskan Turtle di menit 2 untuk snowballing gold.`,
            effectDescription: '🧠 Fokus Taktik +15, Respek Analis +15',
            moraleChange: 10,
            hypeChange: 12,
            reputationChange: 15
          }
        ]
      });
    } else {
      questions.push({
        id: 'q_draft_loss',
        reporterName: 'Rian Prasetya',
        outletName: 'RevivaLTV',
        outletTag: 'REVIVAL',
        outletColor: '#E60000',
        question: `Sayang sekali ${userTeam.name} harus mengakui keunggulan ${enemyTeam.name}. Di game tadi terlihat setup teamfight musuh sangat sulit dibendung. Apa evaluasi utama Coach ${coachName}?`,
        options: [
          {
            id: 'opt_1_loss_a',
            tone: 'analytical',
            text: `Kami kecolongan di fase inisiasi Turtle pertama. Draft musuh punya counter yang efektif untuk frontline kami. Ini jadi PR evaluasi kami.`,
            effectDescription: '🧠 Evaluasi Taktik +15, Moral +5',
            moraleChange: 5,
            hypeChange: 5,
            reputationChange: 10
          },
          {
            id: 'opt_1_loss_b',
            tone: 'confident',
            text: `Kekalahan ini cuma batu loncatan. Kami tahu apa yang salah dan saya jamin kami akan bantai habis di pertemuan berikutnya!`,
            effectDescription: '🔥 Hype Media +25, Reaksi Netizen Terpecah',
            moraleChange: 10,
            hypeChange: 25,
            reputationChange: 5
          },
          {
            id: 'opt_1_loss_c',
            tone: 'humble',
            text: `Saya sebagai Head Coach bertanggung jawab penuh atas kekalahan ini. Kami minta maaf kepada seluruh suporter dan berjanji akan bangkit!`,
            effectDescription: '🤝 Dukungan Fans +25, Respek Komunitas +20',
            moraleChange: 12,
            hypeChange: 10,
            reputationChange: 20
          }
        ]
      });
    }

    // Question 2: Player MVP or Roster Performance (ONE Esports)
    if (isUserWin && mvp) {
      questions.push({
        id: 'q_player_mvp',
        reporterName: 'Siti Rahma',
        outletName: 'ONE Esports ID',
        outletTag: 'ONE',
        outletColor: '#0052FF',
        question: `Performa ${mvp.playerName} dengan hero [${mvp.heroName}] dinobatkan sebagai MVP match hari ini. Apakah hero ini memang senjata rahasia yang sengaja Anda simpan?`,
        options: [
          {
            id: 'opt_2_a',
            tone: 'confident',
            text: `Tentu saja! Hero pool pemain kami sangat dalam. Masih banyak kartu truf rahasia yang belum kami keluarkan!`,
            effectDescription: '🔥 Antusiasme Fans +20, Moral Pemain +15',
            moraleChange: 15,
            hypeChange: 20,
            reputationChange: 10
          },
          {
            id: 'opt_2_b',
            tone: 'humble',
            text: `${mvp.playerName} latihan sangat keras siang dan malam untuk menguasai hero ini. Dia sangat layak mendapatkan apresiasi MVP ini.`,
            effectDescription: '⭐ Chemistry Tim +20, Moral MVP +25',
            moraleChange: 25,
            hypeChange: 10,
            reputationChange: 15
          }
        ]
      });
    } else {
      questions.push({
        id: 'q_playoff_race',
        reporterName: 'Bima Satria',
        outletName: 'KINCIR Esports',
        outletTag: 'KINCIR',
        outletColor: '#FF6B00',
        question: `Persaingan menuju 6 besar Playoff semakin ketat. Bagaimana Coach ${coachName} menjaga fokus mental pemain agar tidak tertekan di laga krusial berikutnya?`,
        options: [
          {
            id: 'opt_2_loss_a',
            tone: 'confident',
            text: `Mentalitas anak-anak sudah teruji di panggung MPL. Kami tidak takut siapapun dan kami akan pastikan tiket Upper Bracket milik kami!`,
            effectDescription: '🔥 Semangat Juang +20, Moral +15',
            moraleChange: 15,
            hypeChange: 15,
            reputationChange: 10
          },
          {
            id: 'opt_2_loss_b',
            tone: 'analytical',
            text: `Kami fokus match by match. Besok kami langsung kembali ke Gaming House untuk review rekaman VOD dan membenahi komunikasi tim.`,
            effectDescription: '🧠 Disiplin Latihan +20, Fokus +15',
            moraleChange: 10,
            hypeChange: 10,
            reputationChange: 15
          }
        ]
      });
    }

    const session: PressConferenceSession = {
      matchTitle: `${userTeam.name} vs ${enemyTeam.name} (${scoreStr})`,
      questions,
      isCompleted: false
    };

    this.currentSession = session;
    return session;
  }
}

export const pressConferenceEngine = new PressConferenceEngine();
