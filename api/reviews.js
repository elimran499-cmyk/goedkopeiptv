/**
 * GET /api/reviews — the customers' ratings for the reviews section, read live
 * from the rating page's store (see `_feed.js`). Cached at the edge for ten
 * minutes, so a new review shows up soon without every visit hitting the feed.
 */
import { loadFeed } from './_feed.js';

export default async function handler(req, res) {
  const feed = await loadFeed();
  if (!feed) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'feed unavailable' });
  }
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  return res.status(200).json(feed);
}
