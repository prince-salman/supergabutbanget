// Image Asset Mapping for All 120+ Heroes, Official MPL ID Team Logos (Direct from id-mpl.com/teams), and Official Esports Pro Player Photos

// Official MPL ID Team Logos direct from https://id-mpl.com/teams
export const TEAM_LOGO_MAP: Record<string, string> = {
  ae: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/ae-256.png",
  alterego: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/ae-256.png",
  btr: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/btr_vit.png",
  bigetron: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/btr_vit.png",
  dewa: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/dewa-united-500.png",
  evos: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/evos-500.png",
  geek: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/geek-500.png",
  geekfam: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/geek-500.png",
  navi: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/NAVI-2.png",
  onic: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/onic-b-256.png",
  rrq: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/rrq-500.png",
  tlid: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/TLID-Primary500x500.png",
  liquid: "https://wsrv.nl/?url=https://ik.imagekit.io/nloe8dhf7w/mplid/s14/teams/TLID-Primary500x500.png"
};

/**
 * Returns the Official Team Logo URL from id-mpl.com/teams
 */
export function getTeamLogoUrl(teamTagOrId: string, themeColor: string = '#d32f2f'): string {
  const cleanKey = teamTagOrId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (TEAM_LOGO_MAP[cleanKey]) {
    return TEAM_LOGO_MAP[cleanKey];
  }
  const cleanBg = themeColor.replace('#', '');
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanKey}&backgroundColor=${cleanBg}`;
}

// Official MPL Indonesia Branding Images
export const MPL_BRANDING = {
  mplLogo: "https://id-mpl.com/images/s14/logo/LOGO_MPL-ID-NEW-2024-400.webp",
  weOwnThis: "https://id-mpl.com/images/s14/logo/weownthis-white.webp",
  flagId: "https://id-mpl.com/images/langs/id.png"
};

// High Quality Hero Image URL mapping for MLBB Heroes
export const HERO_IMAGE_MAP: Record<string, string> = {
  suyou: "https://static.wikia.nocookie.net/mobile-legends/images/e/e0/Hero1261-icon.png",
  nolan: "https://static.wikia.nocookie.net/mobile-legends/images/1/1d/Hero1221-icon.png",
  ling: "https://static.wikia.nocookie.net/mobile-legends/images/d/d4/Hero841-icon.png",
  hayabusa: "https://static.wikia.nocookie.net/mobile-legends/images/3/30/Hero211-icon.png",
  fanny: "https://static.wikia.nocookie.net/mobile-legends/images/0/07/Hero171-icon.png",
  lancelot: "https://static.wikia.nocookie.net/mobile-legends/images/8/87/Hero471-icon.png",
  joy: "https://static.wikia.nocookie.net/mobile-legends/images/0/04/Hero1181-icon.png",
  benedetta: "https://static.wikia.nocookie.net/mobile-legends/images/f/fc/Hero971-icon.png",
  gusion: "https://static.wikia.nocookie.net/mobile-legends/images/1/12/Hero561-icon.png",
  aamon: "https://static.wikia.nocookie.net/mobile-legends/images/8/87/Hero1091-icon.png",
  helcurt: "https://static.wikia.nocookie.net/mobile-legends/images/e/ee/Hero511-icon.png",
  saber: "https://static.wikia.nocookie.net/mobile-legends/images/4/4e/Hero031-icon.png",
  karina: "https://static.wikia.nocookie.net/mobile-legends/images/6/6f/Hero081-icon.png",
  natalia: "https://static.wikia.nocookie.net/mobile-legends/images/f/f6/Hero241-icon.png",
  hanzo: "https://static.wikia.nocookie.net/mobile-legends/images/2/23/Hero701-icon.png",
  selena: "https://static.wikia.nocookie.net/mobile-legends/images/7/7b/Hero631-icon.png",
  terizla: "https://static.wikia.nocookie.net/mobile-legends/images/c/c5/Hero821-icon.png",
  arlott: "https://static.wikia.nocookie.net/mobile-legends/images/7/7b/Hero1191-icon.png",
  yuzhong: "https://static.wikia.nocookie.net/mobile-legends/images/b/b3/Hero951-icon.png",
  ruby: "https://static.wikia.nocookie.net/mobile-legends/images/9/9e/Hero321-icon.png",
  cici: "https://static.wikia.nocookie.net/mobile-legends/images/f/f0/Hero1231-icon.png",
  paquito: "https://static.wikia.nocookie.net/mobile-legends/images/d/d1/Hero1021-icon.png",
  phoveus: "https://static.wikia.nocookie.net/mobile-legends/images/d/df/Hero1061-icon.png",
  chou: "https://static.wikia.nocookie.net/mobile-legends/images/c/cf/Hero261-icon.png",
  lapulapu: "https://static.wikia.nocookie.net/mobile-legends/images/0/00/Hero371-icon.png",
  x_borg: "https://static.wikia.nocookie.net/mobile-legends/images/7/7c/Hero831-icon.png",
  alpha: "https://static.wikia.nocookie.net/mobile-legends/images/e/ef/Hero291-icon.png",
  martis: "https://static.wikia.nocookie.net/mobile-legends/images/a/a2/Hero581-icon.png",
  guinevere: "https://static.wikia.nocookie.net/mobile-legends/images/3/30/Hero781-icon.png",
  thamuz: "https://static.wikia.nocookie.net/mobile-legends/images/0/07/Hero721-icon.png",
  dyrroth: "https://static.wikia.nocookie.net/mobile-legends/images/4/41/Hero851-icon.png",
  esmeralda: "https://static.wikia.nocookie.net/mobile-legends/images/f/f5/Hero801-icon.png",
  lukas: "https://static.wikia.nocookie.net/mobile-legends/images/6/6f/Hero1271-icon.png",
  balmond: "https://static.wikia.nocookie.net/mobile-legends/images/a/a8/Hero021-icon.png",
  freya: "https://static.wikia.nocookie.net/mobile-legends/images/f/f6/Hero221-icon.png",
  alucard: "https://static.wikia.nocookie.net/mobile-legends/images/4/45/Hero071-icon.png",
  zilong: "https://static.wikia.nocookie.net/mobile-legends/images/5/5a/Hero161-icon.png",
  sun: "https://static.wikia.nocookie.net/mobile-legends/images/5/52/Hero271-icon.png",
  argus: "https://static.wikia.nocookie.net/mobile-legends/images/7/7b/Hero451-icon.png",
  badang: "https://static.wikia.nocookie.net/mobile-legends/images/c/c5/Hero761-icon.png",
  aldous: "https://static.wikia.nocookie.net/mobile-legends/images/4/46/Hero641-icon.png",
  leomord: "https://static.wikia.nocookie.net/mobile-legends/images/b/b2/Hero671-icon.png",
  khaleed: "https://static.wikia.nocookie.net/mobile-legends/images/c/ca/Hero961-icon.png",
  masha: "https://static.wikia.nocookie.net/mobile-legends/images/5/56/Hero881-icon.png",
  silvanna: "https://static.wikia.nocookie.net/mobile-legends/images/1/11/Hero901-icon.png",
  aulus: "https://static.wikia.nocookie.net/mobile-legends/images/f/f1/Hero1081-icon.png",
  yin: "https://static.wikia.nocookie.net/mobile-legends/images/4/43/Hero1131-icon.png",
  julian: "https://static.wikia.nocookie.net/mobile-legends/images/a/a6/Hero1161-icon.png",
  zhuxin: "https://static.wikia.nocookie.net/mobile-legends/images/f/f6/Hero1251-icon.png",
  valentina: "https://static.wikia.nocookie.net/mobile-legends/images/4/4b/Hero1101-icon.png",
  novaria: "https://static.wikia.nocookie.net/mobile-legends/images/a/ae/Hero1201-icon.png",
  faramis: "https://static.wikia.nocookie.net/mobile-legends/images/5/5a/Hero791-icon.png",
  kadita: "https://static.wikia.nocookie.net/mobile-legends/images/8/81/Hero751-icon.png",
  yve: "https://static.wikia.nocookie.net/mobile-legends/images/8/85/Hero1011-icon.png",
  pharsa: "https://static.wikia.nocookie.net/mobile-legends/images/a/a8/Hero531-icon.png",
  vexana: "https://static.wikia.nocookie.net/mobile-legends/images/f/fb/Hero381-icon.png",
  lylia: "https://static.wikia.nocookie.net/mobile-legends/images/5/53/Hero861-icon.png",
  aurora: "https://static.wikia.nocookie.net/mobile-legends/images/3/3f/Hero361-icon.png",
  harith: "https://static.wikia.nocookie.net/mobile-legends/images/9/90/Hero731-icon.png",
  luoyi: "https://static.wikia.nocookie.net/mobile-legends/images/5/5f/Hero941-icon.png",
  lunox: "https://static.wikia.nocookie.net/mobile-legends/images/9/90/Hero681-icon.png",
  kagura: "https://static.wikia.nocookie.net/mobile-legends/images/7/75/Hero191-icon.png",
  nana: "https://static.wikia.nocookie.net/mobile-legends/images/4/42/Hero051-icon.png",
  eudora: "https://static.wikia.nocookie.net/mobile-legends/images/3/32/Hero041-icon.png",
  gord: "https://static.wikia.nocookie.net/mobile-legends/images/c/ca/Hero231-icon.png",
  cyclops: "https://static.wikia.nocookie.net/mobile-legends/images/2/25/Hero331-icon.png",
  vale: "https://static.wikia.nocookie.net/mobile-legends/images/8/84/Hero661-icon.png",
  change: "https://static.wikia.nocookie.net/mobile-legends/images/d/d3/Hero601-icon.png",
  odette: "https://static.wikia.nocookie.net/mobile-legends/images/3/3d/Hero461-icon.png",
  cecilion: "https://static.wikia.nocookie.net/mobile-legends/images/c/c2/Hero921-icon.png",
  xavier: "https://static.wikia.nocookie.net/mobile-legends/images/6/64/Hero1151-icon.png",
  zhask: "https://static.wikia.nocookie.net/mobile-legends/images/7/73/Hero521-icon.png",
  harley: "https://static.wikia.nocookie.net/mobile-legends/images/d/df/Hero421-icon.png",
  claude: "https://static.wikia.nocookie.net/mobile-legends/images/8/8d/Hero651-icon.png",
  moskov: "https://static.wikia.nocookie.net/mobile-legends/images/7/7b/Hero311-icon.png",
  roger: "https://static.wikia.nocookie.net/mobile-legends/images/4/45/Hero391-icon.png",
  karrie: "https://static.wikia.nocookie.net/mobile-legends/images/1/14/Hero401-icon.png",
  natan: "https://static.wikia.nocookie.net/mobile-legends/images/d/d4/Hero1071-icon.png",
  beatrix: "https://static.wikia.nocookie.net/mobile-legends/images/5/52/Hero1051-icon.png",
  bruno: "https://static.wikia.nocookie.net/mobile-legends/images/a/ae/Hero121-icon.png",
  brody: "https://static.wikia.nocookie.net/mobile-legends/images/0/00/Hero981-icon.png",
  irithel: "https://static.wikia.nocookie.net/mobile-legends/images/5/51/Hero431-icon.png",
  clint: "https://static.wikia.nocookie.net/mobile-legends/images/5/56/Hero111-icon.png",
  miya: "https://static.wikia.nocookie.net/mobile-legends/images/9/90/Hero011-icon.png",
  layla: "https://static.wikia.nocookie.net/mobile-legends/images/5/52/Hero181-icon.png",
  lesley: "https://static.wikia.nocookie.net/mobile-legends/images/d/d1/Hero541-icon.png",
  hanabi: "https://static.wikia.nocookie.net/mobile-legends/images/1/14/Hero611-icon.png",
  kimmy: "https://static.wikia.nocookie.net/mobile-legends/images/7/75/Hero711-icon.png",
  wanwan: "https://static.wikia.nocookie.net/mobile-legends/images/8/87/Hero891-icon.png",
  popolandkupa: "https://static.wikia.nocookie.net/mobile-legends/images/d/d1/Hero941-icon.png",
  melissa: "https://static.wikia.nocookie.net/mobile-legends/images/0/07/Hero1141-icon.png",
  ixia: "https://static.wikia.nocookie.net/mobile-legends/images/a/a2/Hero1211-icon.png",
  tigreal: "https://static.wikia.nocookie.net/mobile-legends/images/9/9e/Hero061-icon.png",
  hylos: "https://static.wikia.nocookie.net/mobile-legends/images/5/5f/Hero491-icon.png",
  fredrinn: "https://static.wikia.nocookie.net/mobile-legends/images/f/f6/Hero1171-icon.png",
  baxia: "https://static.wikia.nocookie.net/mobile-legends/images/8/87/Hero871-icon.png",
  khufra: "https://static.wikia.nocookie.net/mobile-legends/images/f/f4/Hero771-icon.png",
  minotaur: "https://static.wikia.nocookie.net/mobile-legends/images/0/07/Hero151-icon.png",
  grock: "https://static.wikia.nocookie.net/mobile-legends/images/0/0b/Hero441-icon.png",
  franco: "https://static.wikia.nocookie.net/mobile-legends/images/e/e4/Hero101-icon.png",
  atlas: "https://static.wikia.nocookie.net/mobile-legends/images/1/14/Hero931-icon.png",
  akai: "https://static.wikia.nocookie.net/mobile-legends/images/9/90/Hero091-icon.png",
  edith: "https://static.wikia.nocookie.net/mobile-legends/images/0/05/Hero1121-icon.png",
  gloo: "https://static.wikia.nocookie.net/mobile-legends/images/d/df/Hero1041-icon.png",
  belerick: "https://static.wikia.nocookie.net/mobile-legends/images/7/7b/Hero711-icon.png",
  johnson: "https://static.wikia.nocookie.net/mobile-legends/images/c/c5/Hero321-icon.png",
  uranus: "https://static.wikia.nocookie.net/mobile-legends/images/5/5a/Hero591-icon.png",
  gatotkaca: "https://static.wikia.nocookie.net/mobile-legends/images/a/a2/Hero411-icon.png",
  chip: "https://static.wikia.nocookie.net/mobile-legends/images/0/07/Hero1241-icon.png",
  mathilda: "https://static.wikia.nocookie.net/mobile-legends/images/f/f6/Hero991-icon.png",
  kaja: "https://static.wikia.nocookie.net/mobile-legends/images/c/c5/Hero621-icon.png",
  diggie: "https://static.wikia.nocookie.net/mobile-legends/images/0/08/Hero481-icon.png",
  angela: "https://static.wikia.nocookie.net/mobile-legends/images/7/7b/Hero551-icon.png",
  floryn: "https://static.wikia.nocookie.net/mobile-legends/images/4/4b/Hero1111-icon.png",
  estes: "https://static.wikia.nocookie.net/mobile-legends/images/6/61/Hero341-icon.png",
  rafaela: "https://static.wikia.nocookie.net/mobile-legends/images/2/29/Hero141-icon.png",
  lolita: "https://static.wikia.nocookie.net/mobile-legends/images/8/87/Hero201-icon.png",
  carmilla: "https://static.wikia.nocookie.net/mobile-legends/images/7/7c/Hero911-icon.png",
  minsitthar: "https://static.wikia.nocookie.net/mobile-legends/images/0/0a/Hero741-icon.png"
};

// Official Direct Pro Player & Coach Photos Mapping from id-mpl.com
export const OFFICIAL_PLAYER_PHOTO_MAP: Record<string, string> = {
  // Alter Ego
  nino: "/images/players/ae_nino.png",
  reyy: "/images/players/ae_reyy.png",
  affan: "/images/players/ae_affan.png",
  dalvin: "/images/players/ae_dalvin.png",
  halim: "/images/players/ae_halim.png",
  dingarai: "/images/players/ae_dingarai.png",
  alexander: "/images/players/ae_alexander.png",
  ivann: "/images/players/ae_ivann.png",
  xepher: "/images/players/ae_xepher.png",
  styx: "/images/players/ae_styx.png",

  // Bigetron Alpha
  shogun: "/images/players/btr_shogun.png",
  nnael: "/images/players/btr_nnael.png",
  moreno: "/images/players/btr_moreno.png",
  morenooo: "/images/players/btr_moreno.png",
  eman: "/images/players/btr_eman.png",
  emann: "/images/players/btr_eman.png",
  finn: "/images/players/btr_finn.png",
  miguel: "/images/players/btr_miguel.png",
  kdot: "/images/players/btr_kdot.png",
  her: "/images/players/btr_her.png",

  // Dewa United
  qinn: "/images/players/dewa_qinn.png",
  kayn: "/images/players/dewa_kayn.png",
  octa: "/images/players/dewa_octa.png",
  maybeee: "/images/players/dewa_maybeee.png",
  itoshikesu: "/images/players/dewa_itoshi20kesu.png",
  itoshi: "/images/players/dewa_itoshi20kesu.png",
  rulgood: "/images/players/dewa_rul20good.png",
  coachright: "/images/players/dewa_coach20right.png",
  laufeyson: "/images/players/dewa_laufeyson.png",

  // EVOS Glory
  vell: "/images/players/evos_vell.png",
  rendyyy: "/images/players/evos_rendyyy.png",
  alberttt: "/images/players/evos_alberttt.png",
  drianw: "/images/players/evos_drianw.png",
  erlan: "/images/players/evos_erlan.png",
  muezza: "/images/players/evos_muezza.png",
  aldo: "/images/players/evos_aldo.png",
  bravo: "/images/players/evos_bravo.png",

  // Geek Fam ID
  marcel: "/images/players/geek_marcel.png",
  febriii: "/images/players/geek_febriii.png",
  nazara: "/images/players/geek_nazara.png",
  aboy: "/images/players/geek_aboy.png",
  aboyy: "/images/players/geek_aboy.png",
  kennzyyskie: "/images/players/geek_kennzyskie.png",
  audytzy: "/images/players/geek_audytzy.png",
  erpang: "/images/players/geek_erpang.png",
  vivy: "/images/players/geek_vivy.png",

  // NAVI
  karss: "/images/players/navi_karss.png",
  febbb: "/images/players/navi_febbb.png",
  andoryuuu: "/images/players/navi_andoryuuu.png",
  jiize: "/images/players/navi_jiize.png",
  jiizee: "/images/players/navi_jiize.png",
  zeonn: "/images/players/navi_zeonn.png",
  aprho: "/images/players/navi_aprho.png",
  ynot: "/images/players/navi_ynot.png",
  jacklee: "/images/players/navi_jacklee.png",
  han: "/images/players/navi_han.png",

  // Fnatic ONIC
  lutpi: "/images/players/onic_lutpi.png",
  lutpiii: "/images/players/onic_lutpi.png",
  kairi: "/images/players/onic_kairi.png",
  sanz: "/images/players/onic_sanz.png",
  kelra: "/images/players/onic_kelra.png",
  kiboy: "/images/players/onic_kiboy.png",
  ssamuel: "/images/players/onic_ssamuel.png",
  cw: "/images/players/onic_cw.png",

  // RRQ Hoshi
  joshua: "/images/players/rrq_joshua.png",
  demonkite: "/images/players/rrq_demonkite.png",
  hajirin: "/images/players/rrq_hajirin.png",
  arthur: "/images/players/rrq_arthur.png",
  said: "/images/players/rrq_said.png",
  habil: "/images/players/rrq_habil.png",
  clayy: "/images/players/rrq_clayy.png",
  clayyy: "/images/players/rrq_clayy.png",
  adi: "/images/players/rrq_adi.png",
  kayleb: "/images/players/rrq_kayleb.png",

  // Team Liquid ID
  aran: "/images/players/tlid_aran.png",
  kevin: "/images/players/tlid_kevin.png",
  drichel: "/images/players/tlid_drichel.png",
  anaver: "/images/players/tlid_anaver.png",
  keven: "/images/players/tlid_keven.png",
  lyoni: "/images/players/tlid_lyoni.png",
  honjaw: "/images/players/tlid_honjaw.png",
  pahlevi: "/images/players/tlid_pahlevi.png",
  facehugger: "/images/players/tlid_facehugger.png"
};

/**
 * Returns a high-definition MLBB hero portrait artwork URL (Official local MLBB artwork)
 */
export function getHeroImageUrl(heroId: string, heroName?: string): string {
  const cleanId = heroId.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `/images/heroes/${cleanId}.png`;
}

/**
 * Returns the Official Pro Player Photo from id-mpl.com (or fallback avatar)
 */
export function getPlayerAvatarUrl(playerName: string, teamColor: string = '#d32f2f'): string {
  const cleanKey = playerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (OFFICIAL_PLAYER_PHOTO_MAP[cleanKey]) {
    return OFFICIAL_PLAYER_PHOTO_MAP[cleanKey];
  }
  const cleanName = encodeURIComponent(playerName.trim());
  const cleanBg = teamColor.replace('#', '');
  return `https://api.dicebear.com/7.x/micah/svg?seed=${cleanName}&backgroundColor=${cleanBg}&mouth=smile,laughing,pucker&hair=fonze,full,pixie,mrT&baseColor=apricot,warmBone,topaz`;
}

/**
 * Returns the Official Coach Photo from id-mpl.com (or fallback avatar)
 */
export function getCoachAvatarUrl(coachName: string): string {
  const cleanKey = coachName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (OFFICIAL_PLAYER_PHOTO_MAP[cleanKey]) {
    return OFFICIAL_PLAYER_PHOTO_MAP[cleanKey];
  }
  const cleanName = encodeURIComponent(coachName.trim());
  return `https://api.dicebear.com/7.x/personas/svg?seed=${cleanName}&backgroundColor=18202c`;
}
