const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
console.log('File size:', h.length);

// Extract JS from script tag
const scriptStart = h.indexOf('<script>');
const scriptEnd = h.lastIndexOf('</script>');
if (scriptStart === -1 || scriptEnd === -1) { console.error('No script tag found!'); process.exit(1); }
const jsCode = h.substring(scriptStart + '<script>'.length, scriptEnd);

// Syntax check
try {
  new Function(jsCode);
  console.log('JS SYNTAX: OK');
} catch (e) {
  console.error('JS SYNTAX ERROR:', e.message);
  // Show context around error line
  const lines = jsCode.split('\n');
  const match = e.message.match(/line (\d+)/);
  if (match) {
    const ln = +match[1];
    console.error('Near line', ln, ':', lines.slice(Math.max(0,ln-3), ln+2).join('\n'));
  }
  process.exit(1);
}

// Verify required IDs in HTML
const requiredIds = [
  'advPlay', 'advPlayBack', 'advPlayTitle', 'advStepsBar',
  'adv3dViewerWrap', 'adv3dCanvas', 'advRotateHint', 'advHotspotOverlay',
  'advMagWrap', 'advMagnifier', 'advMagnifierGlass', 'advMagToggle', 'advMagToggleLabel',
  'advViewHint', 'advActivityPanel', 'advActivityTitle', 'advActivityInstruction',
  'advActivityContent', 'advFeedbackBox', 'advScoreDisplay', 'advCheckBtn',
  'advNextStepBtn', 'advFinishAreaBtn',
  'advMap', 'advVictory'
];
const missing = requiredIds.filter(id => !h.includes('id="' + id + '"'));
if (missing.length === 0) {
  console.log('ALL REQUIRED IDs: OK');
} else {
  console.error('MISSING IDs:', missing.join(', '));
}

// Check key function presence
const keyFns = ['openAdvArea', 'openAdvVictory', 'openAdvMap', 'openAdvIntro',
  'advStep_garden_observe', 'advStep_garden_find', 'advStep_garden_identify',
  'advStep_garden_decide', 'advStep_field_observe', 'advStep_field_compare',
  'advStep_field_factors', 'advStep_field_predict', 'advStep_field_decide',
  'advStep_gate_observe', 'advStep_gate_find', 'advStep_gate_identify',
  'advStep_gate_decide', 'advStep_gate_consider', 'advShowResult',
  'adv3dGarden', 'adv3dField', 'adv3dGate', 'advInitMagnifier', 'advInit3dRotation'];
const missingFns = keyFns.filter(fn => !h.includes(fn));
if (missingFns.length === 0) {
  console.log('ALL KEY FUNCTIONS: OK');
} else {
  console.error('MISSING FUNCTIONS:', missingFns.join(', '));
}

console.log('\n=== VERIFICATION COMPLETE ===');
