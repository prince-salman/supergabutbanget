import { Team, DerbyInfo, TrashTalkOption } from '@/types';

export function detectDerby(teamA: Team, teamB: Team): DerbyInfo {
  const tags = [teamA.tag.toUpperCase(), teamB.tag.toUpperCase()].sort();

  if (tags.includes('RRQ') && tags.includes('EVOS')) {
    return {
      isDerby: true,
      derbyName: '👑 EL CLASICO INDONESIA',
      derbyBadge: '⚔️ RIVALITAS TERBESAR MLBB',
      description: 'Laga sarat gengsi antara dua organisasi esports paling legendaris di Indonesia. Seluruh mata Land of Dawn tertuju pada duel ini!',
      hypeMultiplier: 2.0
    };
  }

  if (tags.includes('ONIC') && tags.includes('RRQ')) {
    return {
      isDerby: true,
      derbyName: '👑 THE ROYAL DERBY',
      derbyBadge: '⚡ RAJA LANGIT VS RAJA SEGALA RAJA',
      description: 'Duel dua raksasa penguasa piala MPL. Adu mekanik tingkat dewa dan gengsi takhta juara!',
      hypeMultiplier: 1.8
    };
  }

  if (tags.includes('BTR') && tags.includes('AE')) {
    return {
      isDerby: true,
      derbyName: '⚡ DERBY STM',
      derbyBadge: '🤖 ROBOT TROOPERS VS ALTERCHAMPS',
      description: 'Pertarungan dengan tensi panas dan adu psywar paling keras di MPL Arena!',
      hypeMultiplier: 1.6
    };
  }

  if (tags.includes('EVOS') && tags.includes('ONIC')) {
    return {
      isDerby: true,
      derbyName: '🐯 DERBY LAND OF DAWN',
      derbyBadge: '🔥 MACAN PUTIH VS LANDAK KUNING',
      description: 'Pertarungan taktik klasik antara dua juara dunia M-Series dan MSC!',
      hypeMultiplier: 1.5
    };
  }

  if (tags.includes('TLID') || tags.includes('GEEK')) {
    return {
      isDerby: true,
      derbyName: '🐎 DUEL KUDA HITAM (DARK HORSE SHOWDOWN)',
      derbyBadge: '🔥 THE RISING GIANTS',
      description: 'Pertemuan dua tim pembunuh raksasa yang siap mengguncang papan atas klasemen!',
      hypeMultiplier: 1.3
    };
  }

  return {
    isDerby: false,
    derbyName: 'MATCH REGULAR SEASON',
    derbyBadge: '🏆 LAGA RESMI MPL ID',
    description: 'Pertandingan reguler penentu poin krusial menuju zona aman babak Playoff.',
    hypeMultiplier: 1.0
  };
}

export function generateTrashTalkOptions(
  userTeam: Team,
  enemyTeam: Team,
  coachName: string,
  derby: DerbyInfo
): TrashTalkOption[] {
  return [
    {
      id: 'spicy',
      tone: 'spicy',
      title: '🌶️ Psywar Agresif (Penuh Percaya Diri)',
      quote: `Kami sudah tahu seluruh kelemahan draft ${enemyTeam.name}. Jangan kaget kalau match ini selesai 2-0 tanpa perlawanan berarti!`,
      hypeBoost: 25,
      moraleBoost: 15
    },
    {
      id: 'tactical',
      tone: 'tactical',
      title: '🧠 Analisis Taktis (Fokus Strategi 10-Ban)',
      quote: `Kami sudah menyusun rencana matang untuk mematikan hero power pick pemain kunci ${enemyTeam.shortName}. Eksekusi rapi adalah segalanya.`,
      hypeBoost: 12,
      moraleBoost: 10
    },
    {
      id: 'humble',
      tone: 'humble',
      title: '🤝 Rendah Hati & Respect (Respek Sportif)',
      quote: `${enemyTeam.name} adalah lawan yang tangguh. Kami menaruh respek tinggi dan siap menyajikan pertandingan terbaik untuk suporter kedua tim!`,
      hypeBoost: 8,
      moraleBoost: 8
    }
  ];
}
