// Two problems:
// 1. openAdvVictory is defined TWICE — our new engine ends with 'function openAdvVictory() {'
//    but the original openAdvVictory was kept. So there are two definitions.
// 2. </style> appears twice — our NEW_CSS injection added another </style>
//    This means the CSS was injected but created a second </style> which confuses the browser.
//
// PLAN:
// A) The NEW_CSS injection adds CSS before the REAL </style>. When we look for the last </style>
//    before the <script>, we see it's at char 107693. But there are 2 </style> now. 
//    Our CSS injection replaced '  </style>' with NEW_CSS + '\n  </style>'
//    So the first </style> is the one we added + the second is the original.
//    Actually no — replace only replaces the FIRST occurrence by default. So the injection went
//    to the first '  </style>' in the file. That should be correct.
//
// B) The REAL fix needed: our rebuild_adventure.js boundary detection for openAdvVictory was wrong.
//    The variable OPEN_ADV_VIC_END found '\n      init();' — but it replaced UP TO that point.
//    Then our NEW_ADV_ENGINE ends with 'function openAdvVictory() {' — but the original 
//    openAdvVictory function body still exists after that point. So we now have:
//    [new engine] + 'function openAdvVictory() {' + [old openAdvVictory body continues with its '{']
//    = double openAdvVictory!
//
// Also the CSS has a NEW_CSS injected that contains '  </style>' as the closing of the first
// style block — this is the second </style> (from previous sessions).
//
// STRATEGY: Git restore to the commit just before our rebuild, then redo the CSS injection + 
// script replacement cleanly using precise boundaries.

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Step 1: Remove the duplicate </style> that was added by this session's CSS injection
// The NEW_CSS injection added our CSS before </style>. But there's already a previous session's 
// CSS injection from upgrade_challenging_questions_and_mobile.js that added another </style>-then-newCSS block.
// Find positions of all </style>
const stylePositions = [];
let pos = 0;
while ((pos = html.indexOf('</style>', pos)) !== -1) {
  stylePositions.push(pos);
  pos++;
}
console.log('</style> positions:', stylePositions);
console.log('Context first </style>:', html.substring(stylePositions[0]-50, stylePositions[0]+20));
console.log('Context second </style>:', html.substring(stylePositions[1]-50, stylePositions[1]+20));
