const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const lines = h.split('\n');
const menuIdx = lines.findIndex(l => l.includes('id="menu"'));
console.log('menu section at line:', menuIdx);
console.log('--- MENU CONTEXT ---');
console.log(lines.slice(menuIdx, menuIdx + 30).join('\n'));

// Check if .app class is present for the main background
const appIdx = lines.findIndex(l => l.includes('class="app"') || l.includes("class='app'"));
console.log('\n.app div at line:', appIdx);
console.log(lines.slice(appIdx, appIdx+5).join('\n'));

// Check for the game background decorations
const bgIdx = lines.findIndex(l => l.includes('char-l') || l.includes('char-r'));
console.log('\nchar elements at line:', bgIdx);
console.log(lines.slice(bgIdx, bgIdx+5).join('\n'));

// Find where the main background SVG / sky is
const skyIdx = lines.findIndex(l => l.includes('sky') || l.includes('background-sky'));
console.log('\nsky at line:', skyIdx);

// Check if game-bg or similar class exists
const gameBg = h.indexOf('game-bg');
const screenClass = h.indexOf('class="screen s-menu"');
console.log('game-bg at:', gameBg);
console.log('s-menu screen at char:', screenClass);
if (screenClass > -1) console.log('s-menu context:', JSON.stringify(h.substring(screenClass, screenClass+200)));
