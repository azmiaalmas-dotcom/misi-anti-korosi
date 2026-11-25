const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const sc = h.indexOf('<script>');
const se = h.lastIndexOf('</script>');
const js = h.substring(sc+8, se);

// Find ADV_AREAS in JS
const advAreasInJs = js.indexOf('var ADV_AREAS');
console.log('ADV_AREAS in JS at:', advAreasInJs);

// What's right BEFORE ADV_AREAS?
console.log('=== 2000 chars BEFORE ADV_AREAS ===');
console.log(js.substring(advAreasInJs - 2000, advAreasInJs));
