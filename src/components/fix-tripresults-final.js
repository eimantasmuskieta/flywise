const fs = require('fs');

const path = '/var/www/flywise/frontend/src/components/PlanYourTrip.tsx';

let txt = fs.readFileSync(path, 'utf8');

const startMarker = 'const otherLines';
const endMarker = 'return (';

const start = txt.indexOf(startMarker);
const end = txt.indexOf(endMarker);

if (start !== -1 && end !== -1) {
  txt =
    txt.substring(0, start) +
    '\n\n' +
    txt.substring(end);
}

txt = txt.replace(
  /\{otherLines\.map\([\s\S]*?\)\}\)/g,
  ''
);

txt = txt.replace(
  /\{planData\.reply[\s\S]*?\}/g,
  ''
);

fs.writeFileSync(path, txt);

console.log('TripResults cleaned.');
