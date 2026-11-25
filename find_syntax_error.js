const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');

// Find the script tag content and check for syntax error
const scripts = h.match(/<script[\s\S]*?<\/script>/gi) || [];
console.log('Total script tags:', scripts.length);

scripts.forEach(function(s, i) {
  const code = s.replace(/<script[^>]*>/i,'').replace(/<\/script>/i,'');
  try { 
    new Function(code); 
    console.log('Script #'+i+': OK ('+Math.round(code.length/1024)+'KB)');
  } catch(e) { 
    console.error('Script #'+i+' SYNTAX ERROR:', e.message);
    // Find approximate location
    const lines = code.split('\n');
    const errMatch = e.message.match(/line (\d+)/i);
    if (errMatch) {
      const lineNo = parseInt(errMatch[1]);
      console.error('  Near line', lineNo, ':');
      for (let j = Math.max(0, lineNo-3); j < Math.min(lines.length, lineNo+3); j++) {
        console.error('  '+j+':', lines[j]);
      }
    } else {
      // Print first occurrence of unmatched parens
      let depth = 0;
      for (let ci = 0; ci < code.length; ci++) {
        if (code[ci] === '(') depth++;
        else if (code[ci] === ')') {
          depth--;
          if (depth < 0) {
            const excerpt = code.substring(Math.max(0, ci-100), ci+100);
            console.error('  Unmatched ) near char', ci, ':', excerpt.replace(/\n/g,' '));
            break;
          }
        }
      }
    }
  }
});
