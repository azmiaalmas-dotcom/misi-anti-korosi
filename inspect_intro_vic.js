const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const introRegex = /\.adv-intro[^{]*\{[^}]*\}/g;
let m;
while ((m = introRegex.exec(html)) !== null) {
  console.log(m[0]);
}

const vicRegex = /\.adv-vic[^{]*\{[^}]*\}/g;
while ((m = vicRegex.exec(html)) !== null) {
  console.log(m[0]);
}
