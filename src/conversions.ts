/* Conversion tracking for the two actions that matter on this site: a click
 * through to WhatsApp, and a click on an order CTA.
 *
 * Every event goes to two places:
 *
 *   1. Google Ads, so smart bidding keeps optimising against real conversions.
 *   2. The SiteHub collector, a first-party endpoint whose counts the admin
 *      dashboard reads directly. Ads will not hand its numbers back to an
 *      arbitrary web page, so anything we want to see in the dashboard has to
 *      be counted by us as well.
 *
 * The two are independent: if the Ads label is missing or gtag is blocked by an
 * ad blocker, the collector still records the click, and vice versa.
 *
 * The gtag stub and the account config live in index.html; this module only
 * fires events against them.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** The single Google Ads account every landing page reports to. */
export const GOOGLE_ADS_ID = 'AW-18345460239';

/**
 * Conversion labels, the half of send_to that names the action.
 *
 * `whatsapp` is the live "WhatsApp click" action. `order` is not created yet:
 * make the action in Google Ads → Goals → Conversions → New conversion action →
 * Website, then paste the label here. An empty label is treated as "not
 * configured" — nothing is sent to Ads, because a malformed send_to is silently
 * discarded by Google and would look like zero conversions rather than a setup
 * mistake. The collector still counts the click either way.
 */
const LABELS: Record<ConversionKind, string> = {
  whatsapp: 'ji0xCK_G3-AcEI-E5qtE',
  order: '',
};

/**
 * The first-party collector. Point this at the deployed sitehub-collector, e.g.
 * 'https://sitehub-collector.vercel.app/api/track'. Empty disables the beacon
 * and leaves Google Ads as the only destination.
 */
const COLLECTOR_URL = 'https://sitehub-collector.vercel.app/api/track';

export type ConversionKind = 'whatsapp' | 'order';

/** Everything the collector counts. Views and links are page-level, not clicks. */
type BeaconEvent = ConversionKind | 'view' | 'link';

/** Matches every WhatsApp deep link, however the CTA was built. */
const WHATSAPP_HREF = 'a[href*="wa.me/"], a[href*="api.whatsapp.com"]';

/**
 * Marks a CTA as an order rather than a general enquiry. Put it on the anchor
 * or any ancestor of it — pricing buttons, order-modal confirms, "Bestel nu".
 */
const ORDER_MARKER = '[data-cta="order"]';

const warned = new Set<ConversionKind>();

function warnUnconfigured(kind: ConversionKind): void {
  if (warned.has(kind)) return;
  warned.add(kind);
  console.warn(
    `[conversions] No Google Ads label set for "${kind}" — the click was not ` +
      `sent to Ads. Create the conversion action in Google Ads and paste its ` +
      `label into LABELS.${kind} in src/conversions.ts.`
  );
}

/**
 * Sends one event to the collector.
 *
 * sendBeacon survives the page unloading, which a normal fetch does not: these
 * CTAs navigate away, and the request has to outlive the click. The body is
 * text/plain so the request stays "simple" under CORS and skips the preflight
 * that would otherwise never complete in time.
 */
function beacon(event: BeaconEvent): void {
  if (!COLLECTOR_URL || typeof navigator === 'undefined') return;
  try {
    const body = JSON.stringify({ site: location.hostname, event });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(COLLECTOR_URL, new Blob([body], { type: 'text/plain' }));
    } else {
      // Older Safari: keepalive gets the request out during unload.
      void fetch(COLLECTOR_URL, { method: 'POST', body, keepalive: true, mode: 'no-cors' });
    }
  } catch {
    // Counting must never break a CTA.
  }
}

/** Sends one conversion to Google Ads. No-ops when the label is unset. */
function fireAds(kind: ConversionKind): void {
  const label = LABELS[kind];
  if (!label) {
    warnUnconfigured(kind);
    return;
  }
  window.gtag?.('event', 'conversion', { send_to: `${GOOGLE_ADS_ID}/${label}` });
}

