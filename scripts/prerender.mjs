/**
 * Writes the rendered markup into dist/index.html.
 *
 * Vite ships an empty `<div id="root"></div>` — every word on the page only
 * exists once React runs in the browser. Googlebot does execute JavaScript, but
 * in a second, delayed wave; Bing, the social link-preview crawlers and the AI
 * crawlers do not do it at all. This page has no per-visitor data, so the result
 * is identical for everyone and can be produced once at build time.
 *
 * No framework change and no server: the output stays a static file that Vercel
 * serves exactly as before. The client still calls createRoot rather than
 * hydrateRoot, so React simply replaces this markup on load — the prerender is
 * there for crawlers, and cannot produce a hydration mismatch.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const file = path.resolve('dist/index.html');
const html = fs.readFileSync(file, 'utf8');

const ANCHOR = '<div id="root"></div>';
if (!html.includes(ANCHOR)) {
  throw new Error(`Anchor ${ANCHOR} not found in dist/index.html — prerender aborted.`);
}

const { render } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href);
// React's server renderer adds a <link rel="preload" as="image"> for every
// image it renders without loading="lazy" — over fifty channel logos, posters
// and avatars here, all fetched before anything else on the page. The browser
// replaces this markup on load anyway, so for crawlers and the first paint they
// only cost speed: they are taken out.
const markup = (await render()).replace(/<link rel="preload" as="image"[^>]*\/?>/g, '');

// An empty render means the crawler would still get a blank page; failing here
// keeps a silently broken build from shipping.
if (markup.trim().length === 0) {
  throw new Error('Prerender produced no markup — refusing to write an empty page.');
}

fs.writeFileSync(file, html.replace(ANCHOR, `<div id="root">${markup}</div>`), 'utf8');

const words = markup.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
console.log(`  prerender: ${markup.length} chars of markup, ~${words} words in dist/index.html`);
