/**
 * Host loader entry for the browser-only ThoughtLite skin.
 *
 * The skin is pure presentation: it registers no model-facing behaviour, no
 * tools, no settings and no host services. The whole implementation is the
 * browser half (`lib/client.js`), which stacks a `ctx.theme.overrideTokens`
 * layer plus one stylesheet onto whichever built-in palette is active.
 *
 * @module dsh-theme-thought-lite
 */

/** Provides no host-side behaviour. */
export function apply() {}
