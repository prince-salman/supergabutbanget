const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', err => reject(err));
  });
}

async function testEndpoints() {
  const endpoints = [
    'https://api.mobilelegends.com/hero/list',
    'https://akmweb.youngjoygame.com/web/gms/herolist.json',
    'https://akmweb.youngjoygame.com/web/gms/hero/herolist.json',
    'https://mobile-legends.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Heroes&cmlimit=200&format=json'
  ];

  for (const ep of endpoints) {
    try {
      console.log('Testing endpoint:', ep);
      const res = await fetchJson(ep);
      if (typeof res === 'object') {
        console.log('Success object from:', ep, Object.keys(res).slice(0, 10));
      } else {
        console.log('Response length:', res.length);
      }
    } catch (e) {
      console.log('Failed:', ep, e.message);
    }
  }
}

testEndpoints();
