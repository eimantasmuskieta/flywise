const fs = require('fs');

const path = '/var/www/flywise/frontend/src/components/TripResults.tsx';

let txt = fs.readFileSync(path, 'utf8');

const marker = 'const itineraryLines =';

if (!txt.includes('const dedupedReplyLines')) {

txt = txt.replace(
marker,
`
const dedupedReplyLines = (() => {
  const seen = new Set();

  return (planData?.reply || '')
    .split('\\n')
    .filter(line => {
      const match = line.match(/^Day\\s+(\\d+)/i);

      if (!match) return true;

      const day = match[1];

      if (seen.has(day)) {
        return false;
      }

      seen.add(day);

      return true;
    });
})();

` + marker
);

txt = txt.replace(
/\{description\}/g,
`{description}`
);

txt = txt.replace(
/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/s,
`
            <div className="mt-8 space-y-2">
              {dedupedReplyLines
                .filter(line => !/^Day\\s+\\d+/i.test(line.trim()))
                .map((line, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-700"
                  >
                    {line}
                  </div>
                ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
`
);

}

fs.writeFileSync(path, txt);

console.log('FINAL dedupe fix applied');
