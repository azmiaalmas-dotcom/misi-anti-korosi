const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('id="advMap"');
const end = html.indexOf('id="advPlay"');
console.log(html.substring(start - 80, end));
