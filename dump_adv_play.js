const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');

// Dump the full #advPlay section
const playStart = h.indexOf('<section class="screen adv-screen" id="advPlay"');
const playEnd = h.indexOf('</section>', playStart) + 10;
console.log('--- FULL #advPlay SECTION ---');
console.log(h.substring(playStart, playEnd));

// Dump openAdvArea function 
const aaStart = h.indexOf('function openAdvArea');
const aaEnd = h.indexOf('\n      function renderAdvScene', aaStart);
console.log('\n--- openAdvArea FUNCTION ---');
console.log(h.substring(aaStart, aaEnd));

// Dump advApplyAction function
const apStart = h.indexOf('function advApplyAction');
const apEnd = h.indexOf('\n      \n      function openAdvVictory', apStart);
console.log('\n--- advApplyAction FUNCTION ---');
console.log(h.substring(apStart, apEnd));

// Dump renderAdvScene function
const rsStart = h.indexOf('function renderAdvScene');
const rsEnd = h.indexOf('\n      function advApplyAction', rsStart);
console.log('\n--- renderAdvScene FUNCTION ---');
console.log(h.substring(rsStart, rsEnd));
