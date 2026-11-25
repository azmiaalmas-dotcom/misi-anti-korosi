// The old code was fine. Our rebuild_adventure.js injected a large CSS block at the top via:
// html = html.replace('  </style>', NEW_CSS + '\n  </style>');
// But the NEW_CSS contains a ")" inside a CSS comment/string that is now inside the <script> tag context
// when the browser parses it. Wait - actually the CSS injection happens before </style>, not in the script.
// 
// The real issue: our NEW_CSS injection string with replace('  </style>', ...) 
// might be matching THE WRONG </style> if there are multiple.
// Also, `q.steps.map(function (t, i) { return (i + 1) + ') ' + esc(t) })` is valid JS...
// but it was INSIDE the original script. 
//
// The error "Unexpected token ')'" at char 112040 is caused by the NEW_CSS being inserted 
// INSIDE the <script> tag rather than inside the <style> tag. 
// This means our css.replace('  </style>', ...) matched a "</style>" text that appeared 
// INSIDE the JS code as an HTML string! And it replaced that one instead of the real </style>.
//
// Fix: use a more targeted replace that finds the actual CSS </style> marker.
// We'll search for the last </style> before <script> tag starts.

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const scriptStart = html.indexOf('<script');
const styleEnd = html.lastIndexOf('</style>', scriptStart);
console.log('Script starts at:', scriptStart);
console.log('Last </style> before script:', styleEnd);
console.log('Context around styleEnd:', html.substring(styleEnd - 100, styleEnd + 20));
