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

async function scrapePlayerPhotos() {
  const result = {};

  for (const t of teams) {
    const url = `https://id-mpl.com/team/${t}`;
    const html = await fetchUrl(url);
    
    // Look for member cards: image + name + role
    // Let's search for image tags in the team roster section
    console.log(`\n=================== ${t.toUpperCase()} ===================`);
    
    // Extract all image tags
    const imgTags = html.match(/<img[^>]+>/gi) || [];
    const memberImages = [];
    
    imgTags.forEach(tag => {
      if (tag.includes('players') || tag.includes('roster') || tag.includes('members') || tag.includes('teams') || tag.includes('staff') || tag.includes('ik.imagekit.io')) {
        memberImages.push(tag);
      }
    });

    console.log('Images in HTML:', memberImages);

    // Let's also look for background-image: url(...) or src attribute with player photo
    const srcMatches = html.match(/https:\/\/[^"'\s<>]+\.(?:png|jpg|jpeg|webp)/gi) || [];
    const playerSrcs = srcMatches.filter(s => s.includes('player') || s.includes('roster') || s.includes('members') || s.includes('team'));
    console.log('Player Photo URLs:', [...new Set(playerSrcs)]);
  }
}

scrapePlayerPhotos();
