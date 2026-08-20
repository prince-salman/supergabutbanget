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

async function scrapeAllPhotos() {
  const photoMap = {};

  for (const t of teams) {
    const url = `https://id-mpl.com/team/${t}`;
    const html = await fetchUrl(url);
    
    // Find all player URLs like https://cdn.id-mpl.com/season18/player/...
    const matches = html.match(/https:\/\/cdn\.id-mpl\.com\/season\d+\/player\/[^\s"'<>]+/gi) || [];
    
    // Also match any relative or imagekit paths
    const otherMatches = html.match(/https:\/\/(?:wsrv\.nl\/\?url=)?https:\/\/ik\.imagekit\.io\/nloe8dhf7w\/mplid\/[^"'\s<>]+/gi) || [];
    
    console.log(`\n=== ${t.toUpperCase()} ===`);
    console.log(matches);

    matches.forEach(u => {
      // Extract player name from url (e.g. /player/RRQ/Demonkite.png -> demonkite)
      const parts = u.split('/');
      const filename = parts[parts.length - 1];
      const nameKey = filename.replace(/\.(png|jpg|webp|jpeg)$/i, '').toLowerCase();
      photoMap[`${t}_${nameKey}`] = u;
      photoMap[nameKey] = u;
    });
  }

  console.log('\n--- TOTAL PHOTO MAP ENTRIES ---', Object.keys(photoMap).length);
  fs.writeFileSync('player_photos.json', JSON.stringify(photoMap, null, 2));
}

scrapeAllPhotos();
