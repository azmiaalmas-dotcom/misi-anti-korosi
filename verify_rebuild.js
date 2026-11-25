const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');

// 1. JS syntax check
const scripts = h.match(/<script[\s\S]*?<\/script>/gi) || [];
let hasErr = false;
scripts.forEach(function(s, i) {
  const code = s.replace(/<script[^>]*>/i,'').replace(/<\/script>/i,'');
  try { new Function(code); }
  catch(e) { console.error('Script #'+i+' ERROR:', e.message.substring(0,120)); hasErr = true; }
});
if (!hasErr) console.log('✅ All JS scripts syntactically valid!');

// 2. Required DOM IDs
const ids = [
  'advPlay','advPlayBack','advPlayTitle','advStepsBar',
  'adv3dViewerWrap','adv3dCanvas','advRotateHint','advHotspotOverlay',
  'advMagWrap','advMagnifier','advMagnifierGlass',
  'advMagToggle','advMagToggleLabel','advViewHint',
  'advActivityPanel','advActivityTitle','advActivityInstruction','advActivityContent',
  'advFeedbackBox','advScoreDisplay','advCheckBtn','advNextStepBtn','advFinishAreaBtn',
  'advMap','advMapBack','advMapMenu','advMapViewport',
  'advMapProgFill','advMapProgLabel','tourGardenBtn','tourFieldBtn','tourGateBtn',
  'dpadUp','dpadDown','dpadLeft','dpadRight',
  'pinGarden','pinField','pinGate',
  'pinGardenStatus','pinFieldStatus','pinGateStatus',
  'advVictory','advIntro'
];
const missing = ids.filter(function(id) { return !h.includes('id="'+id+'"'); });
if (missing.length === 0) console.log('✅ All '+ids.length+' required DOM IDs present!');
else console.error('❌ Missing IDs:', JSON.stringify(missing));

// 3. Check key functions defined
const fns = ['openAdvArea','openAdvMap','openAdvVictory','openAdvIntro','isAllAdvDone',
  'getAdvProgress','saveAdvProgress','adv3dDraw','initMagnifier','init3dRotation',
  'runAdvStep','advShowResult','renderStepsBar','renderHotspotOverlay',
  'advStep_garden_observe','advStep_garden_find','advStep_garden_identify',
  'advStep_garden_decide','advStep_garden_result',
  'advStep_field_observe','advStep_field_compare','advStep_field_factors',
  'advStep_field_predict','advStep_field_decide','advStep_field_result',
  'advStep_gate_observe','advStep_gate_find','advStep_gate_identify',
  'advStep_gate_decide','advStep_gate_consider','advStep_gate_result'];
const missFn = fns.filter(function(f) { return !h.includes('function '+f) && !h.includes(f+' =') && !h.includes(f+' =') && !(f.startsWith('window.') ? false : !h.includes('window.'+f)); });
if (missFn.length === 0) console.log('✅ All '+fns.length+' key functions present!');
else console.error('❌ Missing functions:', JSON.stringify(missFn));

// 4. Level 1,2,3 intact check
const l1 = h.indexOf('Level 1') !== -1 || h.indexOf('level1') !== -1 || h.indexOf('l1q') !== -1;
const l2 = h.indexOf('Level 2') !== -1 || h.indexOf('level2') !== -1 || h.indexOf('l2q') !== -1;
const l3 = h.indexOf('Level 3') !== -1 || h.indexOf('level3') !== -1 || h.indexOf('l3q') !== -1;
console.log('Quiz level references - L1:', l1, 'L2:', l2, 'L3:', l3);

// 5. ADV_AREAS check
if (h.includes('var ADV_AREAS = {') && h.includes('garden:') && h.includes('field:') && h.includes('gate:'))
  console.log('✅ ADV_AREAS with all 3 areas defined!');
else console.error('❌ ADV_AREAS incomplete!');
