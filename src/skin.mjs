/**
 * ThoughtLite skin for DeepSeek Harness — single source of truth.
 *
 * Upstream design: https://github.com/tuyuritio/astro-theme-thought-lite (GPLv3).
 * Only design *values* are ported (colours, type scale, rules); no upstream code.
 *
 * The whole palette of the upstream theme is seven CSS variables in
 * `src/styles/global.css`; everything else there is Tailwind v4 CSS-first.
 * This file maps those anchors onto the DSH `--dsw-*` semantic token layer.
 *
 * Mapping principles (see README §设计映射 for the reasoning):
 *   1. Paper and ink come from upstream verbatim: #fffffd / #2a2a28 (light),
 *      #0e0e0c / #dddddb (dark).
 *   2. Upstream has no accent colour — "accent is the text colour". So every
 *      DSH brand/interactive/link token collapses onto ink. Affordance is kept
 *      by underlining links in CSS instead of colouring them.
 *   3. Semantic status colours are the only saturated colours upstream has
 *      (GitHub-alert hues), so error/warn/success keep those hues.
 *   4. Surfaces stay flat: upstream raises elements by a hairline border and a
 *      barely-there shadow, never by a lifted grey card.
 */

export const ID = 'dsh-theme-thought-lite';
export const NAME = 'ThoughtLite';
export const UPSTREAM = 'https://github.com/tuyuritio/astro-theme-thought-lite';

/** Upstream anchors, verbatim from src/styles/global.css. */
export const ANCHORS = {
  light: {
    primary: '#2a2a28',
    secondary: '#7e7e7b',
    weak: '#9f9f9c',
    background: '#fffffd',
    block: '#eeeeee',
    shadow: '#cdcdcc',
    selection: '#adadacc3',
  },
  dark: {
    primary: '#dddddb',
    secondary: '#9e9e9b',
    weak: '#5d5d5a',
    background: '#0e0e0c',
    block: '#1e1e1e',
    shadow: '#323231',
    selection: '#adadacc3',
  },
};

/** Status hues upstream hardcodes for GitHub alerts (+ danger button). */
const STATUS = {
  tip: '#48a131',
  important: '#3366cc',
  warning: '#bf8700',
  caution: '#ee3838',
};

const both = (value) => ({ light: value, dark: value });
const m = (light, dark) => ({ light, dark });

// ───────────────────────────── surfaces ──────────────────────────────
// Upstream paper is #fffffd — technically warm, visually white, and the stock
// harness canvas is white too, so the two are indistinguishable side by side.
// Cream makes the paper feel actually visible. The reading column stays the
// brightest surface so body text keeps full contrast.
const L = {
  canvas: '#fdfcf6',
  layer1: '#f8f6ec',
  layer2: '#f3f0e3',
  layer3: '#ece8d8',
  sidebar: '#f6f3e8',
  overlay: '#e4e0d0',
  block: '#f0ede0',
  blockBanner: '#eae6d6',
  ink: '#2a2a28',
  inkSoft: '#3b3b38',
  secondary: '#7e7e7b',
  weak: '#9f9f9c',
  shadow: '#cdcdcc',
};
const D = {
  canvas: '#0e0e0c',
  layer1: '#16150f',
  layer2: '#1d1c16',
  layer3: '#24231b',
  sidebar: '#131210',
  overlay: '#24231b',
  block: '#1e1d17',
  blockBanner: '#232219',
  ink: '#dddddb',
  inkSoft: '#c9c9c5',
  secondary: '#9e9e9b',
  weak: '#5d5d5a',
  shadow: '#323231',
};

// Upstream has no sans-serif anywhere: `body { font-family: var(--font-serif),
// var(--font-mono) }`. Making the whole harness serif is what makes the skin
// recognisable at a glance, so the UI text stack IS the serif stack. A user who
// picks their own font in Settings still wins (that list precedes this default).
export const SERIF =
  '"Noto Serif SC", "Noto Serif", "Source Han Serif SC", "Source Han Serif", "Songti SC", STSong, SimSun, Georgia, "Times New Roman", serif';
export const MONO =
  '"Maple Mono NF CN", "Maple Mono NF", "Maple Mono", ui-monospace, "Cascadia Code", "JetBrains Mono", Consolas, Monaco, "Courier New", monospace';

const serif = both(SERIF);

