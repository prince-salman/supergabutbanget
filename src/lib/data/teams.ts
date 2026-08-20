import { Team } from '@/types';

// Data Resmi 9 Tim dan Roster Pro Player MPL Indonesia (Sesuai id-mpl.com/team/*)
export const MPL_TEAMS: Team[] = [
  {
    id: "rrq",
    name: "RRQ Hoshi",
    shortName: "RRQ",
    tag: "RRQ",
    logoColor: "#f7b500",
    themeColor: "#e67e22",
    secondaryColor: "#111111",
    logoUrl: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/rrq-500.png",
    description: "Sang Raja dari Segala Raja dengan basis fans Kingdom terbesar dan tradisi juara.",
    budget: 88000,
    reputation: 94,
    staff: {
      assistantCoach: { name: "Coach Kayleb", role: "Asst. Coach & Draft Analyst", personality: "Analitis & Fokus Counter Pick" },
      analyst: { name: "Analyst Adi", role: "Macro & Draft Strategist" }
    },
    roster: [
      { id: "rrq_joshua", name: "JOSHUA", realName: "Joshua", role: "EXP", rating: 89, confidence: 88, signature: ["Terizla", "Arlott", "Yu Zhong", "Ruby", "Paquito"] },
      { id: "rrq_demonkite", name: "DEMONKITE", realName: "Michael Carandang", role: "Jungle", rating: 92, confidence: 90, signature: ["Ling", "Hayabusa", "Fanny", "Suyou", "Nolan"] },
      { id: "rrq_hajirin", name: "HAJIRIN", realName: "Hajirin", role: "Mid", rating: 88, confidence: 86, signature: ["Zhuxin", "Novaria", "Valentina", "Pharsa", "Yve"] },
      { id: "rrq_arthur", name: "ARTHUR", realName: "Arthur", role: "Gold", rating: 91, confidence: 90, signature: ["Claude", "Harith", "Moskov", "Beatrix", "Roger"] },
      { id: "rrq_said", name: "SAID", realName: "Said", role: "Roam", rating: 89, confidence: 87, signature: ["Tigreal", "Chou", "Mathilda", "Grock", "Atlas"] },
      { id: "rrq_clayyy", name: "CLAYYY", realName: "Deden Muhammad", role: "Mid", rating: 88, confidence: 85, signature: ["Yve", "Faramis", "Kadita", "Lylia", "Vexana"] },
      { id: "rrq_habil", name: "HABIL", realName: "Habil", role: "Gold", rating: 86, confidence: 84, signature: ["Karrie", "Natan", "Brody", "Irithel", "Bruno"] }
    ]
  },
  {
    id: "onic",
    name: "Fnatic ONIC",
    shortName: "ONIC",
    tag: "ONIC",
    logoColor: "#ffd700",
    themeColor: "#f1c40f",
    secondaryColor: "#000000",
    logoUrl: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/onic-b-256.png",
    description: "Raja Langit, sang dominator dengan sinergi micro dan macro kelas dunia.",
    budget: 95000,
    reputation: 96,
    staff: {
      assistantCoach: { name: "Coach CW", role: "Head Coach & Mastermind", personality: "Tenang, Disiplin & Mengutamakan Sinergi" },
      analyst: { name: "Analyst Yeb", role: "Macro & Tactical Analyst" }
    },
    roster: [
      { id: "onic_lutpi", name: "LUTPI", realName: "Lutfi Ardiansyah", role: "EXP", rating: 91, confidence: 89, signature: ["Terizla", "Arlott", "Edith", "Benedetta", "Cici"] },
      { id: "onic_kairi", name: "KAIRI", realName: "Kairi Rayosdelsol", role: "Jungle", rating: 96, confidence: 95, signature: ["Hayabusa", "Ling", "Lancelot", "Suyou", "Fanny"] },
      { id: "onic_sanz", name: "SANZ", realName: "Gilang", role: "Mid", rating: 95, confidence: 94, signature: ["Valentina", "Kadita", "Novaria", "Zhuxin", "Faramis"] },
      { id: "onic_kelra", name: "KELRA", realName: "Grant Duane Pillas", role: "Gold", rating: 94, confidence: 93, signature: ["Claude", "Harith", "Beatrix", "Moskov", "Roger"] },
      { id: "onic_kiboy", name: "KIBOY", realName: "Nicky Fernando", role: "Roam", rating: 95, confidence: 94, signature: ["Chou", "Tigreal", "Khufra", "Mathilda", "Minotaur"] },
      { id: "onic_ssamuel", name: "SSAMUEL", realName: "Samuel", role: "Roam", rating: 87, confidence: 85, signature: ["Grock", "Atlas", "Franco", "Hylos", "Arlott"] }
    ]
  },
  {
    id: "tlid",
    name: "Team Liquid ID",
    shortName: "TLID",
    tag: "TLID",
    logoColor: "#0b2240",
    themeColor: "#0070ba",
    secondaryColor: "#ffffff",
    logoUrl: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/TLID-Primary500x500.png",
    description: "Sang Kuda Biru revolusioner, pembawa meta agresif dengan mekanik gila.",
    budget: 92000,
    reputation: 95,
    staff: {
      assistantCoach: { name: "Coach Honjaw", role: "Head Coach", personality: "Agresif, Mengutamakan Early Tempo" },
      analyst: { name: "Analyst Facehugger", role: "Hero Pool & Draft Scout" }
    },
    roster: [
      { id: "tlid_aran", name: "ARAN", realName: "Aran", role: "EXP", rating: 92, confidence: 91, signature: ["Badang", "Benedetta", "Paquito", "Chou", "Arlott"] },
      { id: "tlid_kevin", name: "KEVIN", realName: "Kevin", role: "Jungle", rating: 94, confidence: 93, signature: ["Suyou", "Ling", "Hayabusa", "Nolan", "Alpha"] },
      { id: "tlid_drichel", name: "DRICHEL", realName: "Drichel", role: "Mid", rating: 90, confidence: 89, signature: ["Zhuxin", "Aurora", "Novaria", "Valentina", "Pharsa"] },
      { id: "tlid_keven", name: "KEVEN", realName: "Keven", role: "Gold", rating: 92, confidence: 91, signature: ["Harith", "Claude", "Roger", "Moskov", "Karrie"] },
      { id: "tlid_lyoni", name: "LYONI", realName: "Lyoni", role: "Roam", rating: 93, confidence: 92, signature: ["Chou", "Franco", "Tigreal", "Mathilda", "Jawhead"] },
      { id: "tlid_anaver", name: "ANAVER", realName: "Anaver", role: "Mid", rating: 88, confidence: 86, signature: ["Vexana", "Faramis", "Kadita", "Lylia", "Yve"] }
    ]
  },
  {
    id: "btr",
    name: "Bigetron Alpha",
    shortName: "BTR",
    tag: "BTR",
    logoColor: "#e02020",
    themeColor: "#d91e18",
    secondaryColor: "#ffffff",
    logoUrl: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/btr_vit.png",
    description: "Robot Merah penuh determinasi dengan gaya laning disiplin dan rotasi cepat.",
    budget: 85000,
    reputation: 91,
    staff: {
      assistantCoach: { name: "Coach K Dot", role: "Head Coach", personality: "Fokus Disiplin & Teamfight Lord" },
      analyst: { name: "Analyst Her", role: "Macro Analyst" }
    },
    roster: [
      { id: "btr_shogun", name: "SHOGUN", realName: "Shogun", role: "EXP", rating: 89, confidence: 88, signature: ["Terizla", "Arlott", "Ruby", "Hylos", "Gatotkaca"] },
      { id: "btr_nnael", name: "NNAEL", realName: "Manuel Simbolon", role: "Jungle", rating: 93, confidence: 92, signature: ["Fanny", "Nolan", "Ling", "Suyou", "Baxia"] },
      { id: "btr_morenooo", name: "MORENOOO", realName: "Moreno", role: "Mid", rating: 92, confidence: 91, signature: ["Valentina", "Novaria", "Zhuxin", "Pharsa", "Lylia"] },
      { id: "btr_emann", name: "EMANN", realName: "Eman Sangco", role: "Gold", rating: 93, confidence: 93, signature: ["Harith", "Claude", "Roger", "Karrie", "Moskov"] },
      { id: "btr_finn", name: "FINN", realName: "Finn", role: "Roam", rating: 89, confidence: 88, signature: ["Grock", "Tigreal", "Mathilda", "Minotaur", "Chou"] },
      { id: "btr_miguel", name: "MIGUEL", realName: "Miguel", role: "Gold", rating: 87, confidence: 85, signature: ["Beatrix", "Bruno", "Brody", "Natan", "Irithel"] }
    ]
  },
  {
    id: "evos",
    name: "EVOS Glory",
    shortName: "EVOS",
    tag: "EVOS",
    logoColor: "#004883",
    themeColor: "#004883",
    secondaryColor: "#ffffff",
    logoUrl: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/evos-500.png",
    description: "Macan Putih legendaris, juara dunia M1 dengan sejarah panjang di kancah MLBB internasional.",
    budget: 86000,
    reputation: 90,
    staff: {
      assistantCoach: { name: "Coach Aldo", role: "Head Coach", personality: "Mendorong Inisiasi Cepat & Agresif" },
      analyst: { name: "Analyst Bravo", role: "Meta & Data Scout" }
    },
    roster: [
      { id: "evos_vell", name: "VELL", realName: "Vell", role: "EXP", rating: 88, confidence: 87, signature: ["Terizla", "Arlott", "Yu Zhong", "Cici", "Benedetta"] },
      { id: "evos_alberttt", name: "ALBERTTT", realName: "Albert Neilsen", role: "Jungle", rating: 94, confidence: 93, signature: ["Hayabusa", "Ling", "Suyou", "Lancelot", "Nolan"] },
      { id: "evos_drianw", name: "DRIANW", realName: "Adriand Larsen", role: "Mid", rating: 89, confidence: 88, signature: ["Zhuxin", "Valentina", "Novaria", "Faramis", "Kadita"] },
      { id: "evos_erlan", name: "ERLAN", realName: "Erlan", role: "Gold", rating: 89, confidence: 88, signature: ["Claude", "Karrie", "Harith", "Moskov", "Brody"] },
      { id: "evos_muezza", name: "MUEZZA", realName: "Muezza", role: "Roam", rating: 88, confidence: 87, signature: ["Tigreal", "Khufra", "Mathilda", "Minotaur", "Atlas"] },
      { id: "evos_rendyyy", name: "RENDYYY", realName: "Rendy", role: "EXP", rating: 86, confidence: 84, signature: ["Lapu-Lapu", "Paquito", "Chou", "Ruby", "Hylos"] }
    ]
  },
  {
    id: "ae",
    name: "Alter Ego",
    shortName: "AE",
    tag: "AE",
    logoColor: "#222222",
    themeColor: "#c0392b",
    secondaryColor: "#111111",
    logoUrl: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/ae-256.png",
    description: "Kuda Hitam 'Alterchamp' yang dikenal dengan gaya bertarung pantang menyerah.",
    budget: 82000,
    reputation: 89,
    staff: {
      assistantCoach: { name: "Coach Xepher", role: "Head Coach", personality: "Agresif & Invasi Buff Musuh" },
      analyst: { name: "Analyst Styx", role: "Strategy & Tactical Advisor" }
    },
    roster: [
      { id: "ae_nino", name: "Nino", realName: "Syauki", role: "EXP", rating: 90, confidence: 89, signature: ["Terizla", "Arlott", "Yu Zhong", "Benedetta", "Ruby"] },
      { id: "ae_reyy", name: "Reyy", realName: "Reynaldo", role: "Jungle", rating: 89, confidence: 88, signature: ["Suyou", "Hayabusa", "Baxia", "Nolan", "Ling"] },
      { id: "ae_dalvin", name: "Dalvin", realName: "Dalvin", role: "Mid", rating: 87, confidence: 86, signature: ["Zhuxin", "Valentina", "Kadita", "Lylia", "Pharsa"] },
      { id: "ae_dingarai", name: "Dingarai", realName: "Dingarai", role: "Gold", rating: 88, confidence: 87, signature: ["Harith", "Claude", "Moskov", "Beatrix", "Karrie"] },
      { id: "ae_alexander", name: "Alexander", realName: "Alexander", role: "Roam", rating: 88, confidence: 87, signature: ["Tigreal", "Chou", "Grock", "Khufra", "Atlas"] },
      { id: "ae_affan", name: "Affan", realName: "Affan", role: "Jungle", rating: 87, confidence: 85, signature: ["Guinevere", "Fanny", "Lancelot", "Fredrinn", "Roger"] },
      { id: "ae_halim", name: "Halim", realName: "Halim", role: "Mid", rating: 85, confidence: 83, signature: ["Novaria", "Vexana", "Yve", "Faramis", "Cecilion"] },
      { id: "ae_ivann", name: "Ivann", realName: "Ivann", role: "Roam", rating: 86, confidence: 84, signature: ["Minotaur", "Mathilda", "Franco", "Hylos", "Kaja"] }
    ]
  },
  {
    id: "geek",
    name: "Geek Fam ID",
    shortName: "GEEK",
    tag: "GEEK",
    logoColor: "#000000",
    themeColor: "#d32f2f",
    secondaryColor: "#ffffff",
    logoUrl: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/geek-500.png",
    description: "The King Slayer! Tim dengan kedisiplinan teamfight tinggi dan kapten pemikir ulung.",
    budget: 80000,
    reputation: 88,
    staff: {
      assistantCoach: { name: "Coach Erpang", role: "Head Coach", personality: "Fokus Setup Teamfight & Anti-Dive" },
      analyst: { name: "Analyst Vivy", role: "Tactical & Draft Scout" }
    },
    roster: [
      { id: "geek_marcel", name: "MARCEL", realName: "Marcel", role: "EXP", rating: 88, confidence: 87, signature: ["Terizla", "Arlott", "Yu Zhong", "Lapu-Lapu", "Ruby"] },
      { id: "geek_nazara", name: "NAZARA", realName: "Nazara", role: "Jungle", rating: 90, confidence: 89, signature: ["Suyou", "Baxia", "Fredrinn", "Ling", "Guinevere"] },
      { id: "geek_aboyy", name: "ABOYY", realName: "Valent Agapito", role: "Mid", rating: 90, confidence: 89, signature: ["Valentina", "Novaria", "Zhuxin", "Kadita", "Pharsa"] },
      { id: "geek_kennzyyskie", name: "KENNZYYSKIE", realName: "Kennzyyskie", role: "Gold", rating: 89, confidence: 88, signature: ["Harith", "Claude", "Roger", "Bruno", "Karrie"] },
      { id: "geek_audytzy", name: "AUDYTZY", realName: "Audytzy", role: "Roam", rating: 91, confidence: 91, signature: ["Mathilda", "Helcurt", "Franco", "Kaja", "Tigreal"] },
      { id: "geek_febriii", name: "FEBRIII", realName: "Febri", role: "EXP", rating: 86, confidence: 84, signature: ["Gatotkaca", "Hylos", "Edith", "Cici", "Paquito"] }
    ]
  },
  {
    id: "dewa",
    name: "Dewa United Esports",
    shortName: "DEWA",
    tag: "DEWA",
    logoColor: "#cda043",
    themeColor: "#d4af37",
    secondaryColor: "#1a1a1a",
    logoUrl: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/dewa-united-500.png",
    description: "Anak Dewa yang penuh kejutan dengan kombinasi veteran berpengalaman dan talenta muda.",
    budget: 78000,
    reputation: 86,
    staff: {
      assistantCoach: { name: "Coach Right", role: "Head Coach", personality: "Fokus Lategame Scaling" },
      analyst: { name: "Analyst Laufeyson", role: "Data & Draft Analyst" }
    },
    roster: [
      { id: "dewa_qinn", name: "QINN", realName: "Qinn", role: "EXP", rating: 87, confidence: 86, signature: ["Terizla", "Yu Zhong", "Arlott", "Hylos", "Edith"] },
      { id: "dewa_kayn", name: "KAYN", realName: "Kayn", role: "Jungle", rating: 88, confidence: 87, signature: ["Suyou", "Hayabusa", "Baxia", "Nolan", "Ling"] },
      { id: "dewa_octa", name: "OCTA", realName: "Octa", role: "Mid", rating: 88, confidence: 87, signature: ["Zhuxin", "Valentina", "Novaria", "Vexana", "Faramis"] },
      { id: "dewa_maybeee", name: "MAYBEEE", realName: "Maybeee", role: "Gold", rating: 88, confidence: 87, signature: ["Claude", "Karrie", "Harith", "Moskov", "Brody"] },
      { id: "dewa_itoshi", name: "ITOSHI KESU", realName: "Itoshi Kesu", role: "Roam", rating: 87, confidence: 86, signature: ["Tigreal", "Minotaur", "Mathilda", "Grock", "Chou"] },
      { id: "dewa_rulgood", name: "RUL GOOD", realName: "Rul Good", role: "Roam", rating: 85, confidence: 83, signature: ["Atlas", "Franco", "Khufra", "Kaja", "Hylos"] }
    ]
  },
  {
    id: "navi",
    name: "NAVI Esports (Rebellion)",
    shortName: "NAVI",
    tag: "NAVI",
    logoColor: "#ffee00",
    themeColor: "#ffd600",
    secondaryColor: "#000000",
    logoUrl: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/NAVI-2.png",
    description: "Banteng Kuning-Hitam, siap mendobrak panggung papan atas MPL Indonesia.",
    budget: 77000,
    reputation: 85,
    staff: {
      assistantCoach: { name: "Coach Ynot", role: "Head Coach", personality: "Fokus Pick-off & Disrupsi" },
      analyst: { name: "Analyst Han", role: "Draft & Hero Pool Analyst" }
    },
    roster: [
      { id: "navi_karss", name: "KARSS", realName: "Karss", role: "EXP", rating: 89, confidence: 88, signature: ["Arlott", "Terizla", "Ruby", "Yu Zhong", "Paquito"] },
      { id: "navi_andoryuuu", name: "ANDORYUUU", realName: "Andoryuuu", role: "Jungle", rating: 88, confidence: 87, signature: ["Suyou", "Hayabusa", "Nolan", "Ling", "Baxia"] },
      { id: "navi_jiizee", name: "JIIZEE", realName: "Jiizee", role: "Mid", rating: 88, confidence: 87, signature: ["Zhuxin", "Kadita", "Valentina", "Yve", "Lylia"] },
      { id: "navi_zeonn", name: "ZEONN", realName: "Zeonn", role: "Gold", rating: 88, confidence: 87, signature: ["Harith", "Claude", "Roger", "Karrie", "Beatrix"] },
      { id: "navi_aprho", name: "APRHO", realName: "Aprho", role: "Roam", rating: 88, confidence: 87, signature: ["Chou", "Khufra", "Tigreal", "Franco", "Mathilda"] },
      { id: "navi_febbb", name: "FEBBB", realName: "Febbb", role: "EXP", rating: 85, confidence: 83, signature: ["Gatotkaca", "Hylos", "Edith", "Benedetta", "Cici"] }
    ]
  }
];
