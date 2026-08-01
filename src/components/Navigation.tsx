import { Menu, X } from "lucide-react";
import { Wordmark } from "./Logo";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userPlan: string;
  userStatus: string;
}

const navItems = [
  { id: "home",         label: "Home" },
  { id: "subscription", label: "Prijzen & Pakketten" },
  { id: "support",      label: "Installatiegids" },
];

function useCountdown() {
  const get = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 0);
    return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  };
  const [s, setS] = useState(get);
  useEffect(() => {
    const t = setInterval(() => setS(get()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const countdown = useCountdown();
  const [menuOpen, setMenuOpen] = useState(false);
  // Transparent over the hero gradient, solid once the page scrolls under it.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">

      {/* Urgency bar */}
      <div className="bg-[#E0345F] text-white text-xs font-bold text-center py-1.5 px-4 flex items-center justify-center gap-2">
        <span className="animate-pulse shrink-0">🔥</span>
        <span className="hidden sm:inline">Tijdelijke aanbieding — Gratis installatiehulp bij elke bestelling</span>
        <span className="sm:hidden">Gratis installatiehulp bij bestelling</span>
        <span className="bg-black/20 rounded px-2 py-0.5 font-black tracking-widest shrink-0">{countdown}</span>
        <button
          onClick={() => window.open(`https://wa.me/447832486269?text=${encodeURIComponent("Hallo, ik wil graag gebruik maken van de tijdelijke aanbieding bij goedkopeiptv.")}`, "_blank")}
          className="underline underline-offset-2 hover:no-underline cursor-pointer shrink-0"
        >
          Claim →
        </button>
      </div>

      {/* Dutch stripe */}
      <div className="h-0.5 w-full dutch-stripe" />

      {/* Main nav bar */}
      <div className={`transition-colors duration-300 ${scrolled ? "glass-header border-b border-white/10" : "bg-transparent border-b border-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <button
            onClick={() => handleTabClick("home")}
            className="flex items-center shrink-0 cursor-pointer group"
          >
            <Wordmark className="text-white text-2xl transition-transform group-hover:scale-105" />
          </button>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#E0345F] after:rounded-full"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* WhatsApp CTA — desktop */}
            <button
              onClick={() => window.open(`https://wa.me/447832486269?text=${encodeURIComponent("Hallo, ik wil graag een IPTV pakket bestellen.")}`, "_blank")}
              className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:bg-[#20b859] text-white text-xs font-black px-3 py-2 rounded-lg transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
              Bestellen
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-[#0E0E10] border-b border-white/10 px-4 py-3 flex flex-col gap-1"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-[#E0345F] text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {/* WhatsApp CTA in mobile menu */}
            <button
              onClick={() => { setMenuOpen(false); window.open(`https://wa.me/447832486269?text=${encodeURIComponent("Hallo, ik wil graag een IPTV pakket bestellen.")}`, "_blank"); }}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b859] text-white text-sm font-black px-4 py-3 rounded-xl transition cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
              Bestellen via WhatsApp
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
