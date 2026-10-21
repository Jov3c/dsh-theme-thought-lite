/**
 * Ask the running host whether the skin is part of its client-module graph.
 *
 * The `/plugins/events` SSE route is the graph/HMR transport the browser itself
 * uses; it accepts a plain connection and sends the current graph as its first
 * frame, so no auth token is needed to answer the only question that matters
 * here: did the host compose this plugin?
 *
 * Usage:
 *   node scripts/graph-probe.mjs               # uses DSH_WEB_URL
 *   node scripts/graph-probe.mjs http://127.0.0.1:12345
 */
const PKG = 'dsh-theme-thought-lite';
const base = (process.argv[2] ?? process.env.DSH_WEB_URL ?? '').replace(/\/+$/, '');
if (!base) {
  console.error('no base URL: pass one, or run inside a DSH session (DSH_WEB_URL)');
  process.exit(1);
}

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 6000);
let text = '';
try {
  const response = await fetch(`${base}/plugins/events`, {
    signal: controller.signal,
    headers: { accept: 'text/event-stream' },
  });
  if (!response.ok) {
    console.error(`graph stream answered HTTP ${response.status}`);
    process.exit(1);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (text.length < 800000) {
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    if (text.includes(`"id":"${PKG}"`)) break;
  }
} catch (error) {
  if (error.name !== 'AbortError') {
    console.error('graph stream failed:', error.message);
    process.exit(1);
  }
} finally {
  clearTimeout(timer);
  controller.abort();
}

const release = text.match(/"release":\{([^}]*)\}/)?.[1] ?? 'unknown';
const entry = text.match(new RegExp(`\\{"id":"${PKG}"[^}]*\\}`))?.[0];
const total = (text.match(/\{"id":"/g) ?? []).length;

console.log(`host: ${base}`);
console.log(`release: ${release}`);
console.log(`client modules in graph: ${total}`);
if (entry) {
  console.log(`SKIN IN GRAPH: ${entry}`);
  const rev = entry.match(/"rev":"([^"]+)"/)?.[1];
  console.log(`\nThe host serves the skin (rev ${rev}). If the window still looks native,`);
  console.log('the page kept an older boot graph: hard-reload it, or touch lib/client.js to let HMR deliver this graph.');
  process.exit(0);
} else {
  console.log(`SKIN NOT IN GRAPH: the host did not compose ${PKG}.`);
  console.log('Check: dsh.profile.bundles in the profile package.json, then node scripts/preflight.mjs');
  process.exit(2);
}
