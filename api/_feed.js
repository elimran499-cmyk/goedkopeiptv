/**
 * The customers' own ratings, from the rating page they are sent to after a
 * purchase (customers-reviews.online). That page stores them with MTR Payment,
 * which returns the overall score and the reviews the owner chose to show.
 *
 * Shared by the `/api/reviews` function (live, for the browser: the feed sends
 * no CORS header, so the page cannot read it directly) and by
 * `scripts/fetch-reviews.mjs` (a snapshot baked into the build, so the section
 * is never empty and the prerendered HTML carries the reviews).
 *
 * The underscore keeps Vercel from serving this file as a function of its own.
 */
const FEED = 'https://payment-support-eta.vercel.app/api/review';

/**
 * Every brand sends its customers to the same rating page, so a comment can
 * name another one ("weer een abonnement bij aneetv"). Those are left out here:
 * a word glued to "tv" or "iptv" that is not ours or a device.
 */
const BRAND_WORD = /\b[a-z]{3,}(?:iptv|tv)\b/gi;
const NOT_A_BRAND = new Set(['goedkope', 'goedkoop', 'smart', 'apple', 'android', 'google', 'fire', 'web', 'live']);
const namesAnotherBrand = (text) =>
  (text.match(BRAND_WORD) || []).some((word) => !NOT_A_BRAND.has(word.toLowerCase().replace(/(iptv|tv)$/, '')));

/**
 * The rating page asks for "your name or WhatsApp number": a number is never
 * shown, and a name is cut to the first word.
 */
const firstName = (name) => {
  const s = String(name || '').trim();
  if (!s || /\d/.test(s)) return '';
  return s.split(/\s+/)[0].slice(0, 24);
};

export function cleanFeed(raw) {
  const reviews = (Array.isArray(raw?.reviews) ? raw.reviews : [])
    .filter((r) => r && Number(r.stars) >= 1 && Number(r.stars) <= 5)
    .filter((r) => !namesAnotherBrand(String(r.comment || '')))
    .map((r) => ({
      stars: Math.round(Number(r.stars)),
      comment: String(r.comment || '').trim().slice(0, 420),
      name: firstName(r.name),
      at: Number(r.at) || 0,
      photo: /^https:\/\//.test(String(r.photo || '')) ? String(r.photo) : '',
    }));
  const average = typeof raw?.average === 'number' && raw.average > 0 ? Math.round(raw.average * 10) / 10 : null;
  return { average, total: Number(raw?.total) || reviews.length, reviews };
}

/** The cleaned feed, or null when the feed cannot be reached. */
export async function loadFeed(timeoutMs = 6000) {
  try {
    const r = await fetch(FEED, { signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return null;
    return cleanFeed(await r.json());
  } catch {
    return null;
  }
}
