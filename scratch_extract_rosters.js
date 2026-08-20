const https = require('https');
const fs = require('fs');

const teams = ['ae', 'btr', 'dewa', 'evos', 'geek', 'navi', 'onic', 'rrq', 'tlid'];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

async function run() {
  for (const t of teams) {
    const url = `https://id-mpl.com/team/${t}`;
    const html = await fetchUrl(url);
    
    console.log(`\n========================================`);
    console.log(`ROSTER FOR TEAM: ${t.toUpperCase()}`);
    console.log(`========================================`);

    // Let's find all player cards / names / roles in the html
    // Look for patterns like team player cards
    const lines = html.split('\n');
    let capture = false;
    let buffer = [];

    lines.forEach((l, idx) => {
      if (l.includes('class="member"') || l.includes('class="player"') || l.includes('team-detail') || l.includes('roster') || l.includes('col-player') || l.includes('card-member')) {
        // print next 10 lines
        const snippet = lines.slice(idx, idx + 20).join(' ');
        buffer.push(snippet);
      }
    });

    // Extract all image URLs from ik.imagekit.io/nloe8dhf7w
    const imgMatches = html.match(/https:\/\/(?:ik\.imagekit\.io|wsrv\.nl|\/images)[^"'\s<>]+/g) || [];
    const playerImgs = imgMatches.filter(u => u.includes('player') || u.includes('roster') || u.includes('s14') || u.includes('s15') || u.includes('s16') || u.includes('s17') || u.includes('s18'));
    
    // Also look for names in uppercase text inside divs/spans
    const nameMatches = [];
    const textRegex = /<(?:div|span|h\d|p)[^>]*class="[^"]*(?:name|role|nickname|ign|fullname)[^"]*"[^>]*>([^<]+)<\/(?:div|span|h\d|p)>/gi;
    let m;
    while ((m = textRegex.exec(html)) !== null) {
      nameMatches.push(m[1].trim());
    }

    console.log('Detected Names/Roles via classes:', nameMatches);
    console.log('Player Images:', [...new Set(playerImgs)].slice(0, 15));
  }
}

run();
