const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /\.adv-map[^{]*\{[^}]*\}/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[0]);
}

const pinRegex = /\.adv-pin[^{]*\{[^}]*\}/g;
while ((m = pinRegex.exec(html)) !== null) {
  console.log(m[0]);
}

const tourRegex = /\.adv-tour[^{]*\{[^}]*\}/g;
while ((m = tourRegex.exec(html)) !== null) {
  console.log(m[0]);
}

const dpadRegex = /\.adv-dpad[^{]*\{[^}]*\}/g;
while ((m = dpadRegex.exec(html)) !== null) {
  console.log(m[0]);
}
