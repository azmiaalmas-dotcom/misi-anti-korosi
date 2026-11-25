const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const sc = h.indexOf('<script>');
const se = h.lastIndexOf('</script>');
const js = h.substring(sc+8, se);

// Check if advApplyAction is defined (not just referenced)
const matches = [...js.matchAll(/function advApplyAction|advApplyAction\s*=/g)];
console.log('advApplyAction definitions:', matches.map(m => ({idx: m.index, text: m[0]})));

// Check if advApplyBtn is in HTML
console.log('advApplyBtn in HTML:', h.includes('id="advApplyBtn"'));

// What function references remain from OLD engine that may not be defined in NEW engine?
const oldRefs = ['advApplyAction', 'advApplyBtn', 'openAdvIntro', 'startAdvGameLoop', 'walkToAreaHotspot', 'updatePin'];
oldRefs.forEach(fn => {
  const count = (js.match(new RegExp(fn, 'g')) || []).length;
  const isDefined = js.includes('function ' + fn) || js.includes(fn + ' =') || js.includes(fn + '=');
  console.log(fn, '- occurrences:', count, '- possibly defined:', isDefined);
});

// Find the section of JS around the bottom area that calls these
const advVicMapBtn = js.indexOf('advVicMapBtn');
console.log('\nContext around advVicMapBtn:');
console.log(js.substring(advVicMapBtn - 300, advVicMapBtn + 200));
