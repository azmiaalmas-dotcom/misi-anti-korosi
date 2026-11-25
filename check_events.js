const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const sc = h.indexOf('<script>');
const se = h.lastIndexOf('</script>');
const js = h.substring(sc+8, se);

// Check all functions referenced in event bindings (bottom section)
const eventSection = js.substring(js.indexOf('/* ---------- Event Bindings Final Game ---------- */'));
console.log('=== EVENT BINDINGS SECTION ===');
console.log(eventSection.substring(0, 2000));
