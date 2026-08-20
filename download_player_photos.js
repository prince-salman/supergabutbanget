const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'images', 'players');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const photoMap = JSON.parse(fs.readFileSync('player_photos.json', 'utf8'));

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Downloading all player photos to public/images/players/...');
  const downloaded = new Set();

  for (const [key, url] of Object.entries(photoMap)) {
    if (!url.startsWith('https://cdn.id-mpl.com')) continue;
    
    // Extract clean filename from URL (e.g. /player/ONIC/Kairi.png -> onic_kairi.png or kairi.png)
    const match = url.match(/\/player\/([^\/]+)\/([^\/?]+)\.png/i);
    if (!match) continue;

    const team = match[1].toLowerCase();
    const playerName = match[2].toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanFilename = `${team}_${playerName}.png`;
    const simpleFilename = `${playerName}.png`;

    const dest1 = path.join(targetDir, cleanFilename);
    const dest2 = path.join(targetDir, simpleFilename);

    if (!downloaded.has(cleanFilename)) {
      try {
        await downloadFile(url, dest1);
        fs.copyFileSync(dest1, dest2);
        console.log(`Saved: ${cleanFilename} (${playerName})`);
        downloaded.add(cleanFilename);
      } catch (e) {
        console.error(`Failed downloading ${playerName}:`, e.message);
      }
    }
  }

  console.log(`\nSuccessfully downloaded ${downloaded.size} official player photos!`);
}

downloadAll();
