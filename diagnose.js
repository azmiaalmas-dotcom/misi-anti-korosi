const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
console.log('size:', h.length);
const i1 = h.indexOf('id="advPlay"');
console.log('advPlay (dq):', i1);
if (i1 > -1) console.log('ctx:', JSON.stringify(h.substring(i1 - 100, i1 + 200)));
const sp = []; let p = 0;
while ((p = h.indexOf('</style>', p)) !== -1) { sp.push(p); p++; }
console.log('styles:', sp);
console.log('script:', h.indexOf('<script'));
console.log('ADV_AREAS:', h.indexOf('var ADV_AREAS'));
console.log('openAdvVictory:', h.indexOf('function openAdvVictory'));
// Find FINAL GAME VICTORY marker
const vic1 = h.indexOf('FINAL GAME: VICTORY');
console.log('FINAL GAME: VICTORY marker:', vic1);
// Look for advPlay section variations
const advPlaySection = h.indexOf('class="screen adv-screen" id="advPlay"');
console.log('advPlay section class+id:', advPlaySection);
// Look for the section end near advPlay  
if (i1 > -1) {
  // find the </section> after advPlay
  const secEnd = h.indexOf('</section>', i1);
  console.log('</section> after advPlay:', secEnd);
  // what comes right after that section?
  console.log('After section:', JSON.stringify(h.substring(secEnd, secEnd + 200)));
}
