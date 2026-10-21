/**
 * Pre-flight: prove the skin will load, without booting the GUI.
 *
 * This replays exactly what the DSH host does at boot, against the *installed*
 * profile:
 *   1. resolve the package from the profile's node_modules;
 *   2. read and validate `dsh.client` with the rules of
 *      `@deepseek-ai/dsh-client-modules` (platform:string, inject/external on a
 *      string array, immediately:boolean, unknown keys ignored);
 *   3. resolve `exports["./client"]` (string or `{ default }`) and check the file;
 *   4. check the served bundle carries the module-loader registration with the
 *      package name as id — the host serves `/plugins/<id>/client.js` verbatim;
 *   5. resolve the host half (`main`) and confirm it exports `apply`.
 *
 * Usage: node scripts/preflight.mjs [profileName]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const PKG = 'dsh-theme-thought-lite';
const profileName = process.argv[2] ?? 'desktop';
const home = process.env.USERPROFILE ?? process.env.HOME;
const profileDir = path.join(home, '.dsh', 'profiles', profileName);

let failures = 0;
const ok = (label, detail = '') => console.log(`  \u2713 ${label}${detail ? ' — ' + detail : ''}`);
const bad = (label, detail = '') => {
  failures++;
  console.log(`  \u2717 ${label}${detail ? ' — ' + detail : ''}`);
};
const expect = (cond, label, detail) => (cond ? ok(label, detail) : bad(label, detail));

console.log(`preflight · profile "${profileName}" · ${profileDir}\n`);

if (!fs.existsSync(profileDir)) {
  console.error(`  \u2717 profile not found: ${profileDir}`);
  process.exit(1);
}

// 1. profile wiring
const profilePkg = JSON.parse(fs.readFileSync(path.join(profileDir, 'package.json'), 'utf8'));
const dep = profilePkg.dependencies?.[PKG];
expect(typeof dep === 'string', 'profile depends on the skin', dep);
const bundles = profilePkg.dsh?.profile?.bundles ?? [];
expect(bundles.includes(PKG), 'package is in dsh.profile.bundles', `position ${bundles.indexOf(PKG) + 1}/${bundles.length}`);
expect(bundles[bundles.length - 1] === PKG, 'joins the bundle stack last (its layer wins over earlier ones)');

// 2. resolution from the profile root (this is the require the host uses)
const requireFromProfile = createRequire(path.join(profileDir, 'package.json'));
let pkgJsonPath;
try {
  pkgJsonPath = requireFromProfile.resolve(`${PKG}/package.json`);
  ok('resolves from the profile', pkgJsonPath);
} catch (error) {
  bad('resolves from the profile', error.message);
  process.exit(1);
}
const pkgDir = path.dirname(pkgJsonPath);
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

// 3. dsh.client validation, mirroring client-modules' parseDshClient
const decl = pkg.dsh?.client;
expect(decl && typeof decl === 'object', 'declares dsh.client');
expect(typeof decl?.platform === 'string', 'dsh.client.platform is a string', decl?.platform);
const optionalStringArray = (label, value) => {
  if (value === undefined) return;
  expect(Array.isArray(value) && value.every((v) => typeof v === 'string'), `${label} is a string array`, JSON.stringify(value));
};
optionalStringArray('dsh.client.inject', decl?.inject);
optionalStringArray('dsh.client.external', decl?.external);
if (decl?.immediately !== undefined) expect(typeof decl.immediately === 'boolean', 'dsh.client.immediately is a boolean', String(decl.immediately));
expect(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'declares dsh.bundle.patch');

// 4. exports["./client"] resolution, mirroring clientExportOf
const clientEntry = pkg.exports?.['./client'];
const clientRel = typeof clientEntry === 'string' ? clientEntry : clientEntry?.default;
expect(typeof clientRel === 'string', 'exports["./client"] resolves to a relative path', clientRel);
const clientPath = clientRel ? path.join(pkgDir, clientRel) : '';
expect(clientPath !== '' && fs.existsSync(clientPath), 'client bundle exists', clientPath && `${(fs.statSync(clientPath).size / 1024).toFixed(1)} KiB`);

const source = fs.readFileSync(clientPath, 'utf8');
const idMatch = source.match(/__ModuleLoader__\s*\.\s*load\(\s*\{\s*id:\s*("(?:[^"\\]|\\.)*")/);
expect(idMatch !== null, 'bundle registers through window.__ModuleLoader__.load with an explicit id');
if (idMatch) {
  const id = JSON.parse(idMatch[1]);
  expect(id === PKG, 'bundle id equals the package name (routes to /plugins/<id>/client.js)', id);
}
expect(/factory:\s*\(require\)\s*=>/.test(source), 'bundle hands the loader a factory (lazy CJS protocol)');
expect(/return module\.exports;/.test(source), 'factory returns module.exports');
expect(!/^\s*import\s/m.test(source), 'bundle is a classic script, not an ES module');
expect(source.includes('overrideTokens'), 'bundle stacks the theme token layer');
expect(source.includes('inject = ["theme"]') || /exports\.inject\s*=\s*\[\s*"theme"\s*\]/.test(source), 'bundle requires the ctx.theme service');

// 5. host half
const mainRel = pkg.main;
const mainPath = path.join(pkgDir, mainRel);
expect(fs.existsSync(mainPath), 'host half exists', mainRel);
const hostSource = fs.readFileSync(mainPath, 'utf8');
expect(/export\s+function\s+apply|export\s*\{[^}]*\bapply\b/.test(hostSource), 'host half exports a cordis apply()');

// 6. the patch layer actually in effect
const patchPath = path.join(pkgDir, 'cordis.patch.yml');
expect(fs.existsSync(patchPath), 'bundle patch exists');
const patch = fs.readFileSync(patchPath, 'utf8');
expect(/^- insert:/m.test(patch), 'patch is a YAML insert list');
expect(patch.includes(`name: '${PKG}'`), 'patch mounts the package by name');

console.log(failures === 0 ? '\npreflight OK — restart DeepSeek Harness to apply' : `\npreflight FAILED (${failures})`);
process.exit(failures === 0 ? 0 : 1);
