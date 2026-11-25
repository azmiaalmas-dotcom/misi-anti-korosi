const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const sc = h.match(/<script[\s\S]*?<\/script>/gi)[0].replace(/<script[^>]*>/i,'').replace(/<\/script>/i,'');
try {
  new Function(sc);
  console.log('OK - clean baseline, size:', h.length);
} catch(e) {
  console.error('FAIL:', e.message);
}
console.log('openAdvVictory count:', (h.match(/function openAdvVictory/g)||[]).length);
console.log('style close count:', (h.match(/<\/style>/g)||[]).length);
console.log('ADV_AREAS count:', (h.match(/var ADV_AREAS = \{/g)||[]).length);
// Find exact positions of </style>
const sp = [];
let pos = 0;
while ((pos = h.indexOf('</style>', pos)) !== -1) { sp.push(pos); pos++; }
console.log('</style> at chars:', sp);
// Find position of <script
const scriptPos = h.indexOf('<script');
console.log('<script> at char:', scriptPos);
console.log('All </style> before script:', sp.filter(p => p < scriptPos));