/** When the last click was counted, so the same action is never counted twice. */
let lastRecordedAt = 0;

function record(kind: ConversionKind): void {
  lastRecordedAt = Date.now();
  fireAds(kind);
  beacon(kind);
}

/** A URL that opens a WhatsApp chat, however it was written. */
const WHATSAPP_URL = /(?:\/\/)(?:wa\.me\/|api\.whatsapp\.com\/|web\.whatsapp\.com\/send)|^whatsapp:/i;

/** How long after a counted click a WhatsApp window belongs to that click. */
const SAME_ACTION_MS = 1500;

/**
 * Counts an order click directly.
 *
 * For CTAs that are not anchors — an order modal that calls window.open, or a
 * button that builds the WhatsApp URL in its handler — the delegated listener
 * below has no href to recognise, so call this from the handler instead.
 */
export function trackOrderClick(): void {
  record('order');
}

/** Counts a WhatsApp click directly, for the same non-anchor cases. */
export function trackWhatsAppClick(): void {
  record('whatsapp');
}

/** Real browser, not a crawler, a prerender pass, or an embedded preview. */
function isRealVisitor(): boolean {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') return false;
  if (navigator.webdriver) return false;

  // Framed loads are not visits. The SiteHub dashboard embeds every live site
  // to show its home page on the card, and without this each dashboard refresh
  // counted as a page view and an inbound link click on all of them — the
  // monitoring tool inflating the numbers it was built to report.
  try {
    if (window.self !== window.top) return false;
  } catch {
    // Cross-origin access throws, which itself means we are framed.
    return false;
  }

  return !/bot|crawler|spider|headless|lighthouse|preview/i.test(navigator.userAgent);
}

/** One page view, plus an inbound-link count when the visitor came from elsewhere. */
function recordPageView(): void {
  if (!isRealVisitor()) return;
  beacon('view');

  // An arrival with an off-site referrer is somebody having clicked a link to
  // this site — from Google, an ad, or a shared message. Internal navigation
  // and direct entry are views but not link clicks.
  try {
    const ref = document.referrer;
    if (ref && new URL(ref).hostname !== location.hostname) beacon('link');
  } catch {
    // A malformed referrer is not worth reporting.
  }
}

/**
 * Counts every WhatsApp and order CTA on the page, plus the page view itself.
 * Returns its own teardown.
 *
 * The click handling is delegated from the document rather than bolted onto
 * each anchor: the CTAs are spread over most of the component tree, and a new
 * one should be counted because it points at WhatsApp or carries
 * data-cta="order", not because someone remembered to wire up an onClick.
 *
 * Capture phase, so a handler that stops propagation cannot silently cost us
 * the conversion. 'auxclick' rides along because a middle-click opens the chat
 * just as well as a left-click but never fires 'click'.
 */
export function trackConversions(): () => void {
  if (typeof document === 'undefined') return () => {};

  recordPageView();

  const onClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const marked = target.closest(ORDER_MARKER);
    const whatsapp = target.closest(WHATSAPP_HREF);
    if (!marked && !whatsapp) return;

    // An order CTA that happens to be a WhatsApp link counts once, as an order.
    record(marked ? 'order' : 'whatsapp');
  };

  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true);

  // Many CTAs are buttons whose handler calls window.open('https://wa.me/...')
  // instead of being a link, so the click listener above has no href to see
  // and those chats were never counted. Opening WhatsApp from code counts too,
  // unless a click was counted a moment ago: that is the same action.
  const originalOpen = window.open;
  window.open = function (url?: string | URL, target?: string, features?: string) {
    try {
      if (url && WHATSAPP_URL.test(String(url)) && Date.now() - lastRecordedAt > SAME_ACTION_MS) {
        record('whatsapp');
      }
    } catch {
      // Counting must never stop the chat from opening.
    }
    return originalOpen.call(window, url, target, features);
  };

  return () => {
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('auxclick', onClick, true);
    window.open = originalOpen;
  };
}
