/**
 * INJECT MISSING FUNCTIONS
 * Adds openAdvIntro, openAdvMap, advApplyAction, walkToAreaHotspot
 * stubs that are called from the bottom event-binding section.
 * Injects BEFORE var ADV_AREAS.
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the FINAL GAME comment that's right before var ADV_AREAS
const FG_COMMENT = '/* ==========================================================================\r\n         FINAL GAME: KOROSI ADVENTURE - LOGIKA PERMAINAN\r\n         ========================================================================== */\r\n      ';
const fgCommentPos = html.indexOf('/* ==========================================================================\r\n         FINAL GAME: KOROSI ADVENTURE - LOGIKA PERMAINAN');
console.log('FG_COMMENT at:', fgCommentPos);

if (fgCommentPos === -1) {
  // Try alternate
  const alt = html.indexOf('FINAL GAME: KOROSI ADVENTURE - LOGIKA');
  console.log('Alt pos:', alt);
  process.exit(1);
}

// Find end of that comment block (the */ ending)
const commentEndMarker = '========================================================================== */';
const commentEndPos = html.indexOf(commentEndMarker, fgCommentPos);
const insertAfter = commentEndPos + commentEndMarker.length;
console.log('Insert after pos:', insertAfter);
console.log('Context:', JSON.stringify(html.substring(insertAfter, insertAfter + 50)));

const MISSING_FNS = `

      /* ---- NAVIGATION FUNCTIONS ---- */
      function openAdvIntro() {
        show('advIntro');
      }

      function openAdvMap() {
        var pr = getAdvProgress();
        // Update pins
        ['garden', 'field', 'gate'].forEach(function(key) {
          var cap = key.charAt(0).toUpperCase() + key.slice(1);
          var pinEl = document.getElementById('pin' + cap);
          var pinSt = document.getElementById('pin' + cap + 'Status');
          if (pr[key]) {
            if (pinEl) pinEl.className = 'adv-pin-btn done';
            if (pinSt) pinSt.textContent = '✓ Aman';
          }
        });
        // Update progress bar
        var done = (pr.garden ? 1 : 0) + (pr.field ? 1 : 0) + (pr.gate ? 1 : 0);
        var fillEl = document.getElementById('advProgFill');
        var labelEl = document.getElementById('advProgLabel');
        if (fillEl) fillEl.style.width = (done / 3 * 100) + '%';
        if (labelEl) labelEl.textContent = 'Progres: ' + done + '/3 Fasilitas Diselamatkan (' + Math.round(done/3*100) + '%)';
        show('advMap');
      }

      /* ---- STUBS FOR LEGACY EVENT BINDINGS ---- */
      function advApplyAction() {
        // No-op stub — handled by individual area decide step
      }
      function walkToAreaHotspot(key) {
        openAdvArea(key);
      }

`;

html = html.substring(0, insertAfter) + MISSING_FNS + html.substring(insertAfter);
console.log('Injected missing functions. New size:', html.length);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Written!');

// Verify
const h2 = fs.readFileSync('index.html', 'utf8');
const sc2 = h2.indexOf('<script>');
const se2 = h2.lastIndexOf('</script>');
const js2 = h2.substring(sc2+8, se2);
try {
  new Function(js2);
  console.log('JS SYNTAX: OK');
} catch(e) {
  console.error('JS ERROR:', e.message);
  process.exit(1);
}
const checkFns = ['openAdvIntro','openAdvMap','advApplyAction','walkToAreaHotspot'];
checkFns.forEach(fn => {
  const defined = js2.includes('function ' + fn);
  console.log(fn + ':', defined ? 'DEFINED ✓' : 'MISSING ✗');
});
console.log('openAdvArea:', js2.includes('function openAdvArea') ? 'DEFINED ✓' : 'MISSING ✗');
console.log('openAdvVictory:', js2.includes('function openAdvVictory') ? 'DEFINED ✓' : 'MISSING ✗');
console.log('Final size:', h2.length);
