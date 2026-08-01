import { useState, useEffect, useRef } from "react";
import {
  IPTVChannel, MovieOrSeries, PlaylistItem, PaymentMethod,
  BillingInvoice, Episode
} from "./types";
import {
  MOCK_CHANNELS, MOCK_MOVIES_AND_SERIES, MOCK_PLAYLISTS,
  INITIAL_PAYMENT_METHODS, INITIAL_INVOICES
} from "./data/mockData";
import Navigation from "./components/Navigation";
import MediaPlayer from "./components/MediaPlayer";
import Dashboard from "./components/Dashboard";
import Catalog from "./components/Catalog";
import Billing from "./components/Billing";
import HomeLanding from "./components/HomeLanding";
import Support from "./components/Support";
import { Wordmark } from "./components/Logo";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false); // unused but kept for scroll handler
  const [showRetention, setShowRetention] = useState(false);
  const exitFired = useRef(false);

  useEffect(() => {
    history.pushState(null, "", window.location.href);
    const onPop = () => { history.pushState(null, "", window.location.href); setShowRetention(true); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 500);
      setShowBackToTop(window.scrollY > 400);
      const el = document.documentElement;
      const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 10 && !exitFired.current && activeTab === "home") {
        exitFired.current = true;
        setShowExitPopup(true);
      }
    };
    document.addEventListener("mouseleave", onMouseOut);
    return () => document.removeEventListener("mouseleave", onMouseOut);
  }, [activeTab]);

  const [livetvSubTab, setLivetvSubTab] = useState<"player" | "sync">("player");
  const [currentPlanId, setCurrentPlanId] = useState<string>("plan-premium");
  const [userStatus, setUserStatus] = useState<string>("Active");

  const [playlists, setPlaylists] = useState<PlaylistItem[]>(() => {
    const saved = localStorage.getItem("streamvibe_playlists");
    return saved ? JSON.parse(saved) : MOCK_PLAYLISTS;
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem("streamvibe_pay_methods");
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => {
    const saved = localStorage.getItem("streamvibe_invoices");
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [favoriteChannels, setFavoriteChannels] = useState<string[]>(() => {
    const saved = localStorage.getItem("streamvibe_favorites");
    return saved ? JSON.parse(saved) : ["ch-1", "ch-3", "ch-5"];
  });

  const [channels, setChannels] = useState<IPTVChannel[]>(MOCK_CHANNELS);
  const [playerActiveChannel, setPlayerActiveChannel] = useState<IPTVChannel | null>(null);
  const [playerActiveMovie, setPlayerActiveMovie] = useState<MovieOrSeries | null>(null);
  const [playerActiveEpisode, setPlayerActiveEpisode] = useState<Episode | null>(null);

  useEffect(() => { localStorage.setItem("streamvibe_playlists", JSON.stringify(playlists)); }, [playlists]);
  useEffect(() => { localStorage.setItem("streamvibe_pay_methods", JSON.stringify(paymentMethods)); }, [paymentMethods]);
  useEffect(() => { localStorage.setItem("streamvibe_invoices", JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem("streamvibe_favorites", JSON.stringify(favoriteChannels)); }, [favoriteChannels]);

  const getUserPlanName = () => {
    if (currentPlanId === "plan-starter") return "Starter Play";
    if (currentPlanId === "plan-premium") return "Sleek Premium";
    return "Ultimate Elite";
  };

  const handleAddPlaylist = (name: string, url: string) => {
    const newId = `pl-${Date.now()}`;
    const newChannelsCount = Math.floor(Math.random() * 5000) + 2500;
    const newPlaylist: PlaylistItem = { id: newId, name, url, channelsCount: newChannelsCount, activeSince: new Date().toISOString().split("T")[0], status: "active" };
    setPlaylists([newPlaylist, ...playlists]);
    const randomLogos = ["⚽", "🎥", "🌍", "🍿", "🎼", "📡", "🛸"];
    const randomCategories = ["Sports", "News", "Movies", "Documentaries", "Entertainment"];
    const appendedChannels: IPTVChannel[] = Array.from({ length: 3 }).map((_, idx) => {
      const chId = `ch-appended-${Date.now()}-${idx}`;
      const chCat = randomCategories[Math.floor(Math.random() * randomCategories.length)];
      return { id: chId, name: `${name} Stream-${idx + 1}`, logo: randomLogos[Math.floor(Math.random() * randomLogos.length)], streamUrl: MOCK_CHANNELS[Math.floor(Math.random() * MOCK_CHANNELS.length)].streamUrl, category: chCat, status: "online", viewers: Math.floor(Math.random() * 8000) + 1200, resolution: idx % 2 === 0 ? "4K" : "FHD", language: "Multilingual" };
    });
    setChannels((prev) => [...prev, ...appendedChannels]);
  };

  const handleDeletePlaylist = (id: string) => { setPlaylists(playlists.filter((pl) => pl.id !== id)); };
  const handleAddPaymentMethod = (pm: PaymentMethod) => { setPaymentMethods([...paymentMethods, pm]); };
  const handleDeletePaymentMethod = (id: string) => { setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id)); };
  const handleSetDefaultPaymentMethod = (id: string) => { setPaymentMethods(paymentMethods.map((pm) => ({ ...pm, isDefault: pm.id === id }))); };
  const handleAddNewInvoice = (inv: BillingInvoice) => { setInvoices([inv, ...invoices]); };
  const handleToggleFavorite = (channelId: string) => { setFavoriteChannels((prev) => prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]); };

  const handlePlayMedia = (media: MovieOrSeries | IPTVChannel, episode?: Episode) => {
    if ("type" in media) {
      setPlayerActiveMovie(media);
      setPlayerActiveChannel(null);
      setPlayerActiveEpisode(episode || null);
    } else {
      setPlayerActiveChannel(media);
      setPlayerActiveMovie(null);
      setPlayerActiveEpisode(null);
    }
    setActiveTab("livetv");
    setLivetvSubTab("player");
  };

  const totalChannelsCount = playlists.reduce((acc, pl) => acc + pl.channelsCount, 0);

  return (
    <div id="streamvibe-root" className="min-h-screen text-slate-950">
      {/* Scroll progress bar */}
      <div className="fixed top-0 inset-x-0 z-[60] h-0.5 bg-transparent pointer-events-none">
        <div className="h-full bg-[#E0345F] transition-all duration-100" style={{ width: `${scrollProgress}%` }} />
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} userPlan={getUserPlanName()} userStatus={userStatus} />
      <main id="main-content" className="flex-1 pt-24 px-3 sm:px-4 md:px-8 lg:px-10 overflow-x-hidden">
        <div className="max-w-6xl mx-auto pt-8 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25, ease: "easeOut" }} className="w-full">
            {activeTab === "home" && (<HomeLanding moviesAndSeries={MOCK_MOVIES_AND_SERIES} onPlayMedia={handlePlayMedia} onSelectTab={setActiveTab} onUpdatePlan={setCurrentPlanId} />)}
            {activeTab === "movies" && (<Catalog moviesAndSeries={MOCK_MOVIES_AND_SERIES} onPlayMedia={handlePlayMedia} />)}
            {activeTab === "livetv" && (
              <div className="space-y-6">
                <div className="flex glass-card p-1 rounded-2xl max-w-sm">
                  <button onClick={() => setLivetvSubTab("player")} className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black tracking-wide transition cursor-pointer ${livetvSubTab === "player" ? "bg-[#E0345F] text-white shadow-md" : "text-slate-700 hover:text-slate-950"}`}>Live Channels Player</button>
                  <button onClick={() => setLivetvSubTab("sync")} className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black tracking-wide transition cursor-pointer ${livetvSubTab === "sync" ? "bg-[#E0345F] text-white shadow-md" : "text-slate-700 hover:text-slate-950"}`}>Provider Sync & Metrics</button>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={livetvSubTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}>
                    {livetvSubTab === "player" ? (
                      <MediaPlayer initialActiveChannel={playerActiveChannel || channels[0]} initialActiveMovie={playerActiveMovie} initialActiveEpisode={playerActiveEpisode} channels={channels} onToggleFavorite={handleToggleFavorite} favoriteChannels={favoriteChannels} />
                    ) : (
                      <Dashboard playlists={playlists} onAddPlaylist={handleAddPlaylist} onDeletePlaylist={handleDeletePlaylist} totalChannelsCount={totalChannelsCount} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
            {activeTab === "support" && (<Support />)}
            {activeTab === "subscription" && (<Billing currentPlanId={currentPlanId} onUpdatePlan={setCurrentPlanId} paymentMethods={paymentMethods} onAddPaymentMethod={handleAddPaymentMethod} onDeletePaymentMethod={handleDeletePaymentMethod} onSetDefaultPaymentMethod={handleSetDefaultPaymentMethod} invoices={invoices} onAddNewInvoice={handleAddNewInvoice} />)}
          </motion.div>
        </AnimatePresence>
        </div>
      </main>

      {/* Sticky CTA bar */}
      <AnimatePresence>
        {showStickyBar && activeTab === "home" && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-md px-4 py-2.5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Wordmark className="text-xs text-slate-900 hidden sm:block" showTld={false} />
              <span className="text-xs text-slate-500 hidden md:block">20.000+ zenders · 4K Ultra HD · Binnen 5 min actief</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#E0345F]">v.a. €24,99 eenmalig</span>
              <a
                href="https://wa.me/447832486269?text=Hallo%2C%20ik%20wil%20graag%20een%20IPTV%20pakket%20bestellen."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20b859] text-white text-xs font-black px-4 py-2 rounded-xl transition active:scale-95"
              >
                <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
                Bestel nu
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* EXIT-INTENT POPUP */}
      <AnimatePresence>
        {showExitPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowExitPopup(false)}>
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#1A0A10] to-[#2B0F1A] px-7 pt-7 pb-5 text-center space-y-2 relative">
                <button onClick={() => setShowExitPopup(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer leading-none">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div className="flex justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#E0345F]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    <circle cx="18" cy="5" r="3" className="fill-[#E0345F] stroke-none"/>
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white">Wacht! Verlaat je al?</h3>
                <p className="text-slate-400 text-xs">Je mist de beste IPTV-deal van Nederland</p>
              </div>
              <div className="p-7 space-y-4 text-center">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Speciaal aanbod voor jou</div>
                  <div className="text-2xl font-black text-[#E0345F]">3 maanden gratis</div>
                  <div className="text-xs text-slate-600">bij bestelling van 15 maanden — vandaag alleen</div>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 text-left">
                  {[
                    "20.000+ zenders incl. alle Nederlandse",
                    "4K Ultra HD · geen buffering",
                    "Binnen 5 minuten actief",
                    "Betaal met PayPal, Visa of Bitcoin — geen contract"
                  ].map(t => (
                    <li key={t} className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wa.me/447832486269?text=Hallo%2C%20ik%20wil%20graag%20gebruik%20maken%20van%20het%20speciale%20aanbod%20van%203%20maanden%20gratis."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowExitPopup(false)}
                  className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#20b859] text-white font-black text-sm py-4 rounded-2xl transition active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
                  Claim 3 maanden gratis
                </a>
                <button onClick={() => setShowExitPopup(false)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition">Nee bedankt, ik ga weg</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp button */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-2">
        <a
          href="https://wa.me/447832486269?text=Hallo%2C%20ik%20wil%20graag%20een%20IPTV%20pakket%20bestellen."
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] hover:bg-[#20b859] rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 relative"
        >
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full" />
          <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/>
          </svg>
        </a>
      </div>

      {/* Mobile sticky bottom bar */}
      <AnimatePresence>
        {showStickyBar && activeTab === "home" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 inset-x-0 z-[55] sm:hidden bg-[#0E0E10] border-t border-white/10 px-5 flex items-center gap-3"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))", paddingTop: "12px" }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">15 maanden pakket</p>
              <p className="text-xs text-slate-400 mt-0.5">v.a. <span className="text-[#E0345F] font-black">€49,00</span> eenmalig · 4K · 20.000+</p>
            </div>
            <a
              href="https://wa.me/447832486269?text=Hallo%2C%20ik%20wil%20graag%20een%20IPTV%20pakket%20bestellen."
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 bg-[#25D366] hover:bg-[#20b859] text-white text-sm font-black px-5 py-3 rounded-2xl transition active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
              Bestellen
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retention popup */}
      <AnimatePresence>
        {showRetention && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowRetention(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center space-y-4"
            >
              <div className="text-4xl">✋</div>
              <h3 className="text-xl font-black text-slate-900">Wacht! Je verlaat een besparing van <span className="text-[#E0345F]">€494</span></h3>
              <p className="text-sm text-slate-500 leading-relaxed">Het 15 maanden pakket bespaart je €494 ten opzichte van maandelijkse aanbieders. Exclusief voor jou: gratis installatiehulp.</p>
              <a
                href="https://wa.me/447832486269?text=Hallo%2C%20ik%20wil%20graag%20een%20IPTV%20pakket%20bestellen."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowRetention(false)}
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20b859] text-white font-black py-4 rounded-2xl transition cursor-pointer"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
                Toch bestellen — €494 besparen
              </a>
              <button onClick={() => setShowRetention(false)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition">Nee, ik ga weg</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
