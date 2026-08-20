const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'images', 'heroes');

// Popol alias
if (fs.existsSync(path.join(targetDir, 'popolandkupa.png'))) {
  fs.copyFileSync(path.join(targetDir, 'popolandkupa.png'), path.join(targetDir, 'popol.png'));
  console.log('Copied popolandkupa.png to popol.png');
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
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
    }).on('error', err => reject(err));
  });
}

async function downloadArgus() {
  const data = await fetchJson('https://mobile-legends.fandom.com/api.php?action=query&titles=Argus&prop=pageimages&pithumbsize=200&format=json');
  for (const p of Object.values(data.query.pages)) {
    if (p.thumbnail && p.thumbnail.source) {
      await downloadImage(p.thumbnail.source, path.join(targetDir, 'argus.png'));
      console.log('Downloaded argus.png successfully!');
    }
  }
}

downloadArgus();
