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

async function extractAll() {
  const fullData = {};

  for (const t of teams) {
    const url = `https://id-mpl.com/team/${t}`;
    const html = await fetchUrl(url);
    
    // In id-mpl team page, each player is inside a card/box with:
    // photo, nickname (e.g. KARSS), role (e.g. EXP Lane), real name
    // Let's parse each member block
    const members = [];
    
    // Split by member card / column
    const memberBlocks = html.split(/<div[^>]*class="[^"]*(?:col-member|col-player|member|card-player)[^"]*"[^>]*>/gi);
    
    // Also try another parser:
    // Regex looking for nickname and role
    const itemRegex = /<div[^>]*class="[^"]*(?:team-detail-item|member-item|col-sm-6|col-md-3|col-lg-3|member)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    
    // Let's search with regex for image, nickname, role, fullname
    const blockRegex = /<div[^>]*class="[^"]*member-info[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    
    // Let's extract all matches from html
    const memberRegex = /<div[^>]*class="[^"]*(?:col-member|member|card)[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<div class="[^"]*(?:name|ign)[^"]*">([^<]+)<\/div>[\s\S]*?<div class="[^"]*role[^"]*">([^<]+)<\/div>[\s\S]*?<\/div>/gi;
    
    let m;
    while ((m = memberRegex.exec(html)) !== null) {
      members.push({
        img: m[1],
        name: m[2].trim(),
        role: m[3].trim()
      });
    }

    // Let's also do a general parser
    console.log(`\n============================`);
    console.log(`TEAM: ${t.toUpperCase()}`);
    console.log(`============================`);
    
    // Search for all pairings of Name and Role in HTML
    const nameRolePairs = [];
    // The classes detected earlier were:
    // class containing name followed by class containing role
    const pairRegex = /<div[^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)<\/div>\s*<div[^>]*class="[^"]*role[^"]*"[^>]*>([^<]+)<\/div>/gi;
    let pm;
    while ((pm = pairRegex.exec(html)) !== null) {
      nameRolePairs.push({ name: pm[1].trim(), role: pm[2].trim() });
    }

    // If pairRegex didn't catch everything, try h3/h4/span/p
    const genRegex = /<[^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)<\/[^>]*>[\s\S]*?<[^>]*class="[^"]*role[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi;
    let gm;
    while ((gm = genRegex.exec(html)) !== null) {
      nameRolePairs.push({ name: gm[1].trim(), role: gm[2].trim() });
    }

    console.log(JSON.stringify(nameRolePairs, null, 2));
    fullData[t] = nameRolePairs;
  }

  fs.writeFileSync('all_mpl_rosters.json', JSON.stringify(fullData, null, 2));
}

extractAll();
