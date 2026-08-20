const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'images', 'heroes');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', err => reject(err));
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', err => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function fetchAndDownloadHeroes() {
  console.log('Querying Fandom MediaWiki API for all MLBB heroes...');
  
  // 1. Fetch category members in Category:Heroes
  const catUrl = 'https://mobile-legends.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Heroes&cmlimit=250&format=json';
  const catData = await fetchJson(catUrl);
  
  const pages = catData.query.categorymembers;
  console.log(`Found ${pages.length} heroes!`);

  // 2. For each hero, query page images or search for "File:Hero...-icon.png" or "File:{HeroName}_Icon.png"
  const heroNames = pages.map(p => p.title).filter(t => !t.includes('Category:') && !t.includes('List of'));
  console.log('Heroes:', heroNames.slice(0, 15));

  // Query page images for these heroes in chunks of 50
  for (let i = 0; i < heroNames.length; i += 50) {
    const chunk = heroNames.slice(i, i + 50);
    const titlesParam = encodeURIComponent(chunk.join('|'));
    const imgQueryUrl = `https://mobile-legends.fandom.com/api.php?action=query&titles=${titlesParam}&prop=pageimages&pithumbsize=200&format=json`;
    
    try {
      const imgData = await fetchJson(imgQueryUrl);
      const pageObjs = imgData.query.pages;
      
      for (const [pageId, pInfo] of Object.entries(pageObjs)) {
        const title = pInfo.title;
        const heroId = title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const thumbUrl = pInfo.thumbnail?.source;
        
        if (thumbUrl) {
          // Clean Wikia thumbnail URL to get clean direct URL
          // e.g. https://static.wikia.nocookie.net/.../scale-to-width-down/200?cb=...
          const destPath = path.join(targetDir, `${heroId}.png`);
          try {
            await downloadImage(thumbUrl, destPath);
            console.log(`✓ Downloaded ${title} -> ${heroId}.png`);
          } catch (e) {
            console.error(`✗ Error downloading ${title}:`, e.message);
          }
        } else {
          console.log(`- No thumbnail for ${title}`);
        }
      }
    } catch (e) {
      console.error('Error fetching chunk:', e.message);
    }
  }

  const downloadedFiles = fs.readdirSync(targetDir);
  console.log(`\n🎉 Total hero icons in public/images/heroes/: ${downloadedFiles.length}`);
}

fetchAndDownloadHeroes();