/**
 * The override layer handed to `ctx.theme.overrideTokens`.
 * Every value is `{ light, dark }` — the DSH theme runtime picks one per
 * active colour scheme and writes it as an inline custom property on <body>.
 */
export const TOKENS = {
  // ── static ramps ───────────────────────────────────────────────────
  // A warm paper ramp. Light aliases read the top of the ramp, dark aliases
  // the bottom, so one monotonic ramp serves both schemes.
  '--dsw-static-neutral-bluish-00': m(L.canvas, D.canvas),
  '--dsw-static-neutral-bluish-50': m(L.layer1, D.layer1),
  '--dsw-static-neutral-bluish-60': m(L.layer2, D.layer1),
  '--dsw-static-neutral-bluish-75': m(L.layer3, D.layer2),
  '--dsw-static-neutral-bluish-100': m('#ece8da', '#26241c'),
  '--dsw-static-neutral-bluish-150': m('#e4dfcf', '#2b291f'),
  '--dsw-static-neutral-bluish-200': m('#d8d2bf', '#332f22'),
  '--dsw-static-neutral-bluish-300': m('#c2c2bd', '#3f3f3c'),
  '--dsw-static-neutral-bluish-400': m('#a2a29e', '#6b6b67'),
  '--dsw-static-neutral-bluish-500': m('#8c8c88', '#85858a'),
  '--dsw-static-neutral-bluish-600': m('#7e7e7b', '#9e9e9b'),
  '--dsw-static-neutral-bluish-700': m('#64645f', '#b1b1ad'),
  '--dsw-static-neutral-bluish-750': m('#4d4d49', '#c2c2bd'),
  '--dsw-static-neutral-bluish-800': m('#3b3b38', '#262624'),
  '--dsw-static-neutral-bluish-850': m('#2e2e2b', '#1e1e1c'),
  '--dsw-static-neutral-bluish-875': m('#262524', '#171715'),
  '--dsw-static-neutral-bluish-900': m('#1e1e1e', '#141412'),
  '--dsw-static-neutral-bluish-950': m('#141413', '#0e0e0c'),
  '--dsw-static-neutral-bluish-1000': m('#0e0e0c', '#dddddb'),

  // Cool-neutrals: only scrollbars and a few meter fills still use these.
  '--dsw-static-neutral-00': both('#ffffff'),
  '--dsw-static-neutral-50': m('#fafafa', '#fafafa'),
  '--dsw-static-neutral-100': m('#f5f5f5', '#f5f5f5'),
  '--dsw-static-neutral-150': m('#ededed', '#ededed'),
  '--dsw-static-neutral-200': m('#e5e5e5', '#e5e5e5'),
  '--dsw-static-neutral-250': m('#dcdcdc', '#dcdcdc'),
  '--dsw-static-neutral-300': m('#d4d4d2', '#d4d4d2'),
  '--dsw-static-neutral-400': m('#a4a4a2', '#a4a4a2'),
  '--dsw-static-neutral-500': m('#83837f', '#83837f'),
  '--dsw-static-neutral-550': m('#6b6b67', '#6b6b67'),
  '--dsw-static-neutral-600': m('#565651', '#565651'),
  '--dsw-static-neutral-700': m('#3c3c3a', '#3c3c3a'),
  '--dsw-static-neutral-800': m('#292927', '#292927'),
  '--dsw-static-neutral-850': m('#212120', '#212120'),
  '--dsw-static-neutral-900': m('#0f0f0e', '#0f0f0e'),
  '--dsw-static-neutral-1000': both('#000000'),

  // Brand ramp → ink. Upstream's brand *is* its text colour; the per-mode
  // values keep the accent visible on either canvas.
  '--dsw-static-deepseek-50': m(L.block, D.block),
  '--dsw-static-deepseek-100': m('#e6e6e2', '#242422'),
  '--dsw-static-deepseek-200': m('#dcdcd7', '#2b2b29'),
  '--dsw-static-deepseek-300': m('#c9c9c4', '#3b3b38'),
  '--dsw-static-deepseek-400': m(L.inkSoft, D.ink),
  '--dsw-static-deepseek-450': m('#4a4a46', D.ink),
  '--dsw-static-deepseek-500': m(L.ink, D.ink),
  '--dsw-static-deepseek-600': m('#3f3f3b', '#b3b3af'),
  '--dsw-static-deepseek-700-delete': m('#2f2f2c', '#c2c2bd'),
  '--dsw-static-deepseek-800': m('#262624', D.layer2),
  '--dsw-static-deepseek-900': m('#1c1c1a', D.layer1),

  // Blues → the same neutral ramp; upstream is strictly monochrome.
  '--dsw-static-blue-50': m('#fafaf7', '#171715'),
  '--dsw-static-blue-50p': m('#f6f6f2', '#1e1e1c'),
  '--dsw-static-blue-75': m('#f1f1ed', '#1e1e1c'),
  '--dsw-static-blue-100': m('#e9e9e5', '#262624'),
  '--dsw-static-blue-300': m('#c2c2bd', '#3f3f3c'),
  '--dsw-static-blue-400': m('#a2a29e', '#6b6b67'),
  '--dsw-static-blue-450': m('#8c8c88', '#7e7e7b'),
  '--dsw-static-blue-500': m('#7e7e7b', '#9e9e9b'),
  '--dsw-static-blue-600': m('#64645f', '#b1b1ad'),
  '--dsw-static-blue-800': m('#3b3b38', '#c2c2bd'),
  '--dsw-static-blue-900': m('#2a2a28', '#dddddb'),
  '--dsw-static-blue-950': m('#1e1e1e', '#141412'),

  // Status hues: upstream's alert palette.
  '--dsw-static-green-100': m('#eaf3e6', '#1b241a'),
  '--dsw-static-green-400': m('#6fbf5a', '#6fbf5a'),
  '--dsw-static-green-500': m(STATUS.tip, '#6fbf5a'),
  '--dsw-static-green-500-a08': m('#48a13114', '#6fbf5a14'),
  '--dsw-static-green-500-a12': m('#48a1311f', '#6fbf5a1f'),
  '--dsw-static-green-900': m('#233c2c', '#233c2c'),
  '--dsw-static-red-50': m('#fdf1f1', '#241717'),
  '--dsw-static-red-100': m('#fbe3e3', '#2a1a1a'),
  '--dsw-static-red-400': m('#f26b6b', '#f26b6b'),
  '--dsw-static-red-400-a12': m('#f26b6b1f', '#f26b6b1f'),
  '--dsw-static-red-500': m('#f04a4a', '#f04a4a'),
  '--dsw-static-red-600': m(STATUS.caution, '#f26b6b'),
  '--dsw-static-red-600-a08': m('#ee383814', '#f26b6b14'),
  '--dsw-static-red-900': m('#570c0c', '#570c0c'),
  '--dsw-static-amber-100': m('#fbf1dd', '#2a2213'),
  '--dsw-static-amber-400': m('#d9a13a', '#d9a13a'),
  '--dsw-static-amber-500': m(STATUS.warning, '#d9a13a'),
  '--dsw-static-amber-600': m('#a37100', '#d9a13a'),
  '--dsw-static-amber-900': m('#27241f', '#27241f'),

  // ── text ───────────────────────────────────────────────────────────
  '--dsw-alias-label-primary': m(L.ink, D.ink),
  '--dsw-alias-label-primary-bluish': m(L.ink, D.ink),
  '--dsw-alias-label-primary-dimmed': m(L.inkSoft, D.inkSoft),
  '--dsw-alias-label-primary-foreground': m('#fffffd', '#0e0e0c'),
  '--dsw-alias-label-primary-inverted': m('#fffffd', '#1e1e1c'),
  // Upstream's --secondary-color is #7e7e7b (4.07:1 on its own paper, below AA).
  // Nudged to #73736f, which holds 4.63:1 on the cream canvas; hue kept.
  '--dsw-alias-label-secondary': m('#73736f', D.secondary),
  '--dsw-alias-label-tertiary': m(L.weak, '#6f6f6b'),
  '--dsw-alias-label-caption': m('#a8a8a4', '#7a7a76'),
  '--dsw-alias-label-dimmed': m('#c2c2bd', '#4c4c48'),
  '--dsw-alias-label-document-preview': m('#3b3b38', '#c2c2bd'),
  '--dsw-alias-label-shimmer': m('#0000004d', '#ffffff73'),
  '--dsw-alias-label-deep-diving': m(L.ink, D.ink),
  '--dsw-alias-label-deep-diving-shimmer': m('#b5b5b0', '#6b6b67'),
  '--dsw-alias-link': m(L.ink, D.ink),
  '--dsw-alias-menu-icon': m('#3b3b38', '#c9c9c5'),

  // ── surfaces ───────────────────────────────────────────────────────
  '--dsw-alias-bg-base': m(L.canvas, D.canvas),
  '--dsw-alias-bg-layer-1': m(L.canvas, D.layer1),
  '--dsw-alias-bg-layer-2': m(L.canvas, D.layer2),
  '--dsw-alias-bg-layer-3': m(L.canvas, D.layer3),
  '--dsw-alias-bg-overlay': m(L.overlay, D.overlay),
  '--dsw-alias-bg-module-platform': m(L.layer2, D.layer1),
  '--dsw-alias-bg-multi-select': m(L.layer2, D.layer2),
  '--dsw-alias-bg-document-preview': m(L.block, D.layer1),
  '--dsw-alias-bg-document-selection': both(ANCHORS.light.selection),
  '--dsw-alias-bg-skeleton': m('#2a2a280d', '#dddddb14'),
  '--dsw-alias-bg-mask-1': m('#2a2a284d', '#00000099'),
  '--dsw-alias-bg-mask-2': m('#2a2a2814', '#00000033'),
  '--dsw-alias-bg-mask-3': m('#2a2a2880', '#00000080'),
  '--dsw-alias-bg-mask-drop': m('#fffffdb3', '#141412b3'),
  '--dsw-alias-bg-mask-photo': both('#000000e0'),

  // ── borders: warm hairlines, and a touch more presence ─────────────
  // Flat surfaces need visible edges to read as separate surfaces; upstream
  // draws those edges instead of using elevation, so the hairlines carry more
  // weight here than in the stock theme.
  '--dsw-alias-border-l1': m('#2a2a2814', '#dddddb1f'),
  '--dsw-alias-border-l2': m('#2a2a2824', '#dddddb2e'),
  '--dsw-alias-border-l2-darkmode-thin': m('#2a2a2824', '#dddddb1f'),
  '--dsw-alias-border-l3': m('#2a2a283b', '#dddddb3d'),
  '--dsw-alias-border-l4': m('#2a2a2852', '#dddddb52'),
  '--dsw-alias-border-inverted': m('#00000000', '#dddddb0a'),
  '--dsw-alias-border-inverted2': m('#00000000', '#dddddb14'),

  // ── interaction ────────────────────────────────────────────────────
  '--dsw-alias-interactive-bg-hover': m('#2a2a2810', '#dddddb17'),
  '--dsw-alias-interactive-bg-active': m('#2a2a281f', '#dddddb26'),
  '--dsw-alias-interactive-bg-hover-accent': m('#2a2a2826', '#dddddb3d'),
  '--dsw-alias-interactive-bg-hover-danger': m('#ee38380d', '#ee383826'),
  '--dsw-alias-interactive-bg-hover-solid': m(L.layer3, D.layer3),

  // ── brand / buttons: ink on paper ──────────────────────────────────
  '--dsw-alias-brand-primary': m(L.ink, D.ink),
  '--dsw-alias-brand-primary-invert': m(L.ink, D.ink),
  '--dsw-alias-brand-primary-new-colorprimary-new-color': m(L.ink, D.ink),
  '--dsw-alias-brand-text': m(L.ink, D.ink),
  '--dsw-alias-button-primary-fill': m(L.ink, D.ink),
  '--dsw-alias-button-primary-hover': m('#3f3f3b', '#f2f2ef'),
  '--dsw-alias-button-primary-dimmed': m(L.layer3, D.layer3),
  '--dsw-alias-button-contrast-fill': m('#4d4d49', D.ink),
  '--dsw-alias-button-info-fill': m(L.ink, D.ink),
  '--dsw-alias-button-info-hover': m('#3f3f3b', '#f2f2ef'),
  '--dsw-alias-button-elevated-fill': m(L.canvas, D.layer2),
  '--dsw-alias-button-floating-fill': m(L.canvas, D.layer3),
  '--dsw-alias-button-floating-hover': m(L.layer3, D.layer2),
  '--dsw-alias-button-ghost-active-fill': m('#e9e9e5', D.layer3),
  '--dsw-alias-button-ghost-active-hover': m('#e2e2de', '#4d4d49'),
  '--dsw-alias-button-ghost-active-border': m('#8c8c88', '#7e7e7b'),
  '--dsw-alias-button-tool-bar-fill': both('#2a2a2880'),
  '--dsw-alias-button-tool-bar-fill-invisible': both('#1f1f1f5c'),
  '--dsw-alias-button-tool-bar-hover': both('#2a2a2899'),
  '--dsw-alias-switch-thumb': m('#fffffd', '#a8a8a4'),

  // ── menus & overlays: solid paper, no glass ────────────────────────
  '--dsw-menu-surface-fill': m('#fffffdfa', '#1b1b19fa'),
  '--dsw-alias-menu-group-header-fill': m('#fffffdf0', '#1b1b19f0'),
  '--dsw-specific-menu': m('#fffffdfa', '#1b1b19fa'),
  '--dsw-specific-selector': m(L.layer2, D.layer2),
  '--dsw-specific-sidebar-fill': m(L.sidebar, D.sidebar),
  '--dsw-specific-sidebar-nav-item-active': m('#e9e9e5', D.layer2),
  '--dsw-specific-sidebar-nav-item-active-accent': m('#e2e2de', D.layer3),
  '--dsw-specific-sidebar-nav-item-hover': m(L.layer3, D.layer1),
  '--dsw-specific-tip': m(L.layer2, D.layer2),
  '--dsw-specific-input-major': m(L.canvas, D.layer2),
  '--dsw-specific-login-input': m(L.layer1, D.layer2),
  '--dsw-specific-bubble': m(L.block, D.layer2),
  '--dsw-specific-bubble-highlight': m('#e5e5e0', '#2a2a26'),
  '--dsw-alias-toast-bg': m(L.ink, D.ink),
  '--dsw-alias-toast-label': m('#fffffd', '#0e0e0c'),
  '--dsw-alias-tooltip-bg': m(L.ink, D.ink),
  '--dsw-alias-tooltip-key-bg': m('#3f3f3b', '#f2f2ef'),
  '--dsw-alias-turn-trigger-bg': m(L.block, D.layer3),
  '--dsw-alias-turn-trigger-bg-hover': m('#e9e9e5', '#323230'),

  // ── markdown / code ────────────────────────────────────────────────
  '--dsw-alias-markdown-code-block': m(L.block, D.block),
  '--dsw-alias-markdown-code-block-banner': m(L.blockBanner, D.blockBanner),
  '--dsw-alias-markdown-code-segment-selected': m(L.canvas, D.layer3),
  '--dsw-alias-markdown-code-segment-unselected': m(L.layer2, D.layer1),
  '--dsw-alias-markdown-inline-code': m(L.block, D.block),
  '--dsw-alias-markdown-citation': m('#e9e9e5', D.layer3),
  '--dsw-alias-markdown-placeholder': m(L.layer2, D.layer2),
  '--dsw-alias-markdown-tag': m(L.layer3, D.layer2),

  // ── diffs ──────────────────────────────────────────────────────────
  '--dsw-alias-code-diff-added': m('#48a13114', '#6fbf5a1f'),
  '--dsw-alias-code-diff-deleted': m('#ee383814', '#f26b6b1f'),
  '--dsw-alias-file-diff-added-bg': m('#eef5ea', '#182117'),
  '--dsw-alias-file-diff-added-gutter': m('#f4f9f1', '#1e2a1c'),
  '--dsw-alias-file-diff-added-marker': m(STATUS.tip, '#6fbf5a'),
  '--dsw-alias-file-diff-deleted-bg': m('#fbeceb', '#251717'),
  '--dsw-alias-file-diff-deleted-gutter': m('#fdf3f2', '#2e1c1c'),
  '--dsw-alias-file-diff-deleted-marker': m(STATUS.caution, '#f26b6b'),

  // ── status ─────────────────────────────────────────────────────────
  '--dsw-alias-state-business-primary': m(L.ink, D.ink),
  '--dsw-alias-state-business-tertiary': m('#eeeeee', D.layer3),
  '--dsw-alias-state-success-primary': m(STATUS.tip, '#6fbf5a'),
  '--dsw-alias-state-success-secondary': both('#6fbf5a'),
  '--dsw-alias-state-success-tertiary': m('#eaf3e6', '#1b241a'),
  '--dsw-alias-state-warn-primary': m(STATUS.warning, '#d9a13a'),
  '--dsw-alias-state-warn-secondary': both('#d9a13a'),
  '--dsw-alias-state-warn-tertiary': m('#fbf1dd', '#2a2213'),
  '--dsw-alias-state-warn-label': m('#a37100', '#d9a13a'),
  '--dsw-alias-state-error-primary': m(STATUS.caution, '#f26b6b'),
  '--dsw-alias-state-error-secondary': both('#f26b6b'),
  '--dsw-alias-state-idle-primary': m('#c2c2bd', '#4d4d49'),

  // ── scrollbars: 5px ink rail, softened from upstream's opaque ink ──
  '--dsw-alias-scrollbar-bg-l1': m('#2a2a2830', '#dddddb30'),
  '--dsw-alias-scrollbar-bg-l2': m('#2a2a2830', '#dddddb30'),
  '--dsw-alias-scrollbar-hover-l1': m('#2a2a2860', '#dddddb60'),
  '--dsw-alias-scrollbar-hover-l2': m('#2a2a2860', '#dddddb60'),

  // ── focus ring: upstream draws it in --shadow-color at 2px/4px offset ─
  '--dsw-focus-ring-color': m(L.secondary, D.secondary),
  '--dsw-focus-ring-width': both('2px'),

  // ── flat elevation ─────────────────────────────────────────────────
  // Upstream raises nothing: separation comes from hairline rules. Level 1 and
  // 2 therefore cast no shadow at all; only true overlays (menus, dialogs)
  // keep upstream's single `shadow-md`.
  '--dsw-shadow-lv1': both('none'),
  '--dsw-shadow-lv1-blur': both('none'),
  '--dsw-shadow-lv2': m('none', 'none'),
  '--dsw-shadow-lv3': m(
    '0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a',
    '0 4px 6px -1px #00000066, 0 2px 4px -2px #00000059',
  ),
  '--dsw-elevation-stroke-color': m('#2a2a2847', '#dddddb52'),
  '--dsw-menu-backdrop-filter': both('none'),
  '--dsw-mask-blur': both('none'),
  '--dsw-linear-gradient-think': m(
    'linear-gradient(180deg, #fffffd 20.19%, #fffffd00 100%)',
    'linear-gradient(180deg, #0e0e0c 20.19%, #0e0e0c00 100%)',
  ),
  '--dsw-linear-think-select': m(
    'linear-gradient(180deg, #fafaf7 20.19%, #fafaf700 100%)',
    'linear-gradient(180deg, #171715 20.19%, #17171500 100%)',
  ),

  // ── radii: upstream is nearly square (5px rail, 0.3em code) ─────────
  // The default harness is 4/8/12/16/20/28 — soft and card-like. Pulling the
  // whole scale down to 2–8px is half of what makes this read as an editorial
  // page rather than a chat app.
  '--dsw-radius-xs': both('2px'),
  '--dsw-radius-sm': both('3px'),
  '--dsw-radius-md': both('4px'),
  '--dsw-radius-lg': both('5px'),
  '--dsw-radius-xl': both('6px'),
  '--dsw-radius-panel': both('8px'),

  // ── type: serif everywhere, Maple Mono for code ─────────────────────
  '--dsh-font-family-text-default': both(SERIF),
  '--dsh-font-family-code-default': both(MONO),
  '--dsw-font-family-brand': both(SERIF),

  // Editorial scale, up from the harness's 21/19/18px headline ladder. Upstream
  // is 36/28/24px on a 17px body; this is that ratio on a 14px body, and it is
  // the single biggest "this is a blog theme" tell in a conversation.
  '--dsw-font-markdown-h1': both(
    '700 calc(30px + var(--dsh-content-font-delta)) / calc(40px + var(--dsh-content-font-delta)) var(--dsw-font-family)',
  ),
  '--dsw-font-markdown-h2': both(
    '700 calc(24px + var(--dsh-content-font-delta)) / calc(34px + var(--dsh-content-font-delta)) var(--dsw-font-family)',
  ),
  '--dsw-font-markdown-h3': both(
    '700 calc(20px + var(--dsh-content-font-delta)) / calc(30px + var(--dsh-content-font-delta)) var(--dsw-font-family)',
  ),
  '--dsw-font-markdown-h4': both(
    '700 calc(17px + var(--dsh-content-font-delta)) / calc(28px + var(--dsh-content-font-delta)) var(--dsw-font-family)',
  ),
  '--dsw-font-markdown-h1-font-size': both('calc(30px + var(--dsh-content-font-delta))'),
  '--dsw-font-markdown-h2-font-size': both('calc(24px + var(--dsh-content-font-delta))'),
  '--dsw-font-markdown-h3-font-size': both('calc(20px + var(--dsh-content-font-delta))'),
  '--dsw-font-markdown-h4-font-size': both('calc(17px + var(--dsh-content-font-delta))'),
  '--dsw-font-markdown-h1-line-height': both('calc(40px + var(--dsh-content-font-delta))'),
  '--dsw-font-markdown-h2-line-height': both('calc(34px + var(--dsh-content-font-delta))'),
  '--dsw-font-markdown-h3-line-height': both('calc(30px + var(--dsh-content-font-delta))'),
  '--dsw-font-markdown-h4-line-height': both('calc(28px + var(--dsh-content-font-delta))'),
  '--dsw-font-markdown-base-line-height': both('calc(25px + var(--dsh-content-font-delta))'),
  '--dsw-font-markdown-base': both(
    'var(--dsh-content-font-size,14px) / calc(25px + var(--dsh-content-font-delta)) var(--dsw-font-family)',
  ),

  '--dsw-font-markdown-base-font-family': serif,
  '--dsw-font-markdown-base-strong-font-family': serif,
  '--dsw-font-markdown-base-italic-font-family': serif,
  '--dsw-font-markdown-base-strong-italic-font-family': serif,
  '--dsw-font-markdown-h1-font-family': serif,
  '--dsw-font-markdown-h2-font-family': serif,
  '--dsw-font-markdown-h3-font-family': serif,
  '--dsw-font-markdown-h4-font-family': serif,
  '--dsw-font-markdown-small-font-family': serif,
  '--dsw-font-markdown-small-italic-font-family': serif,
  '--dsw-font-markdown-small-strong-font-family': serif,
  '--dsw-font-markdown-small-strong-italic-font-family': serif,
  '--dsw-font-markdown-table-font-family': serif,
  '--dsw-font-markdown-table-head-font-family': serif,
  '--dsw-font-markdown-code-font-family': both(MONO),
  '--dsw-font-markdown-code-block-font-family': both(MONO),
  '--dsw-font-markdown-code-block-small-font-family': both(MONO),
  '--ds-font-family-code': both(MONO),

  // ── scrollbar geometry ──────────────────────────────────────────────
  '--dsh-scrollbar-width': both('5px'),
  '--dsh-scrollbar-thumb-border': both('0px'),
  '--dsh-scrollbar-track-margin': both('0px'),

  // ── syntax colours: upstream configures Shiki github-light / dark-plus ─
  '--shiki-foreground': m('#24292f', '#d4d4d4'),
  '--shiki-background': m(L.block, D.block),
  '--shiki-token-constant': m('#005cc5', '#b5cea8'),
  '--shiki-token-string': m('#032f62', '#ce9178'),
  '--shiki-token-comment': m('#6e7781', '#6a9955'),
  '--shiki-token-keyword': m('#d73a49', '#569cd6'),
  '--shiki-token-parameter': m('#953800', '#9cdcfe'),
  '--shiki-token-function': m('#6f42c1', '#dcdcaa'),
  '--shiki-token-string-expression': m('#0a3069', '#ce9178'),
  '--shiki-token-punctuation': m('#24292f', '#d4d4d4'),
  '--shiki-token-link': m('#032f62', '#4ec9b0'),
};

