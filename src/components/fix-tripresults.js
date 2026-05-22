const fs = require('fs');

const path = '/var/www/flywise/frontend/src/components/TripResults.tsx';
let txt = fs.readFileSync(path, 'utf8');

const marker = `<div className="text-gray-800 whitespace-pre-line text-sm leading-6">`;

const idx = txt.indexOf(marker);

if (idx === -1) {
  console.log('Marker not found');
  process.exit(1);
}

txt =
txt.substring(0, idx) +
`<div className="text-gray-800 whitespace-pre-line text-sm leading-6">
  {planData?.reply || 'No itinerary generated yet.'}
</div>
</div>
</div>
);
}
`;

fs.writeFileSync(path, txt);

console.log('TripResults.tsx repaired');
