const fs = require('fs');

const path = '/var/www/flywise/frontend/src/components/TripResults.tsx';

let txt = fs.readFileSync(path, 'utf8');

const oldBlock = /const finalItinerary =[\s\S]*?;\n/;

const newBlock = `
const finalItinerary = (() => {
  const seen = new Set();

  return (cleanItinerary || []).filter(line => {
    const match = line.match(/Day\\s+(\\d+)/i);

    if (!match) return false;

    const day = match[1];

    if (seen.has(day)) {
      return false;
    }

    seen.add(day);

    return true;
  });
})();
`;

txt = txt.replace(oldBlock, newBlock);

fs.writeFileSync(path, txt);

console.log('FINAL unique day fix applied');
