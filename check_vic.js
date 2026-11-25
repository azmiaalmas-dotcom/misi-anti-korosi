const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const sc = h.indexOf('<script>');
const se = h.lastIndexOf('</script>');
const js = h.substring(sc+8, se);

// Find openAdvVictory
const vicPos = js.indexOf('function openAdvVictory');
console.log('openAdvVictory at js-char:', vicPos);

// Find openAdvIntro  
const introPos = js.indexOf('function openAdvIntro');
console.log('openAdvIntro at js-char:', introPos);
if (introPos > -1) console.log('openAdvIntro context:', js.substring(introPos, introPos+100));

// Find openAdvMap
const mapPos = js.indexOf('function openAdvMap');
console.log('openAdvMap at js-char:', mapPos);
if (mapPos > -1) console.log('openAdvMap context:', js.substring(mapPos, mapPos+100));

// Show JS from openAdvVictory to end (excluding)
console.log('\n--- FROM openAdvVictory TO END ---');
const restJs = js.substring(vicPos, vicPos + 3000);
console.log(restJs);
