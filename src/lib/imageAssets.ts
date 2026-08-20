// Image Asset Mapping for All 120+ Heroes, Official MLBB Items, Official MPL ID Team Logos (Direct from id-mpl.com/teams), and Official Esports Pro Player Photos

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

// Official Real MLBB Item Image Mapping
export const ITEM_IMAGE_MAP: Record<string, string> = {
  // Physical
  blade_of_despair: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/c/c3/Blade_of_Despair.png",
  demon_hunter_sword: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/8/87/Demon_Hunter_Sword.png",
  malefic_roar: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/8/89/Malefic_Roar.png",
  wind_of_nature: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/2/29/Wind_of_Nature.png",
  war_axe: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/c/c1/War_Axe.png",
  endless_battle: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/8/8b/Endless_Battle.png",
  berserkers_fury: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/0/07/Berserker%27s_Fury.png",
  haass_claws: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/2/2a/Haas%27s_Claws.png",
  corrosion_scythe: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/f/f6/Corrosion_Scythe.png",
  golden_staff: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/a/a3/Golden_Staff.png",
  bloodlust_axe: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/4/42/Bloodlust_Axe.png",
  great_dragon_spear: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/c/cb/Great_Dragon_Spear.png",
  hunter_strike: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/9/91/Hunter_Strike.png",
  rose_gold_meteor: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/1/14/Rose_Gold_Meteor.png",
  sea_halberd: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/c/c3/Sea_Halberd.png",

  // Magic
  holy_crystal: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/6/64/Holy_Crystal.png",
  lightning_truncheon: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/8/89/Lightning_Truncheon.png",
  glowing_wand: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/8/84/Glowing_Wand.png",
  genius_wand: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/b/b3/Genius_Wand.png",
  blood_wings: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/4/4b/Blood_Wings.png",
  divine_glaive: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/4/40/Divine_Glaive.png",
  concentrated_energy: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/b/b3/Concentrated_Energy.png",
  clock_of_destiny: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/2/25/Clock_of_Destiny.png",
  feather_of_heaven: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/8/8b/Feather_of_Heaven.png",
  enchanted_talisman: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/4/47/Enchanted_Talisman.png",
  starlium_scythe: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/a/a2/Starlium_Scythe.png",

  // Defense
  immortality: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/f/f6/Immortality.png",
  winter_crown: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/9/91/Winter_Crown.png",
  athenas_shield: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/e/ef/Athena%27s_Shield.png",
  dominance_ice: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/a/a2/Dominance_Ice.png",
  antique_cuirass: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/1/14/Antique_Cuirass.png",
  radiant_armor: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/8/86/Radiant_Armor.png",
  brute_force_breastplate: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/b/bc/Brute_Force_Breastplate.png",
  oracle: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/6/61/Oracle.png",
  blade_armor: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/6/6e/Blade_Armor.png",
  guardian_helmet: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/9/91/Guardian_Helmet.png",
  twilight_armor: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/f/fe/Twilight_Armor.png",
  thunder_belt: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/8/87/Thunder_Belt.png",
  cursed_helmet: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/9/95/Cursed_Helmet.png",

  // Movement
  tough_boots: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/2/27/Tough_Boots.png",
  warrior_boots: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/b/b3/Warrior_Boots.png",
  magic_shoes: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/0/0b/Magic_Shoes.png",
  swift_boots: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/a/a2/Swift_Boots.png",
  arcane_boots: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/a/a4/Arcane_Boots.png",
  demon_shoes: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/6/69/Demon_Shoes.png",
  rapid_boots: "https://wsrv.nl/?url=https://static.wikia.nocookie.net/mobile-legends/images/e/ef/Rapid_Boots.png"
};

/**
 * Returns the Official Real MLBB Item Artwork Icon URL
 */
export function getItemImageUrl(itemId: string, itemName?: string): string {
  const cleanId = itemId.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (ITEM_IMAGE_MAP[cleanId]) {
    return ITEM_IMAGE_MAP[cleanId];
  }
  const cleanName = encodeURIComponent(itemName || itemId);
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${cleanName}&backgroundColor=111926`;
}

// Pro Player Photo mapping
export const OFFICIAL_PLAYER_PHOTO_MAP: Record<string, string> = {
  // Alter Ego
  gebe: "/images/players/ae_gebe.png",
  reyyy: "/images/players/ae_reyyy.png",
  rounde: "/images/players/ae_rounde.png",
  cyrus: "/images/players/ae_cyrus.png",
  hijume: "/images/players/ae_hijume.png",
  nino: "/images/players/ae_nino.png",
  owen: "/images/players/ae_owen.png",
  alvar: "/images/players/ae_alvar.png",
  starrr: "/images/players/ae_starrr.png",
  crush: "/images/players/ae_crush.png",

  // Bigetron
  superluke: "/images/players/btr_superluke.png",
  luke: "/images/players/btr_superluke.png",
  finn: "/images/players/btr_finn.png",
  annisa: "/images/players/btr_annisa.png",
  meyden: "/images/players/btr_meyden.png",
  chel: "/images/players/btr_chel.png",
  cinny: "/images/players/btr_cinny.png",
  fumi: "/images/players/btr_fumi.png",
  vivian: "/images/players/btr_vivian.png",
  moreno: "/images/players/btr_moreno.png",
  kyy: "/images/players/btr_kyy.png",

  // Dewa United
  potexx: "/images/players/dewa_potexx.png",
  mugi: "/images/players/dewa_mugi.png",
  gideon: "/images/players/dewa_gideon.png",
  shining: "/images/players/dewa_shining.png",
  aliyy: "/images/players/dewa_aliyy.png",
  superkenny: "/images/players/dewa_superkenny.png",
  nathan: "/images/players/dewa_nathan.png",
  tatsuya: "/images/players/dewa_tatsuya.png",
  brayyy: "/images/players/dewa_brayyy.png",
  octa: "/images/players/dewa_octa.png",
  rayy: "/images/players/dewa_rayy.png",

  // EVOS Glory
  saykots: "/images/players/evos_saykots.png",
  wrecker: "/images/players/evos_wrecker.png",
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
