const fs = require('fs');

const path = 'TripResults.tsx';
let txt = fs.readFileSync(path, 'utf8');

txt = txt.replace(
/const otherLines[\s\S]*?\);\s*/m,
''
);

txt = txt.replace(
/<div className="mt-6 space-y-2">[\s\S]*?otherLines\.map[\s\S]*?<\/div>\s*<\/div>/m,
'</div>'
);

fs.writeFileSync(path, txt);

console.log('FINAL DUPLICATE FIX APPLIED');
