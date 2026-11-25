// The error is at char 112040 in the existing L3 quiz code (pre-existing, not our new code)
// Let's check: is char 112040 in our new adventure code or in the original Level 3 quiz?
const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const sc = h.match(/<script[\s\S]*?<\/script>/gi)[0].replace(/<script[^>]*>/i,'').replace(/<\/script>/i,'');

// Our adventure code starts at: (search for openAdvArea)
const advStart = sc.indexOf('function openAdvArea');
const advAreaStart2 = sc.indexOf('var ADV_AREAS');
console.log('ADV_AREAS starts at char:', advAreaStart2);
console.log('openAdvArea starts at char:', advStart);
console.log('Error is at char 112040');
console.log('Error is BEFORE our new code?', 112040 < advAreaStart2);
console.log('Error is IN our new code?', 112040 >= advAreaStart2 && 112040 <= advStart);

// Print the actual problematic line more carefully
const errorCtx = sc.substring(111800, 112300);
console.log('\n--- ERROR CONTEXT ---');
console.log(errorCtx);
