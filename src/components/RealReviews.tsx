import { Fragment } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { CustomerReview, RATE_URL, useCustomerReviews } from "../data/customerReviews";

/**
 * Customer reviews, all of them real: the score and the reviews come from the
 * rating page every customer is sent to after an order (customers-reviews.online).
 * This replaces an earlier block of invented reviews (stock-photo faces,
 * "Verified" badges, "2.400+ reviews"), which Dutch consumer law treats as fake
 * reviews and which customers and Google learn to distrust.
 */

/** Avatar colours in turn, all readable on the site's dark cards. */
const AVATARS = ["bg-[#E0345F] text-[#FFFFFF]", "bg-[#FF8FAE] text-[#1A0A10]", "bg-[#B3264A] text-[#FFFFFF]", "bg-[#FFD1DC] text-[#1A0A10]"];

const Card = ({ review, index }: { review: CustomerReview; index: number }) => {
  const name = review.name || "GoedkopeIPTV-klant";
  const date = review.at
    ? new Date(review.at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
    : "";
  return (
    <figure className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-0.5" aria-label={`${review.stars} van 5 sterren`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-4 h-4 ${i <= review.stars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
        ))}
      </div>
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">“{review.comment}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${AVATARS[index % AVATARS.length]}`}>
          {(review.name || "G")[0].toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-slate-900">{name}</span>
          {date && <span className="block text-xs text-slate-400">{date}</span>}
        </span>
      </figcaption>
    </figure>
  );
};

export default function RealReviews() {
  const { average, reviews } = useCustomerReviews();
  const shown = reviews.filter((r) => r.comment).slice(0, 6);
  const score = average ? average.toFixed(1).replace(".", ",") : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs text-[#E0345F] font-extrabold uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/10 font-roboto-slab">
          Klantreviews
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Wat onze klanten zeggen</h2>
        <p className="text-sm text-slate-500">Echte beoordelingen, gegeven op onze beoordelingspagina na een bestelling.</p>
        {score && (
          <div className="flex items-center justify-center gap-1 pt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm font-bold text-slate-700 ml-2">{score} gemiddelde score</span>
          </div>
        )}
      </div>

      {shown.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((review, i) => (
            <Fragment key={i}>
              <Card review={review} index={i} />
            </Fragment>
          ))}
        </div>
      )}

      {/* The ask: the next customer adds their own stars. */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E0345F]/20 bg-gradient-to-r from-[#0E0E10] to-[#1A0A10] p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-black text-white">Klant bij ons? Geef je sterren</p>
          <p className="mt-1 text-sm text-white/60">Duurt vijf seconden en helpt andere kijkers kiezen.</p>
        </div>
        <a
          href={RATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#E0345F] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#c92a52] active:scale-95"
        >
          <Star className="w-4 h-4 fill-white" strokeWidth={0} />
          Beoordeel ons
        </a>
      </div>
    </motion.div>
  );
}
