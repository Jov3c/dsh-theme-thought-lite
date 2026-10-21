/**
 * Verifier for the ThoughtLite DSH skin. Runs with plain Node, no dependencies:
 *
 *   node test/verify.mjs
 *
 * It checks the three things that can actually break a skin:
 *   1. the bundle loads through the DSH module-loader contract and applies;
 *   2. the override layer is well-formed and covers the DSH token inventory;
 *   3. the values are legible (WCAG contrast on the reading surface) and the
 *      stylesheet parses.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

let failures = 0;
let checks = 0;
const ok = (label, detail = '') => {
  checks++;
  console.log(`  \u2713 ${label}${detail ? ' — ' + detail : ''}`);
};
const bad = (label, detail = '') => {
  checks++;
  failures++;
  console.log(`  \u2717 ${label}${detail ? ' — ' + detail : ''}`);
};
const expect = (cond, label, detail) => (cond ? ok(label, detail) : bad(label, detail));

// ── colour helpers ─────────────────────────────────────────────────────────
function parseColor(input) {
  const value = String(input).trim();
  const hex = value.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: alpha,
    };
  }
  const rgba = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const parts = rgba[1].split(/[,/\s]+/).filter(Boolean).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }
  return null;
}
const composite = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});
const luminance = ({ r, g, b }) => {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
function contrast(a, b) {
  const fa = parseColor(a);
  const fb = parseColor(b);
  if (!fa || !fb) return null;
  const bg = fb.a < 1 ? composite(fb, { r: 255, g: 255, b: 255, a: 1 }) : fb;
  const fg = fa.a < 1 ? composite(fa, bg) : fa;
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ── 1. bundle contract ─────────────────────────────────────────────────────
console.log('\nbundle');
const clientSource = read('lib/client.js');
let script;
try {
  script = new vm.Script(clientSource, { filename: 'lib/client.js' });
  ok('lib/client.js parses');
} catch (error) {
  bad('lib/client.js parses', error.message);
}

let registered = null;
let styleTags = [];
const head = {
  appendChild(node) {
    styleTags.push(node);
    return node;
  },
};
const sandboxDocument = {
  createElement(tag) {
    if (tag !== 'style') throw new Error('unexpected element ' + tag);
    return {
      dataset: {},
      textContent: '',
      removed: false,
      remove() {
        styleTags = styleTags.filter((t) => t !== this);
      },
    };
  },
  head,
};
const sandboxWindow = {
  __ModuleLoader__: {
    load(entry) {
      registered = entry;
    },
  },
};
if (script) {
  try {
    vm.runInNewContext(clientSource, { window: sandboxWindow, document: sandboxDocument, console, setTimeout });
    expect(registered !== null, 'registers through window.__ModuleLoader__.load');
    expect(registered?.id === 'dsh-theme-thought-lite', 'bundle id matches package name', String(registered?.id));
    expect(typeof registered?.factory === 'function', 'factory is a function');
  } catch (error) {
    bad('bundle executes the loader call', error.message);
  }
}

const exports_ = registered?.factory(() => {
  throw new Error('this skin must not synchronously require host modules');
});
expect(Array.isArray(exports_?.inject) && exports_.inject.includes('theme'), 'declares ctx.theme as a required client service', JSON.stringify(exports_?.inject));
expect(typeof exports_?.apply === 'function', 'exports apply()');

// ── 2. apply / dispose on a fake ctx ───────────────────────────────────────
console.log('\napply');
const calls = { overrideTokens: [], effects: [], disposers: [] };
const themeService = {
  overrideTokens(source, tokens) {
    calls.overrideTokens.push({ source, tokens });
    return () => calls.disposers.push('tokens');
  },
};
const ctx = {
  theme: themeService,
  effect(fn, label) {
    calls.effects.push(label);
    const dispose = fn();
    if (typeof dispose === 'function') calls.disposers.push(dispose);
    return () => {};
  },
};
try {
  exports_.apply(ctx);
  ok('apply() runs without throwing');
} catch (error) {
  bad('apply() runs without throwing', error.message);
}
expect(calls.overrideTokens.length === 1, 'stacks exactly one token layer', String(calls.overrideTokens.length));
expect(calls.overrideTokens[0]?.source === 'dsh-theme-thought-lite', 'layer source is the package id');
expect(styleTags.length === 1, 'mounts exactly one stylesheet', String(styleTags.length));
expect(styleTags[0]?.dataset?.plugin === 'dsh-theme-thought-lite', 'stylesheet is plugin-owned (unloaded with the plugin)');
expect(calls.effects.length === 2, 'both mounts are effects (lifetime-bound)', JSON.stringify(calls.effects));

// a second apply must replace, not duplicate, the layer
exports_.apply(ctx);
expect(calls.overrideTokens.length === 2 && calls.overrideTokens[1].source === calls.overrideTokens[0].source, 're-applying reuses one layer source');

// ── 3. token layer shape + coverage ────────────────────────────────────────
console.log('\ntoken layer');
const TOKENS = calls.overrideTokens[0].tokens;
const names = Object.keys(TOKENS);
expect(names.length > 190, 'covers more than the base token inventory', `${names.length} tokens`);

const malformed = names.filter((name) => {
  const value = TOKENS[name];
  return (
    !name.startsWith('--') ||
    typeof value !== 'object' ||
    value === null ||
    typeof value.light !== 'string' ||
    typeof value.dark !== 'string' ||
    value.light.length === 0 ||
    value.dark.length === 0
  );
});
expect(malformed.length === 0, 'every override is { light, dark } with non-empty strings', malformed.slice(0, 4).join(', '));

const bareStrings = names.filter((name) => typeof TOKENS[name] === 'string');
expect(bareStrings.length === 0, 'no bare-string overrides (would throw at the API boundary)', bareStrings.slice(0, 3).join(', '));

const inventory = JSON.parse(read('fixtures/dsh-tokens.json'));const designPlatform = inventory.tokens.filter((t) => t.sheet === 'design-platform').map((t) => t.name);
const missing = designPlatform.filter((name) => !(name in TOKENS));
expect(missing.length === 0, 'covers every design-platform token', missing.length ? `${missing.length} missing: ${missing.slice(0, 6).join(', ')}` : `${designPlatform.length} tokens`);

const unknown = names.filter((name) => !inventory.tokens.some((t) => t.name === name));
expect(unknown.length === 0, 'overrides only real DSH token names (no typos)', unknown.slice(0, 6).join(', '));

// no token may reference a variable that nothing defines. Four families are
// written inline on <body> by ui-layout's ThemePresenter at runtime rather than
// declared in a stylesheet, so they are legal references even though they are
// not in the inventory.
const RUNTIME_VARS = /^--dsh-(content|code|terminal)-font-size$|^--dsh-font-family-(text|code|terminal)$/;
const defined = new Set(inventory.tokens.map((t) => t.name));
const danglingRefs = [];
for (const name of names) {
  for (const mode of ['light', 'dark']) {
    for (const ref of TOKENS[name][mode].matchAll(/var\(\s*(--[\w-]+)/g)) {
      const target = ref[1];
      if (defined.has(target) || target in TOKENS || RUNTIME_VARS.test(target)) continue;
      danglingRefs.push(`${name} -> ${target}`);
    }
  }
}
expect(danglingRefs.length === 0, 'no var() reference points at an undefined token', danglingRefs.slice(0, 4).join(', '));

// the shipped bundle must be built from the current source, not a stale build
const shipped = JSON.parse(read('fixtures/skin-tokens.json'));
const stale = Object.keys(TOKENS).filter((name) => JSON.stringify(TOKENS[name]) !== JSON.stringify(shipped.tokens[name]));
expect(shipped.count === names.length && stale.length === 0, 'bundle matches the current build (fixtures in sync)', stale.slice(0, 3).join(', '));
expect(Object.keys(exports_.TOKENS ?? {}).length === names.length, 'bundle exports its token layer for inspectors');

// ── 4. legibility on the reading surface ───────────────────────────────────
console.log('\nlegibility (WCAG 2.1 contrast)');
const surfacePairs = [
  ['--dsw-alias-label-primary', '--dsw-alias-bg-base', 7, 'body text on canvas'],
  ['--dsw-alias-label-secondary', '--dsw-alias-bg-base', 4.5, 'secondary text on canvas'],
  ['--dsw-alias-label-primary', '--dsw-alias-markdown-code-block', 7, 'body text on code fill'],
  ['--dsw-alias-label-primary', '--dsw-alias-markdown-code-block-banner', 7, 'body text on code banner'],
  ['--dsw-alias-label-primary', '--dsw-specific-sidebar-fill', 7, 'body text on sidebar'],
  ['--dsw-alias-label-primary', '--dsw-specific-sidebar-nav-item-active', 7, 'active nav label'],
  ['--dsw-alias-label-primary', '--dsw-specific-bubble', 4.5, 'user bubble text'],
  ['--dsw-alias-label-primary', '--dsw-specific-input-major', 7, 'composer text'],
  ['--dsw-alias-label-primary', '--dsw-alias-bg-overlay', 7, 'body text on overlay surface'],
  ['--dsw-alias-label-primary', '--dsw-specific-tip', 7, 'body text on tip surface'],
  ['--dsw-alias-label-primary-foreground', '--dsw-alias-button-primary-fill', 4.5, 'primary button label'],
  ['--dsw-alias-label-primary-inverted', '--dsw-alias-tooltip-bg', 4.5, 'tooltip label'],
  ['--dsw-alias-toast-label', '--dsw-alias-toast-bg', 4.5, 'toast label'],
  ['--dsw-alias-link', '--dsw-alias-bg-base', 4.5, 'link text on canvas'],
  ['--dsw-alias-state-error-primary', '--dsw-alias-bg-base', 3, 'error text on canvas'],
  ['--dsw-alias-state-warn-primary', '--dsw-alias-bg-base', 3, 'warning text on canvas'],
  ['--dsw-alias-state-success-primary', '--dsw-alias-bg-base', 3, 'success text on canvas'],
];
for (const [fgName, bgName, min, label] of surfacePairs) {
  for (const mode of ['light', 'dark']) {
    const ratio = contrast(TOKENS[fgName][mode], TOKENS[bgName][mode]);
    if (ratio === null) {
      bad(`${label} (${mode})`, 'unparsable colour');
      continue;
    }
    expect(ratio >= min, `${label} (${mode})`, `${ratio.toFixed(2)}:1 ≥ ${min}`);
  }
}

// ── 5. stylesheet ──────────────────────────────────────────────────────────
console.log('\nstylesheet');
const STYLES = exports_.STYLES ?? JSON.parse('null');
const css = (() => {
  const match = clientSource.match(/var STYLES = (".*?");\n/s);
  return match ? JSON.parse(match[1]) : '';
})();
expect(css.length > 500, 'stylesheet is present in the bundle', `${css.length} bytes`);
expect((css.match(/\{/g) ?? []).length === (css.match(/\}/g) ?? []).length, 'braces balance', `${(css.match(/\{/g) ?? []).length} open`);
expect(!/\/\*(?![^*]*\*\/)/s.test(css.replace(/\/\*[\s\S]*?\*\//g, '')), 'no unclosed comment');

const cssRefs = [...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]);
const cssDangling = [...new Set(cssRefs)].filter((name) => !(name in TOKENS) && !defined.has(name));
expect(cssDangling.length === 0, 'stylesheet only reads tokens the skin or DSH defines', cssDangling.join(', '));

// the hooks the signature rules depend on must exist in the shipped DSH CSS
const frontendCssPath = 'fixtures/dsh-frontend.css';
if (fs.existsSync(path.join(root, frontendCssPath))) {
  const appCss = read(frontendCssPath);
  const hooks = ['_markdown_', 'md-code-block', 'data-ds-dark-theme'];
  for (const hook of hooks) expect(appCss.includes(hook), `app CSS still exposes the "${hook}" hook`);
}

// structural rules may only attach to hooks declared in the fixture — this is
// what catches "the skin silently stopped matching after a DSH upgrade"
const hookFixture = JSON.parse(read('fixtures/dsh-css-modules.json'));
const declaredHooks = new Set(hookFixture.hooks.map((h) => h.hook));
const cssHooks = new Set([
  ...[...css.matchAll(/\[class\*="(_[A-Za-z0-9-]+)"\]/g)].map((m) => m[1]),
  ...[...css.matchAll(/\.(md-[A-Za-z0-9-]+)/g)].map((m) => m[1]),
]);
const undeclared = [...cssHooks].filter((hook) => !declaredHooks.has(hook));
expect(undeclared.length === 0, 'every CSS hook the skin targets is declared in fixtures/dsh-css-modules.json', undeclared.join(', '));
expect(cssHooks.size >= 5, 'stylesheet attaches to the structural hooks', `${cssHooks.size} hooks`);

// ── 6. manifest ────────────────────────────────────────────────────────────
console.log('\nmanifest');
const pkg = JSON.parse(read('package.json'));
const hostEntry = read('lib/index.js');
expect(pkg.main === 'lib/index.js', 'main points at the host half');
expect(pkg.exports?.['./client']?.default === 'lib/client.js' || pkg.exports?.['./client']?.default === './lib/client.js', 'exports ./client points at the browser half');
expect(pkg.dsh?.client?.platform === 'web', 'declares dsh.client.platform = web');
expect(typeof pkg.dsh?.client?.inject !== 'undefined', 'declares dsh.client.inject');
expect(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'declares dsh.bundle.patch');
expect(hostEntry.includes('export function apply'), 'host half exports a cordis apply()');
expect(/^- insert:/m.test(read('cordis.patch.yml')), 'patch is an insert list');
expect(read('cordis.patch.yml').includes("name: 'dsh-theme-thought-lite'"), 'patch mounts the package by name');

const preview = read('preview/index.html');
expect(preview.includes('data-mode="light"') && preview.includes('data-mode="dark"'), 'preview renders both schemes');

// ── summary ────────────────────────────────────────────────────────────────
console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures > 0) {
  console.log('FAILED');
  process.exit(1);
}
console.log('OK');
