const https = require('https');

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

async function scrapeTeams() {
  const result = {};

  for (const t of teams) {
    const url = `https://id-mpl.com/team/${t}`;
    try {
      const html = await fetchUrl(url);
      
      // Parse players from html
      // Look for player cards, names, roles, photos
      console.log(`=== TEAM ${t.toUpperCase()} ===`);
      
      // Look for player names or cards pattern
      // e.g. class="player-name" or team roster sections
      const matches = [];
      const regex = /<div class="[^"]*player[^"]*"[\s\S]*?<\/div>/gi;
      
      // Let's search for typical id-mpl player card markup
      // Print snippets around player names or search for names
      console.log('HTML Length:', html.length);
      
      // Extract any text within player blocks
      const playerBlockRegex = /<div[^>]*class="[^"]*(?:team-roster|roster|player-item|member|team-player|player-card|col-player|card-player)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
      let match;
      while ((match = playerBlockRegex.exec(html)) !== null) {
        matches.push(match[1]);
      }
      
      // Also extract img sources and alt/titles or names
      const nameMatches = html.match(/<h[345][^>]*class="[^"]*(?:name|player-name)[^"]*"[^>]*>([\s\S]*?)<\/h[345]>/gi) || [];
      console.log('Name matches:', nameMatches);

      // Search for any roster data in javascript json variable
      const scriptMatches = html.match(/(?:var|let|const)\s+roster\s*=\s*(\[[^\]]+\])/i);
      if (scriptMatches) {
        console.log('Found roster JS variable:', scriptMatches[1]);
      }
    } catch (e) {
      console.error(`Error fetching ${t}:`, e.message);
    }
  }
}

scrapeTeams();
