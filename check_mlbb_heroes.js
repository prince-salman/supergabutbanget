const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

async function checkMlbbHeroes() {
  try {
    const html = await fetchUrl('https://www.mobilelegends.com/hero');
    console.log('HTML Length:', html.length);
    
    // Look for hero images or JSON API endpoints in MLBB site
    const matches = html.match(/https:\/\/[^"'\s<>]+\.(?:png|jpg|webp)/gi) || [];
    console.log('Sample Image URLs found on mobilelegends.com/hero:');
    console.log(matches.slice(0, 25));
    
    // Check if there is an API or script data
    const jsonMatches = html.match(/https:\/\/api\.mobilelegends\.com[^\s"']+/gi) || [];
    console.log('API URLs:', jsonMatches);
  } catch (e) {
    console.error(e.message);
  }
}

checkMlbbHeroes();
