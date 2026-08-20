const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'images', 'heroes');
const files = fs.readdirSync(targetDir);
console.log('Total hero files in public/images/heroes/:', files.length);

const heroesCode = fs.readFileSync('src/lib/data/heroes.ts', 'utf8');
const idMatches = heroesCode.match(/id:\s*['"]([^'"]+)['"]/g) || [];
const heroIds = idMatches.map(m => m.replace(/id:\s*['"]/, '').replace(/['"]/, '').toLowerCase().replace(/[^a-z0-9]/g, ''));

console.log('Total heroes in data/heroes.ts:', heroIds.length);
const missing = heroIds.filter(id => !files.includes(id + '.png'));
console.log('Missing hero icons:', missing);
