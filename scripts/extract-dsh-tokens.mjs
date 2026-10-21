// Builds fixtures/dsh-tokens.json: the DSH design-token inventory this skin must cover.
// Source: sheets extracted from the installed DSH app.asar (ui-theme client bundle).
import fs from 'node:fs';
import path from 'node:path';

const SRC = process.argv[2]; // dir with *.css sheets
const OUT = process.argv[3];

function parse(css) {
  const groups = new Map();
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1].trim().replace(/\s+/g, ' ');
    if (!groups.has(sel)) groups.set(sel, {});
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':');
      if (i < 0) continue;
      const k = d.slice(0, i).trim();
      if (!k.startsWith('--')) continue;
      groups.get(sel)[k] = d.slice(i + 1).trim();
    }
  }
  return groups;
}

const sheetFiles = {
  'design-platform': 'design_platform_css_default.css',
  'gradient-shadow-text': 'gradient_shadow_text_css_default.css',
  'base': 'base_css_default.css',
  'scrollbar': 'scrollbar_css_default.css',
  'shiki': 'shiki_css_default.css',
  'focus': 'focus_css_default.css',
};

const tokens = new Map();
for (const [sheet, file] of Object.entries(sheetFiles)) {
  const full = path.join(SRC, file);
  if (!fs.existsSync(full)) throw new Error('missing sheet ' + file);
  const groups = parse(fs.readFileSync(full, 'utf8'));
  for (const [sel, map] of groups) {
    for (const [name, value] of Object.entries(map)) {
      const entry = tokens.get(name) ?? { name, sheet, light: null, dark: null, selectors: [] };
      if (sel === 'body' || sel === ':root' || sel === 'body,:root' || sel === ':root,body') entry.light = value;
      else if (sel.startsWith('body[data-ds-dark-theme]')) entry.dark = value;
      // mode-independent declarations land on whichever slot is empty
      if (entry.light === null) entry.light = value;
      if (entry.dark === null) entry.dark = entry.light;
      entry.selectors.push(sheet + ':' + sel);
      tokens.set(name, entry);
    }
  }
}

const list = [...tokens.values()].sort((a, b) => a.name.localeCompare(b.name));
const modeSpecific = list.filter((t) => t.light !== t.dark).map((t) => t.name);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      note: 'DSH design-token inventory extracted from the installed DSH (ui-theme client bundle). modeSpecific = tokens whose light and dark values differ in the base theme.',
      count: list.length,
      modeSpecificCount: modeSpecific.length,
      tokens: list,
    },
    null,
    2,
  ) + '\n',
);
console.log('tokens', list.length, 'mode-specific', modeSpecific.length, '->', OUT);
