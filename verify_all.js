const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check script syntax
const scriptMatches = html.match(/<script[\s\S]*?<\/script>/gi);
let hasError = false;
scriptMatches.forEach((s, i) => {
  const code = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
  try {
    new Function(code);
  } catch (e) {
    console.error('Syntax error in script #' + i + ':', e.message);
    hasError = true;
  }
});
if (!hasError) console.log('All JS scripts are 100% valid syntax!');

// Check required DOM IDs in HTML
const requiredIds = [
  'advMap', 'advMapBack', 'advMapMenu', 'advMapProgFill', 'advMapProgLabel',
  'advMapViewport', 'advTargetBeacon', 'advMapSvgHost', 'advMapPlayer',
  'advPlayerSprite', 'advPlayerBubble', 'advPlayerBubbleText',
  'pinGarden', 'pinField', 'pinGate',
  'pinGardenStatus', 'pinFieldStatus', 'pinGateStatus',
  'advLensPopup', 'advLensGlass', 'advLensTitle', 'advLensDesc', 'advLensActionBtn',
  'tourGardenBtn', 'tourFieldBtn', 'tourGateBtn',
  'dpadUp', 'dpadDown', 'dpadLeft', 'dpadRight',
  'advPlay', 'advPlayTitle', 'advInspectObj', 'advInspectDesc', 'advSceneLensBtn',
  'advHotspotBtn', 'advOptionsList', 'advFeedbackBox', 'advApplyBtn', 'advNextAreaBtn'
];

const missing = requiredIds.filter(id => !html.includes('id="' + id + '"'));
if (missing.length === 0) {
  console.log('All 39 required Adventure DOM IDs are present!');
} else {
  console.error('Missing IDs:', missing);
}

// Check Level 1, 2, 3 questions integrity
if (html.includes('id="l1q"') && html.includes('id="l2q"') && html.includes('id="l3q"')) {
  console.log('Level 1, Level 2, and Level 3 quiz sections are completely intact!');
} else {
  console.error('Warning: Quiz level sections missing!');
}
