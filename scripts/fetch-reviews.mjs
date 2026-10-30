/**
 * Bakes the customers' ratings into the build (src/data/customerReviews.snapshot.ts),
 * so the reviews section has real content before the live feed answers, and the
 * prerendered pages carry it. When the feed cannot be reached the last snapshot
 * stays as it is and the build carries on.
 *
 * Run by `npm run build`, before `vite build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFeed } from '../api/_feed.js';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data/customerReviews.snapshot.ts');

const feed = await loadFeed(10000);
if (!feed) {
  console.warn('fetch-reviews: feed unreachable, keeping the last snapshot');
} else {
  fs.writeFileSync(
    OUT,
    `// Written by scripts/fetch-reviews.mjs at build time — do not edit by hand.\n` +
      `import type { ReviewFeed } from './customerReviews';\n\n` +
      `export const SNAPSHOT: ReviewFeed = ${JSON.stringify(feed, null, 2)};\n`
  );
  console.log(`fetch-reviews: ${feed.reviews.length} reviews, average ${feed.average ?? '-'} of ${feed.total}`);
}
