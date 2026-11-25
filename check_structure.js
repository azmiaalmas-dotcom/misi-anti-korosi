const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
console.log('File size:', h.length, 'chars (~', Math.round(h.length/1024), 'KB)');
console.log('Has advPlay:', h.includes('id="advPlay"'));
console.log('Has advIntro:', h.includes('id="advIntro"'));
console.log('Has advMap:', h.includes('id="advMap"'));
console.log('Has advVictory:', h.includes('id="advVictory"'));

const fns = [...h.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(/g)].map(m=>m[1]).filter(m=>m.toLowerCase().includes('adv'));
console.log('Adv functions:', JSON.stringify(fns));

// Check openAdvArea function location
const aaPos = h.indexOf('function openAdvArea');
console.log('openAdvArea at char:', aaPos);
// Check advApplyAction
const apPos = h.indexOf('function advApplyAction');
console.log('advApplyAction at char:', apPos);
// Get a snippet of the advPlay area HTML
const playPos = h.indexOf('id="advPlay"');
console.log('\n--- advPlay HTML snippet ---');
console.log(h.substring(playPos, playPos + 2000));
