// The </style> at char 107693 is BEFORE the <script> at 129642 — good, that's correct.
// But our NEW_CSS was injected there already. The error at char 112040 in the SCRIPT content
// means the char 112040 within the script = absolute position 129642 + 112040 = ~241682 in html.
// 
// Wait: the script regex matches the entire <script>...</script> as one block.
// The error at char 112040 in the script content is WITHIN the original Level 3 quiz code.
// But we confirmed old code was OK before our changes.
//
// Key insight: our rebuild_adventure.js did 
//   html = html.replace('  </style>', NEW_CSS + '\n  </style>');  
// If NEW_CSS contains the string '  </style>' somewhere inside it (from a CSS comment or similar),
// that would cause double-replacement. OR, the NEW_CSS has an unbalanced paren that is now 
// being inserted BEFORE the <script> in a <style> block — that shouldn't affect JS parsing.
//
// ACTUAL ROOT CAUSE: Our rebuild_adventure.js writes to the CURRENT index.html which ALREADY has
// the previous session's CSS injected (from upgrade_challenging_questions_and_mobile.js which also 
// did html.replace('  </style>', CSS + '\n  </style>')). 
// So 'rebuild_adventure.js' did a SECOND replace('  </style>', NEW_CSS + '\n  </style>').
// If NEW_CSS has a leading `  </style>` somewhere... let's check.
//
// Actually the simplest fix: our NEW_CSS block is fine. The issue must be that 
// html.replace(oldBlock, NEW_ADV_ENGINE) replaced the old adventure script 
// but the boundary detection was slightly off - the NEW_ADV_ENGINE string ends with:
//   function openAdvVictory() {
// and the original had the rest of openAdvVictory there. 
// If the string match was off, the OPEN of openAdvVictory function got doubled or the 
// old content in the wrong place remained, causing unbalanced braces.
//
// Let's check: does the current index.html have TWO definitions of openAdvArea?

const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');

const count_openAdvArea = (h.match(/function openAdvArea/g) || []).length;
const count_openAdvVictory = (h.match(/function openAdvVictory/g) || []).length;
const count_ADV_AREAS = (h.match(/var ADV_AREAS = \{/g) || []).length;
console.log('function openAdvArea count:', count_openAdvArea);
console.log('function openAdvVictory count:', count_openAdvVictory);
console.log('var ADV_AREAS count:', count_ADV_AREAS);

// Also check for double </style>
const count_style_close = (h.match(/<\/style>/g) || []).length;
console.log('</style> count:', count_style_close);

// Check all occurrences of ADV_AREAS
const positions = [];
let pos = 0;
while ((pos = h.indexOf('var ADV_AREAS', pos)) !== -1) {
  positions.push(pos);
  pos++;
}
console.log('ADV_AREAS positions:', positions);
