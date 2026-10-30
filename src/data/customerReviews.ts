import { useEffect, useState } from "react";
import { SNAPSHOT } from "./customerReviews.snapshot";

/**
 * What customers say, from the rating page every customer is sent to
 * (customers-reviews.online). The build bakes a snapshot in; on the page the
 * live list replaces it as soon as `/api/reviews` answers, so a new review
 * appears without a rebuild.
 */
export interface CustomerReview {
  stars: number;
  comment: string;
  /** First name, or empty when the customer left none. */
  name: string;
  /** When it was given, in ms since 1970. */
  at: number;
  photo: string;
}

export interface ReviewFeed {
  /** The overall score over every rating given, not only the ones shown. */
  average: number | null;
  total: number;
  reviews: CustomerReview[];
}

/** Where a customer goes to give their stars, in Dutch. */
export const RATE_URL = "https://customers-reviews.online/?l=nl";

let live: Promise<ReviewFeed | null> | null = null;
const loadLive = () =>
  (live ??= fetch("/api/reviews")
    .then((r) => (r.ok ? (r.json() as Promise<ReviewFeed>) : null))
    .catch(() => null));

/** The snapshot first, then the live feed once it arrives. One request per page load. */
export const useCustomerReviews = (): ReviewFeed => {
  const [feed, setFeed] = useState<ReviewFeed>(SNAPSHOT);
  useEffect(() => {
    let on = true;
    loadLive().then((f) => {
      if (on && f && Array.isArray(f.reviews)) setFeed(f);
    });
    return () => {
      on = false;
    };
  }, []);
  return feed;
};