/** Rule-set that tokens cannot express. Scoped to the app, never to a component. */
export const STYLES = `/* ── ThoughtLite skin: signature rules ─────────────────────────────
   Only decoration lives here. Every colour above is a token override, so the
   rules below survive Appearance changes and cannot fight user font settings. */

/* Upstream paints selections in a translucent grey in BOTH modes. */
::selection {
  background-color: #adadacc3;
}

/* The skin lives on the reading surface: the markdown root is the one stable
   hook DSH exposes (CSS-module class _markdown_<hash>). */
[class*="_markdown_"] {
  text-wrap: pretty;
}

/* h1/h2 are the only headings that carry weight in upstream: a rule under. */
[class*="_markdown_"] h1 {
  border-bottom: 4px solid currentColor;
  padding-bottom: 0.15em;
}
[class*="_markdown_"] h2 {
  border-bottom: 2px solid currentColor;
  padding-bottom: 0.1em;
}

/* Links inherit ink and carry a resting underline; hovering darkens it to the
   full ink (upstream reveals it on hover, but a GUI needs link affordance that
   survives a glance — see README §偏差). */
[class*="_markdown_"] a {
  color: var(--dsw-alias-label-primary);
  font-weight: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, currentColor 32%, transparent);
  text-decoration-thickness: 0.05em;
  text-underline-offset: 0.15em;
  transition: text-decoration-color 0.15s ease-in-out;
}
[class*="_markdown_"] a:hover,
[class*="_markdown_"] a:focus {
  text-decoration-color: currentColor !important;
  text-decoration-style: solid;
}

/* Horizontal rule: hairline dashed in the divider grey. */
[class*="_markdown_"] hr {
  height: 0;
  background: none;
  border: 0;
  border-bottom: 1px dashed var(--dsw-alias-label-secondary);
  margin: 28px 0;
}

/* Blockquote: a 4px --shadow-color bar, no fill, no italics. */
[class*="_markdown_"] blockquote {
  border-left: 4px solid var(--dsw-alias-border-l4);
  padding-left: 1em;
  color: var(--dsw-alias-label-secondary);
  font-style: normal;
}

/* Lists: upstream's 1.2em indent, muted markers. */
[class*="_markdown_"] :where(ul, ol) {
  padding-left: 1.2em;
}
[class*="_markdown_"] li::marker {
  color: var(--dsw-alias-label-secondary);
}

/* Inline code: the block fill, 0.3em corners, .25em/.5em padding. */
[class*="_markdown_"] :not(pre) > code {
  background-color: var(--dsw-alias-markdown-inline-code);
  border-radius: 0.3em;
  padding: 0.25em 0.5em;
  font-size: 0.85em !important;
  font-weight: inherit;
}

/* Fenced blocks: upstream's 0.3em corners and a hairline, not a floating card. */
[class*="_markdown_"] pre {
  border-radius: 0.3em;
}
[class*="_markdown_"] .md-code-block {
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-sm);
}

/* Booktabs tables: 3px rules top and bottom, 2px under the header. */
[class*="_markdown_"] table {
  border-collapse: collapse;
  border-top: 3px solid var(--dsw-alias-label-primary);
  border-bottom: 3px solid var(--dsw-alias-label-primary);
}
[class*="_markdown_"] thead th {
  border-bottom: 2px solid var(--dsw-alias-label-primary) !important;
}
[class*="_markdown_"] :where(th, td) {
  padding: 5px 10px;
}

/* Highlight: a wavy underline instead of a marker fill. */
[class*="_markdown_"] mark {
  color: inherit;
  background: none;
  text-decoration: underline wavy 0.05em;
  text-underline-offset: 0.1em;
}

/* Upstream body metrics: 1.75 leading on the reading surface. */
[class*="_markdown_"] :where(p, li, blockquote) {
  line-height: 1.75;
}

/* Headings get the upstream breathing room (the harness uses fixed margins). */
[class*="_markdown_"] h1 {
  margin-top: 8px;
  margin-bottom: 18px;
}
[class*="_markdown_"] h2 {
  margin-top: 30px;
  margin-bottom: 14px;
}
[class*="_markdown_"] h3 {
  margin-top: 26px;
  margin-bottom: 10px;
}

/* ── structural signature ─────────────────────────────────────────────
   These three rules are what make the app stop looking like a chat client.
   Hooks are the CSS-module local-name suffixes DSH ships (a leading hash plus
   the local name), so an attribute-contains selector stays stable across
   rebuilds; every hook used here is declared in fixtures/dsh-css-modules.json
   and checked by test/verify.mjs. */

/* Sidebar masthead: hairline under the logo row, like a blog header rule. */
[class*="_logoRow"] {
  border-bottom: 1px solid var(--dsw-alias-border-l2);
  padding-bottom: 10px;
}

/* Sidebar entries read as a ruled list, not rounded pills. */
[class*="_panelRow"] {
  border-radius: 2px;
}
[class*="_panelRow"] + [class*="_panelRow"] {
  border-top: 1px solid var(--dsw-alias-border-l1);
}

/* The user's own turn: no chat bubble. A flat block with an ink rail on the
   left, which is how an editorial page marks a quotation. */
[class*="_bubble"] {
  background: transparent !important;
  border: 1px solid var(--dsw-alias-border-l2);
  border-left: 3px solid var(--dsw-alias-label-primary);
  border-radius: 2px !important;
  padding: 10px 14px;
}

/* Composer: a form field, not a floating card. */
[class*="_composerStack"] [class*="_input"] {
  border-radius: 2px !important;
}
`;
