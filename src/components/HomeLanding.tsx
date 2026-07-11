import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { MovieOrSeries } from "../types";
import { SUBSCRIPTION_PLANS } from "../data/mockData";
import {
  Play, Check, Star, ChevronRight, Monitor,
  ChevronDown, ChevronUp, Zap, Shield, Clock, Globe, Package, Lock, ShoppingCart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Wordmark } from "./Logo";

interface HomeLandingProps {
  moviesAndSeries: MovieOrSeries[];
  onPlayMedia: (media: MovieOrSeries) => void;
  onSelectTab: (tab: string) => void;
  onUpdatePlan: (planId: string) => void;
}

type StatItem = { icon: React.ElementType; value: string; end: number | null; suffix?: string; label: string };
const STATS: StatItem[] = [
  { icon: Globe, value: "20.000+", end: 20000, suffix: "+", label: "Live Zenders" },
  { icon: Zap, value: "4K Ultra", end: null, label: "Maximale Kwaliteit" },
  { icon: Shield, value: "99.9%", end: 99.9, suffix: "%", label: "Uptime Garantie" },
  { icon: Clock, value: "24/7", end: null, label: "Nederlandse Support" },
];


const SCREENS_PRICING: Record<string, Record<number, number>> = {
  "plan-3m":  { 1: 34.99, 2: 49.99,  3: 69.99  },
  "plan-6m":  { 1: 44.99, 2: 79.99,  3: 99.99  },
  "plan-15m": { 1: 78,    2: 124.99, 3: 179.99 },
};

function openWhatsApp(planName: string, duration: string, price: number, vpn = false, screens = 1) {
  const lines = [
    `Hallo, ik wil graag het goedkopeiptv pakket bestellen:`,
    ``,
    `Pakket: ${planName} (${duration})`,
    `Schermen: ${screens}`,
    `VPN: ${vpn ? "Ja, inbegrepen" : "Nee"}`,
    `Totaal: €${price.toFixed(2)}`,
    ``,
    `Kunt u mij activeren? Stuur mij alstublieft de betaalgegevens.`,
  ];
  window.open(`https://wa.me/447449708976?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
}

const TICKER_MESSAGES = [
  "🔴 LIVE: 18.340 kijkers actief — Eredivisie vanavond 20:45",
  "⚡ Binnen 5 minuten actief na bestelling via WhatsApp",
  "🏆 Champions League · Formule 1 · UFC — alles in 4K",
  "🇳🇱 Alle Nederlandse zenders + 20.000 internationale kanalen",
  "🔒 SSL beveiligd · PayPal · Visa · Bitcoin beschikbaar",
];

// Meest populaire films — poster paths verified against TMDB's image CDN.
// Ordering mirrors IMDb's Most Popular (MOVIEmeter) selection of global hits.
type PopularFilm = { title: string; year: number; genre: string; rating: number; poster: string };
const POPULAR_FILMS: PopularFilm[] = [
  { title: "Oppenheimer",              year: 2023, genre: "Drama",    rating: 8.3, poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
  { title: "Dune: Part Two",           year: 2024, genre: "Sci-Fi",   rating: 8.5, poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
  { title: "Joker",                    year: 2019, genre: "Drama",    rating: 8.4, poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg" },
  { title: "Avengers: Endgame",        year: 2019, genre: "Actie",    rating: 8.4, poster: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg" },
  { title: "Spider-Man: No Way Home",  year: 2021, genre: "Actie",    rating: 8.2, poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg" },
  { title: "Top Gun: Maverick",        year: 2022, genre: "Actie",    rating: 8.2, poster: "https://image.tmdb.org/t/p/w500/n0YuM4f5lvGAP6MAW2kBIzugXnc.jpg" },
  { title: "John Wick: Chapter 4",     year: 2023, genre: "Actie",    rating: 7.7, poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg" },
  { title: "The Dark Knight",          year: 2008, genre: "Actie",    rating: 9.0, poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { title: "Inception",                year: 2010, genre: "Sci-Fi",   rating: 8.8, poster: "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg" },
  { title: "Interstellar",             year: 2014, genre: "Sci-Fi",   rating: 8.7, poster: "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg" },
  { title: "Parasite",                 year: 2019, genre: "Thriller", rating: 8.5, poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },
  { title: "Avatar: The Way of Water", year: 2022, genre: "Sci-Fi",   rating: 7.6, poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" },
  { title: "Barbie",                   year: 2023, genre: "Comedy",   rating: 6.8, poster: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" },
  { title: "Avatar",                   year: 2009, genre: "Sci-Fi",   rating: 7.9, poster: "https://image.tmdb.org/t/p/w500/gKY6q7SjCkAU6FqvqWybDYgUKIF.jpg" },
  { title: "Fight Club",               year: 1999, genre: "Drama",    rating: 8.8, poster: "https://image.tmdb.org/t/p/w500/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg" },
  { title: "The Matrix",               year: 1999, genre: "Sci-Fi",   rating: 8.7, poster: "https://image.tmdb.org/t/p/w500/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg" },
  { title: "The Batman",               year: 2022, genre: "Actie",    rating: 7.8, poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg" },
  { title: "Deadpool & Wolverine",     year: 2024, genre: "Actie",    rating: 7.7, poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg" },
  { title: "Spider-Man: Spider-Verse", year: 2023, genre: "Animatie", rating: 8.5, poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg" },
  { title: "Inside Out 2",             year: 2024, genre: "Animatie", rating: 7.6, poster: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg" },
  { title: "Mad Max: Fury Road",       year: 2015, genre: "Actie",    rating: 8.1, poster: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg" },
  { title: "Blade Runner 2049",        year: 2017, genre: "Sci-Fi",   rating: 8.0, poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg" },
  { title: "Everything Everywhere",    year: 2022, genre: "Sci-Fi",   rating: 7.8, poster: "https://image.tmdb.org/t/p/w500/u68AjlvlutfEIcpmbYpKcdi09ut.jpg" },
  { title: "Guardians of the Galaxy 3",year: 2023, genre: "Actie",    rating: 7.9, poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg" },
  { title: "The Super Mario Bros.",    year: 2023, genre: "Animatie", rating: 7.0, poster: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg" },
  { title: "LOTR: Return of the King", year: 2003, genre: "Fantasy",  rating: 9.0, poster: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg" },
  { title: "LOTR: Fellowship",         year: 2001, genre: "Fantasy",  rating: 8.9, poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg" },
  { title: "Harry Potter",             year: 2001, genre: "Fantasy",  rating: 7.6, poster: "https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg" },
  { title: "Pulp Fiction",             year: 1994, genre: "Misdaad",  rating: 8.9, poster: "https://image.tmdb.org/t/p/w500/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg" },
  { title: "The Shawshank Redemption", year: 1994, genre: "Drama",    rating: 9.3, poster: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg" },
  { title: "Forrest Gump",             year: 1994, genre: "Drama",    rating: 8.8, poster: "https://image.tmdb.org/t/p/w500/Cw4hIUIAmSYfK9QfaUW5igp9La.jpg" },
];

type PopularSeries = { title: string; year: number; genre: string; rating: number; poster: string };
const POPULAR_SERIES: PopularSeries[] = [
  { title: "Game of Thrones",     year: 2011, genre: "Fantasy",  rating: 9.2, poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg" },
  { title: "Breaking Bad",        year: 2008, genre: "Misdaad",  rating: 9.5, poster: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg" },
  { title: "Stranger Things",     year: 2016, genre: "Sci-Fi",   rating: 8.7, poster: "https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg" },
  { title: "The Last of Us",      year: 2023, genre: "Drama",    rating: 8.7, poster: "https://image.tmdb.org/t/p/w500/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg" },
  { title: "Wednesday",           year: 2022, genre: "Comedy",   rating: 8.1, poster: "https://image.tmdb.org/t/p/w500/36xXlhEpQqVVPuiZhfoQuaY4OlA.jpg" },
  { title: "Money Heist",         year: 2017, genre: "Misdaad",  rating: 8.2, poster: "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg" },
  { title: "The Mandalorian",     year: 2019, genre: "Sci-Fi",   rating: 8.4, poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg" },
  { title: "The Boys",            year: 2019, genre: "Actie",    rating: 8.6, poster: "https://image.tmdb.org/t/p/w500/in1R2dDc421JxsoRWaIIAqVI2KE.jpg" },
  { title: "Arcane",              year: 2021, genre: "Animatie", rating: 8.7, poster: "https://image.tmdb.org/t/p/w500/abf8tHznhSvl9BAElD2cQeRr7do.jpg" },
  { title: "Peaky Blinders",      year: 2013, genre: "Misdaad",  rating: 8.8, poster: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg" },
  { title: "The Witcher",         year: 2019, genre: "Fantasy",  rating: 8.0, poster: "https://image.tmdb.org/t/p/w500/AoGsDM02UVt0npBA8OvpDcZbaMi.jpg" },
  { title: "The Walking Dead",    year: 2010, genre: "Horror",   rating: 8.1, poster: "https://image.tmdb.org/t/p/w500/aN29llVoCFtBTwDZFtqdD9d8dHb.jpg" },
  { title: "Loki",                year: 2021, genre: "Sci-Fi",   rating: 8.2, poster: "https://image.tmdb.org/t/p/w500/rX1wQMTKFqF0gvZyS0DDQqgnQPB.jpg" },
  { title: "The Office",          year: 2005, genre: "Comedy",   rating: 8.9, poster: "https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg" },
  { title: "Friends",             year: 1994, genre: "Comedy",   rating: 8.5, poster: "https://image.tmdb.org/t/p/w500/2koX1xLkpTQM4IZebYvKysFW1Nh.jpg" },
  { title: "Rick and Morty",      year: 2013, genre: "Animatie", rating: 9.1, poster: "https://image.tmdb.org/t/p/w500/owhkU6KRqdXoUQpjV8uyZGPtX58.jpg" },
];

export default function HomeLanding({ moviesAndSeries, onPlayMedia, onSelectTab }: HomeLandingProps) {
  const heroMovies = moviesAndSeries.filter(m => m.isTrending).slice(0, 5);
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeHero = heroMovies[currentSlide] || moviesAndSeries[0];
  const [orderModal, setOrderModal] = useState<{ plan: string; period: string; price: number; vpn: boolean; screens: number } | null>(null);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      setCountdown({ h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);
  const [geoCity, setGeoCity] = useState<string | null>(null);
  const [supportCount, setSupportCount] = useState(3);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://ipapi.co/json/").then(r => r.json()).then(d => { if (d.city) setGeoCity(d.city); }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSupportCount(n => Math.max(2, Math.min(5, n + (Math.random() > 0.5 ? 1 : -1)))), 7000);
    return () => clearInterval(t);
  }, []);

  const QUIZ_STEPS: { q: string; opts: { label: string; icon: React.ReactNode }[] }[] = [
    { q: "Welk apparaat gebruik je?", opts: [
      { label: "Smart TV", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
      { label: "Firestick / Android TV", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
      { label: "Telefoon / Tablet", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg> },
      { label: "PC / Mac", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="13" rx="2"/><path d="M8 21h8M12 16v5"/><path d="M2 13h20"/></svg> },
    ]},
    { q: "Hoeveel schermen tegelijk?", opts: [
      { label: "1 scherm", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
      { label: "2 schermen", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="14" height="10" rx="1.5"/><rect x="9" y="9" width="14" height="10" rx="1.5"/></svg> },
      { label: "3 schermen", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="10" height="8" rx="1"/><rect x="13" y="3" width="10" height="8" rx="1"/><rect x="7" y="13" width="10" height="8" rx="1"/></svg> },
    ]},
    { q: "Hoelang wil je kijken?", opts: [
      { label: "3 maanden — Probeer het", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
      { label: "6 maanden — Goede deal", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
      { label: "15 maanden — Beste waarde", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg> },
    ]},
  ];
  const quizResult = quizAnswers[2]?.startsWith("15") ? "15 maanden" : quizAnswers[2]?.startsWith("6 ") ? "6 maanden" : "3 maanden";

  const [statCounts, setStatCounts] = useState([0, 0, 0, 0]);
  const statRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const statStarted = useRef([false, false, false, false]);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const duration = 1500;
    const observers = STATS.map((stat, i) => {
      if (stat.end === null) return null;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !statStarted.current[i]) {
          statStarted.current[i] = true;
          const startTime = performance.now();
          const end = stat.end!;
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setStatCounts(prev => { const next = [...prev]; next[i] = eased * end; return next; });
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }, { threshold: 0.5 });
      if (statRefs[i].current) observer.observe(statRefs[i].current!);
      return observer;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  const [vpnSelected, setVpnSelected] = useState<Record<string, boolean>>({});
  const [screensSelected, setScreensSelected] = useState<Record<string, number>>({});
  const [openFaqId, setOpenFaqId] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState("");
  const [copiedFaq, setCopiedFaq] = useState<number | null>(null);
  const [savingsCount, setSavingsCount] = useState(0);
  const savingsRef = useRef<HTMLDivElement>(null);
  const savingsStarted = useRef(false);
  const [liveViewers, setLiveViewers] = useState(2847);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const HERO_WORDS = ["Eredivisie", "Champions League", "Netflix", "Formule 1", "UFC", "HBO Max"];
  const [heroWordIdx, setHeroWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHeroWordIdx(i => (i + 1) % HERO_WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);
  const fireConfetti = useCallback(() => {
    const colors = ["#ef4444", "#25D366", "#3b82f6", "#f59e0b", "#ec4899", "#ffffff"];
    const count = 80;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      el.style.left = Math.random() * 100 + "vw";
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (1.5 + Math.random() * 1.5) + "s";
      el.style.animationDelay = Math.random() * 0.6 + "s";
      el.style.width = (6 + Math.random() * 8) + "px";
      el.style.height = el.style.width;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }
  }, []);

  const pricingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setInterval(() => {
      setLiveViewers(v => v + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const el = pricingRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setShowStickyBar(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const el = savingsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !savingsStarted.current) {
        savingsStarted.current = true;
        const target = 494;
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setSavingsCount(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPaused = useRef(false);
  useEffect(() => {
    let frame: number;
    const step = () => {
      const el = scrollRef.current;
      if (el && !scrollPaused.current && el.scrollWidth > el.clientWidth + 10) {
        el.scrollLeft += 2;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const popularFilmsRef = useRef<HTMLDivElement>(null);
  const popularFilmsPaused = useRef(false);
  useEffect(() => {
    let frame: number;
    const step = () => {
      const el = popularFilmsRef.current;
      if (el && !popularFilmsPaused.current && el.scrollWidth > el.clientWidth + 10) {
        if (el.scrollLeft <= 0) {
          el.scrollLeft = el.scrollWidth / 2;
        }
        el.scrollLeft -= 2;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const popularSeriesRef = useRef<HTMLDivElement>(null);
  const popularSeriesPaused = useRef(false);
  useEffect(() => {
    let frame: number;
    const step = () => {
      const el = popularSeriesRef.current;
      if (el && !popularSeriesPaused.current && el.scrollWidth > el.clientWidth + 10) {
        el.scrollLeft += 2;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const channelsScrollRef = useRef<HTMLDivElement>(null);
  const channelsPaused = useRef(false);
  useEffect(() => {
    let frame: number;
    const step = () => {
      const el = channelsScrollRef.current;
      if (el && !channelsPaused.current) {
        el.scrollLeft += 1;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const sportsScrollRef = useRef<HTMLDivElement>(null);
  const sportsPaused = useRef(false);
  useEffect(() => {
    let frame: number;
    const step = () => {
      const el = sportsScrollRef.current;
      if (el && !sportsPaused.current) {
        el.scrollLeft += 1;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const faqs = [
    {
      id: 0,
      question: "Welke Nederlandse zenders zijn inbegrepen?",
      answer: "goedkopeiptv biedt alle grote Nederlandse zenders: NPO 1, NPO 2, NPO 3, RTL 4, RTL 5, RTL 7, RTL 8, SBS 6, Net5, Veronica, Ziggo Sport, Fox Sports NL, Comedy Central NL en AT5. Daarnaast heb je toegang tot meer dan 20.000 internationale zenders."
    },
    {
      id: 1,
      question: "Kan ik de Eredivisie en Champions League live kijken?",
      answer: "Ja! Met ons 6 Maanden of 12+3 Maanden pakket heb je toegang tot alle live Eredivisie-wedstrijden, de Champions League, Europa League en alle internationale competities. Nooit meer een wedstrijd missen."
    },
    {
      id: 2,
      question: "Hoe bestel ik en hoe snel wordt het geactiveerd?",
      answer: "Je bestelt via WhatsApp — klik op de 'Bestellen' knop bij jouw gewenste pakket. Onze medewerker neemt direct contact op en je account is doorgaans binnen 5 minuten actief. Betalen kan met PayPal, Visa of Bitcoin."
    },
    {
      id: 3,
      question: "Werkt het op mijn Smart TV en telefoon?",
      answer: "goedkopeiptv werkt op alle moderne apparaten: Samsung en LG Smart TV's, Android TV, Apple TV, Amazon Fire Stick, Chromecast, Windows en Mac, Android en iOS telefoons en tablets."
    },
    {
      id: 4,
      question: "Wat als ik problemen ondervind?",
      answer: "Onze Nederlandse klantenservice is 24/7 beschikbaar via WhatsApp. We lossen technische problemen doorgaans binnen 30 minuten op. VIP-klanten (12+3 pakket) krijgen een dedicated supportlijn."
    },
    {
      id: 5,
      question: "Kan ik opzeggen wanneer ik wil?",
      answer: "Ja, absoluut. Er is geen automatische verlenging en geen maandelijks abonnement. Je betaalt eenmalig voor de looptijd die je kiest (3, 6 of 15 maanden). Na afloop kun je simpelweg verlengen via WhatsApp — of niet. Geen gedoe, geen verborgen kosten."
    },
    {
      id: 6,
      question: "Welke betaalmethoden accepteren jullie?",
      answer: "Je kunt betalen met PayPal, Visa of Bitcoin. Alle betalingen zijn beveiligd met SSL-encryptie. Na betaling ontvang je binnen 5 minuten je inloggegevens via WhatsApp."
    },
    {
      id: 7,
      question: "Is er een gratis proefperiode?",
      answer: "We bieden geen gratis trial aan, maar wel een 24-uurs testperiode voor €2,99 zodat je alles kunt uitproberen zonder risico. Neem contact op via WhatsApp en we regelen het direct voor je."
    }
  ];

  const CHANNELS = [
    { name: "NPO 1", img: "https://upload.wikimedia.org/wikipedia/commons/0/02/NPO_1_logo_2014.svg" },
    { name: "NPO 2", img: "https://upload.wikimedia.org/wikipedia/commons/f/f3/NPO_2_logo_2014.svg" },
    { name: "NPO 3", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/NPO_3_logo_2018.svg/1280px-NPO_3_logo_2018.svg.png" },
    { name: "RTL 4", img: "https://images.seeklogo.com/logo-png/51/2/rtl-4-2013-logo-png_seeklogo-512381.png" },
    { name: "RTL 5", img: "https://images.seeklogo.com/logo-png/12/2/rtl-5-logo-png_seeklogo-120482.png" },
    { name: "RTL 7", img: "https://www.bce.lu/wp-content/uploads/2023/04/RTL-7-logo-1.png" },
    { name: "SBS 6", img: "https://upload.wikimedia.org/wikipedia/commons/4/4b/SBS6-logo-2018.png" },
    { name: "Veronica", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Veronica_TV_logo_2024.svg/1280px-Veronica_TV_logo_2024.svg.png" },
    { name: "Ziggo Sport", img: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Ziggo_Sport_logo_2026.svg", isLive: true },
    { name: "Fox Sports", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/FOX_Sports_logo.svg/1280px-FOX_Sports_logo.svg.png", isLive: true },
    { name: "Comedy Central", img: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Comedy_Central_2018.svg" },
    { name: "BBC One", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BBC_One_logo_2021.svg/1280px-BBC_One_logo_2021.svg.png" },
    { name: "CNN", img: "https://upload.wikimedia.org/wikipedia/commons/9/9d/CNN_Logo_%282014%29.svg" },
    { name: "ESPN", img: "https://upload.wikimedia.org/wikipedia/commons/6/60/ESPN_logos.png", isNew: true },
    { name: "Eurosport", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Eurosport_logo_%282001-2011%29.svg/960px-Eurosport_logo_%282001-2011%29.svg.png", isNew: true },
  ];

  const SPORTS = [
    { name: "Voetbal", sub: "Eredivisie · Champions League · WK", img: "https://assets.goal.com/images/v3/getty-2219813002/crop/MM5DINBQGA5DENBXGU5G433XMU5DQNJ2GUZDK===/GettyImages-2219813002.jpg" },
    { name: "Veldockey", sub: "Oranje Dames & Heren · EK · WK", img: "https://ktvz.b-cdn.net/2024/08/ger-ned-men-hockey-1920x1080-1-1440x810.jpg" },
    { name: "Schaatsen", sub: "Wereldbeker · NK · EK Schaatsen", img: "https://www.wavy.com/wp-content/uploads/sites/3/2018/02/ap18050406207141_1_38331466_ver1.0.jpg?w=1280" },
    { name: "Formule 1", sub: "Alle Grands Prix · Kwalificatie", img: "https://static01.nyt.com/athletic/uploads/wp/2024/08/25110759/GettyImages-2168398789-scaled.jpg" },
    { name: "Tennis", sub: "Wimbledon · Roland Garros · US Open", img: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80" },
    { name: "Wielrennen", sub: "Tour de France · Giro · Vuelta", img: "https://prod-img.telegraaf.nl/public/sport/2xnnp1-anp-562263858.jpg/alternates/ONE_ONE_1200/ANP-562263858.jpg" },
    { name: "Basketball", sub: "NBA · EuroLeague · FIBA", img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80" },
    { name: "Boksen", sub: "WBC · WBA · IBF · WBO", img: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80" },
    { name: "MMA", sub: "UFC · Bellator · ONE Championship", img: "https://m.media-amazon.com/images/I/71pTR2lk4tL._AC_UF1000,1000_QL80_.jpg" },
    { name: "Golf", sub: "The Masters · Ryder Cup · Open", img: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80" },
    { name: "Rugby", sub: "Six Nations · World Cup · Top 14", img: "https://contentfulproxy.stadion.io/uiu4umqyl5b5/3FX9run4GHpPZivrZPMWNj/c6f5f5108075f90db781d732a196431c/f646b1b81c232c714f0c03544829471c-ARCH290983_00143750.jpg?fm=webp&fit=fill&f=center&w=3183&h=2169" },
  ];

  return (
    <div id="home-landing-screen" className="space-y-10 md:space-y-16">

      {/* LIVE TICKER */}
      <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] rounded-2xl px-4 py-3 flex items-center gap-3 overflow-hidden">
        <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded uppercase tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
          LIVE
        </span>
        <div className="flex-1 overflow-hidden relative h-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIdx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-white text-xs font-semibold absolute whitespace-nowrap"
            >
              {TICKER_MESSAGES[tickerIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* 1. HERO SLIDER */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden w-full shadow-2xl flex items-end" style={{ minHeight: "420px" }} >
        <div className="absolute inset-0 md:hidden" style={{ paddingBottom: "56.25%" }} />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={activeHero?.backdrop}
              alt={activeHero?.title}
              className="w-full h-full object-cover filter brightness-[0.3]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-full md:w-2/3 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 p-5 sm:p-8 md:p-12 lg:p-16 w-full md:max-w-2xl space-y-4">
          {/* Gradient blob */}
          <div className="absolute -inset-20 pointer-events-none z-0" aria-hidden>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-[#ef4444]/20 blur-3xl" style={{ animation: "pulse-ring 4s ease-in-out infinite" }} />
            <div className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full bg-red-600/10 blur-3xl" style={{ animation: "pulse-ring 6s ease-in-out infinite reverse" }} />
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <span className="text-xs bg-[#ef4444] text-white font-black px-2.5 py-1 rounded-lg uppercase tracking-widest glow-red-sm">
              🇳🇱 {geoCity ? `Populair in ${geoCity}` : "Trending in Nederland"}
            </span>
            <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
              <Star className="w-3 h-3 fill-current" />
              {activeHero?.rating}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-none drop-shadow-lg whitespace-nowrap overflow-hidden text-ellipsis">
            {activeHero?.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/70 text-sm font-bold">Kijk nu:</span>
            <div className="overflow-hidden h-7 flex items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroWordIdx}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-sm font-black text-[#ef4444] bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 rounded-lg block"
                >
                  {HERO_WORDS[heroWordIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-amber-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
            <span className="text-xs font-bold text-white/80">4.9/5</span>
            <span className="text-xs text-slate-400">· 1.247 beoordelingen</span>
            <span className="ml-2 flex items-center gap-1 text-xs text-emerald-400 font-bold bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              {supportCount} medewerkers online
            </span>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2 max-w-lg">
            {activeHero?.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={() => {
                const msg = "Hallo, ik wil graag meer informatie over goedkopeiptv. Kunt u mij helpen?";
                window.open(`https://wa.me/447449708976?text=${encodeURIComponent(msg)}`, "_blank");
              }}
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20b859] text-white text-sm font-extrabold px-6 py-4 rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition duration-200 active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
              Contact via WhatsApp
            </button>
            <button
              onClick={() => { document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }}
              className="w-full sm:w-auto bg-white hover:bg-slate-100 border-2 border-[#ef4444] text-[#ef4444] text-sm font-black px-6 py-4 rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Bestel je pakket
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {heroMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-400 cursor-pointer ${
                  currentSlide === idx ? "w-10 bg-[#ef4444] glow-red-sm" : "w-2 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
            <span className="ml-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-white">{liveViewers.toLocaleString("nl-NL")} actieve kijkers</span>
            </span>
            <button
              onClick={() => {
                const msg = encodeURIComponent("🔥 Kijk dit eens! Goedkope IPTV — alle zenders in 4K, Eredivisie & Champions League. Binnen 5 minuten actief 👉 https://goedkopeiptv.com");
                window.open(`https://wa.me/?text=${msg}`, "_blank");
              }}
              className="ml-2 flex items-center gap-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/40 backdrop-blur-sm border border-[#25D366]/40 px-3 py-1 rounded-full transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-[#25D366] shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
              <span className="text-xs font-bold text-white">Deel</span>
            </button>
          </div>
        </div>

        {/* Film genre tags bottom-right */}
        <div className="absolute bottom-6 right-6 z-10 hidden md:flex items-center gap-2">
          {activeHero?.genre?.slice(0, 3).map(g => (
            <span key={g} className="text-xs bg-white/10 backdrop-blur-sm border border-white/20 text-white px-2.5 py-1 rounded-lg font-semibold">
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* CHANNELS STRIP */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-4">
        <div className="text-center">
          <span className="text-xs font-black tracking-widest text-[#ef4444] uppercase bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full inline-block font-roboto-slab">20.000+ Zenders beschikbaar</span>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-[#f8fafc] to-transparent dark:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-[#f8fafc] to-transparent dark:hidden" />
        <div
          ref={channelsScrollRef}
          onMouseEnter={() => { channelsPaused.current = true; }}
          onMouseLeave={() => { channelsPaused.current = false; }}
          className="flex flex-row gap-4 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {[...CHANNELS, ...CHANNELS].map((ch, i) => (
            <div key={i} className="relative glass-card rounded-xl px-4 pt-5 pb-2.5 flex flex-col items-center flex-shrink-0 hover:shadow-md transition-shadow gap-1">
              {ch.isLive && i < CHANNELS.length && (
                <span className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />NU LIVE
                </span>
              )}
              {ch.isNew && i < CHANNELS.length && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-tight">NIEUW</span>
              )}
              <img src={ch.img} alt={ch.name} className="h-9 w-auto object-contain" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ))}
        </div>
        </div>
      </motion.div>

      {/* 2. STATS BAR */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon as React.ElementType;
          const count = statCounts[i];
          const display = stat.end !== null
            ? (stat.end % 1 === 0 ? Math.round(count).toLocaleString("nl-NL") : count.toFixed(1)) + (stat.suffix ?? "")
            : stat.value;
          return (
            <div key={i} ref={statRefs[i]} className="glass-card rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4 group hover:border-[#ef4444]/30 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center shrink-0 group-hover:bg-[#ef4444]/20 transition-colors">
                <Icon className="w-5 h-5 text-[#ef4444]" />
              </div>
              <div>
                <div className="font-black text-xl md:text-2xl text-slate-900 leading-none tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>{display}</div>
                <div className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent" /></div>

      {/* 3. TRENDING DUTCH FILMS */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#ef4444] font-roboto-slab">🇳🇱 Trending Nu</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Nederlandse Films & Series
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-roboto-slab">
              De beste Dutch cinema — van klassieken tot moderne hits.
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          onMouseEnter={() => { scrollPaused.current = true; }}
          onMouseLeave={() => { scrollPaused.current = false; }}
          className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 scrollbar-none"
        >
          {[...moviesAndSeries, ...moviesAndSeries].map((movie, i) => (
            <div
              key={`${movie.id}-${i}`}
              className="group space-y-2 shrink-0 w-36 sm:w-40 md:w-44"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-xs font-bold text-amber-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  {movie.rating}
                </div>
                {movie.isTrending && (
                  <div className="absolute top-2.5 right-2.5 bg-[#ef4444] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    Hot
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 transition">
                  <div className="text-white font-bold text-xs text-center truncate">{movie.title}</div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#ef4444] transition leading-tight">
                  {movie.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{movie.year} · {movie.genre[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3b. MOST POPULAR FILMS (IMDb MOVIEmeter) */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#ef4444] font-roboto-slab"><Globe className="w-3.5 h-3.5" strokeWidth={2.5} />Wereldwijd Trending</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Meest Populaire Films
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-roboto-slab">
              De grootste blockbusters van dit moment — direct beschikbaar in 4K.
            </p>
          </div>
        </div>

        <div
          ref={popularFilmsRef}
          onMouseEnter={() => { popularFilmsPaused.current = true; }}
          onMouseLeave={() => { popularFilmsPaused.current = false; }}
          className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 scrollbar-none"
        >
          {[...POPULAR_FILMS, ...POPULAR_FILMS].map((film, i) => (
            <div
              key={`${film.title}-${i}`}
              className="group space-y-2 shrink-0 w-36 sm:w-40 md:w-44"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                <img
                  src={film.poster}
                  alt={film.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-xs font-bold text-amber-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  {film.rating}
                </div>
                <div className="absolute top-2.5 right-2.5 bg-[#ef4444] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-md tabular-nums">
                  {(i % POPULAR_FILMS.length) + 1}
                </div>
                <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 transition">
                  <div className="text-white font-bold text-xs text-center truncate">{film.title}</div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#ef4444] transition leading-tight">
                  {film.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{film.year} · {film.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3c. MOST POPULAR SERIES (IMDb TVmeter) */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#ef4444] font-roboto-slab"><Monitor className="w-3.5 h-3.5" strokeWidth={2.5} />Series Trending</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Meest Populaire Series
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-roboto-slab">
              De best bekeken series wereldwijd — alle seizoenen on-demand.
            </p>
          </div>
        </div>

        <div
          ref={popularSeriesRef}
          onMouseEnter={() => { popularSeriesPaused.current = true; }}
          onMouseLeave={() => { popularSeriesPaused.current = false; }}
          className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 scrollbar-none"
        >
          {[...POPULAR_SERIES, ...POPULAR_SERIES].map((serie, i) => (
            <div
              key={`${serie.title}-${i}`}
              className="group space-y-2 shrink-0 w-36 sm:w-40 md:w-44"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                <img
                  src={serie.poster}
                  alt={serie.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-xs font-bold text-amber-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  {serie.rating}
                </div>
                <div className="absolute top-2.5 right-2.5 bg-[#ef4444] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-md tabular-nums">
                  {(i % POPULAR_SERIES.length) + 1}
                </div>
                <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 transition">
                  <div className="text-white font-bold text-xs text-center truncate">{serie.title}</div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#ef4444] transition leading-tight">
                  {serie.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{serie.year} · {serie.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* SPORT SECTION */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-black tracking-[0.25em] text-[#ef4444] uppercase bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full inline-block font-roboto-slab">Van Eredivisie tot Champions League</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-tight">
            Elke Sport. Elke Competitie. Live in 4K.
          </h2>
        </div>

        <div
          ref={sportsScrollRef}
          onMouseEnter={() => { sportsPaused.current = true; }}
          onMouseLeave={() => { sportsPaused.current = false; }}
          className="flex flex-row gap-4 overflow-x-auto pb-2 max-w-6xl mx-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {[...SPORTS, ...SPORTS].map((sport, i) => (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer group hover:scale-[1.02] transition-transform duration-300 shadow-xl flex-shrink-0 w-48"
            >
              {/* background photo */}
              <img
                src={sport.img}
                alt={sport.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {/* dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

              {/* content */}
              <div className="relative h-full flex flex-col justify-between p-4">
                {/* badges */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                    LIVE
                  </span>
                  <span className="bg-black/40 backdrop-blur-sm border border-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">4K HD</span>
                </div>

                {/* bottom label */}
                <div>
                  <div className="text-[#ef4444] font-black text-sm md:text-base uppercase tracking-widest leading-tight drop-shadow-lg">
                    {sport.name}
                  </div>
                  <div className="text-white/60 text-xs mt-0.5 leading-tight truncate">{sport.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent" /></div>

      {/* 4. PRICING — WhatsApp order, 3 fixed plans */}
      <motion.div ref={pricingRef} id="pricing" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 text-xs text-[#ef4444] font-extrabold uppercase tracking-widest bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/15 font-roboto-slab">
            🇳🇱 Abonnementen
          </span>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg">
            <span className="animate-pulse">🔥</span>
            <span>Aanbieding verloopt over</span>
            <span className="font-mono bg-black/20 px-2 py-0.5 rounded">
              {String(countdown.h).padStart(2,"0")}:{String(countdown.m).padStart(2,"0")}:{String(countdown.s).padStart(2,"0")}
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
            Kies jouw pakket
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-3 flex-wrap text-sm"
          >
            {[{ name: "Ziggo", price: "€49/mnd" }, { name: "KPN", price: "€44/mnd" }, { name: "Netflix", price: "€18/mnd" }].map(c => (
              <span key={c.name} className="flex items-center gap-1.5 text-slate-400">
                <span className="font-semibold">{c.name}</span>
                <span className="relative font-black text-slate-500">
                  {c.price}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="absolute inset-y-[45%] left-0 right-0 h-0.5 bg-red-400 origin-left"
                  />
                </span>
              </span>
            ))}
            <span className="text-slate-300">vs</span>
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 1 }}
              className="font-black text-emerald-600 text-base bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full"
            >
              goedkopeiptv v.a. €34,99 voor 3 maanden
            </motion.span>
          </motion.div>
          <p className="text-slate-500 text-sm font-roboto-slab">
            Bestel direct via WhatsApp — binnen 5 minuten actief. Betaal met PayPal, Visa of Bitcoin.
          </p>
          <button
            onClick={() => { setShowQuiz(true); setQuizStep(0); setQuizAnswers([]); }}
            className="inline-flex items-center gap-2 text-sm font-black text-[#ef4444] border border-[#ef4444]/30 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg>
            Welk pakket past bij jou? — Doe de quiz
          </button>
          {/* Social proof counter */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="flex -space-x-2">
              {["bg-red-400","bg-blue-500","bg-emerald-500","bg-red-500","bg-rose-500"].map((c,i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-[9px] font-black`}>
                  {["J","M","S","K","R"][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-slate-900">1.247+ tevreden klanten</div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_,i) => <span key={i} className="text-amber-400 text-xs">★</span>)}
                <span className="text-xs text-slate-500 ml-1">4.9/5 gemiddeld</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {SUBSCRIPTION_PLANS.map((plan, idx) => {
            const isPopular = idx === 2;
            const hasVpn = !!vpnSelected[plan.id];
            const screens = screensSelected[plan.id] || 1;
            const basePrice = SCREENS_PRICING[plan.id]?.[screens] ?? plan.price;
            const totalPrice = basePrice + (hasVpn ? 10 : 0);
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-5 md:p-7 flex flex-col h-full transition-all duration-300 ${
                  isPopular
                    ? "bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white shadow-2xl border border-[#ef4444]/30 glow-red"
                    : "bg-white border border-slate-200 shadow-lg hover:border-red-200 hover:shadow-xl"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="relative bg-[#ef4444] text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full glow-red-sm">
                      🏆 Beste Waarde — 3 Maanden Gratis
                      <span className="absolute inset-0 rounded-full animate-ping bg-[#ef4444] opacity-30" />
                    </div>
                  </div>
                )}
                {!isPopular && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                    {idx === 0 ? "Bespaar €5" : "Bespaar €15"}
                  </div>
                )}

                {/* grows to fill card height */}
                <div className="flex-1 space-y-5">
                  <div>
                    <div className={`text-xs font-black uppercase tracking-widest mb-1 ${isPopular ? "text-[#ef4444]" : "text-slate-500"}`}>
                      {plan.billingPeriod}
                    </div>
                    <h3 className={`text-2xl font-black tracking-tight ${isPopular ? "text-white" : "text-slate-900"}`}>
                      {plan.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black transition-all ${isPopular ? "text-white" : "text-slate-900"}`}>
                      €{totalPrice.toFixed(2)}
                    </span>
                    <span className={`text-sm font-bold ${isPopular ? "text-slate-400" : "text-slate-500"}`}>
                      eenmalig
                    </span>
                  </div>
                  {isPopular && (
                    <div ref={savingsRef} className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-3 py-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                      <span className="text-xs font-black text-emerald-400">Je bespaart <span className="text-emerald-300">€{savingsCount}</span> dit jaar vs Ziggo</span>
                    </div>
                  )}

                  <ul className={`space-y-1 text-sm border-t pt-5 ${isPopular ? "border-white/10" : "border-slate-100"}`}>
                    {plan.features.map((feat) => (
                      <li key={feat} className={`flex items-start gap-2.5 px-2 py-1 rounded-lg transition-all duration-150 cursor-default ${isPopular ? "hover:bg-white/10" : "hover:bg-red-50"}`}>
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#ef4444]" />
                        <span className={isPopular ? "text-slate-300" : "text-slate-700"}>{feat}</span>
                      </li>
                    ))}
                    {hasVpn && (
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span className={`font-bold ${isPopular ? "text-emerald-400" : "text-emerald-600"}`}>VPN (+€10)</span>
                      </li>
                    )}
                    {screens > 1 && (
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span className={`font-bold ${isPopular ? "text-emerald-400" : "text-emerald-600"}`}>{screens} schermen inbegrepen</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* VPN add-on toggle */}
                <div className={`mt-5 rounded-2xl p-3 border ${isPopular ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                      <svg viewBox="0 0 24 24" className={`w-4 h-4 shrink-0 ${isPopular ? "text-red-300" : "text-[#ef4444]"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className={`text-sm font-black whitespace-nowrap ${isPopular ? "text-white" : "text-slate-900"}`}>VPN</span>
                      <span className={`text-xs font-medium whitespace-nowrap ${isPopular ? "text-slate-400" : "text-slate-500"}`}>· +€10,00</span>
                    </div>
                    <button
                      role="switch"
                      aria-checked={hasVpn}
                      onClick={() => setVpnSelected(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none cursor-pointer ${hasVpn ? "bg-[#ef4444]" : isPopular ? "bg-white/20" : "bg-slate-300"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${hasVpn ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                </div>

                {/* Screens add-on */}
                <div className={`mt-3 rounded-2xl p-3 border ${isPopular ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 shrink-0 text-[#ef4444]" />
                    <span className={`text-xs font-black ${isPopular ? "text-white" : "text-slate-900"}`}>Aantal schermen</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => setScreensSelected(prev => ({ ...prev, [plan.id]: n }))}
                        className={`text-sm font-black py-2.5 rounded-xl transition-all cursor-pointer ${
                          screens === n
                            ? "bg-[#ef4444] text-white shadow"
                            : isPopular
                            ? "bg-white/10 text-slate-300 hover:bg-white/20"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {n} ✓
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { fireConfetti(); setOrderModal({ plan: plan.name, period: plan.billingPeriod, price: totalPrice, vpn: hasVpn, screens }); }}
                  className={`mt-4 w-full flex items-center justify-center gap-2.5 font-black text-sm py-4 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer ${
                    isPopular
                      ? "bg-[#25D366] hover:bg-[#20b859] text-white shadow-lg shadow-green-900/30"
                      : "bg-[#25D366] hover:bg-[#20b859] text-white shadow-md"
                  }`}
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
                  Bestellen via WhatsApp
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 flex-wrap text-xs text-slate-500 pt-2">
          {/* PayPal */}
          <span className="flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" fill="#009cde"/><path d="M6.635 6.891a.956.956 0 0 1 .944-.806h6.038a12.3 12.3 0 0 1 1.944.148 8.014 8.014 0 0 1 1.184.323c.29.104.557.23.806.38.232-1.481-.002-2.488-.8-3.399C15.836.982 14.05.5 11.772.5H4.31c-.524 0-.97.382-1.051.9L.622 20.8a.636.636 0 0 0 .628.74H5.13l1.505-9.592v-.029l-.001.029z" fill="#003087"/></svg>
          </span>
          {/* Visa */}
          <span className="flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
            <svg viewBox="0 0 48 16" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg"><path d="M18.09.9L11.7 15.1H7.7L4.57 3.96C4.38 3.2 4.21 2.93 3.62 2.6 2.65 2.07 1.05 1.58 0 1.28L.09.9h6.48c.83 0 1.57.55 1.76 1.5l1.61 8.56L13.97.9h4.12zm16.28 9.44c.02-4-5.53-4.22-5.49-6 .01-.54.53-1.12 1.66-1.27.56-.07 2.1-.13 3.85.67l.69-3.2A10.47 10.47 0 0 0 31.42 0c-3.88 0-6.61 2.06-6.63 5.01-.03 2.18 1.95 3.4 3.43 4.12 1.53.74 2.04 1.22 2.04 1.88-.01 1.01-1.22 1.46-2.35 1.48-1.97.03-3.12-.53-4.03-.96l-.71 3.33c.92.42 2.61.79 4.36.8 4.12 0 6.81-2.03 6.83-5.22zm10.23 4.76H48L44.9.9h-3.22c-.72 0-1.33.42-1.6 1.07L34.4 15.1h4.11l.82-2.26h5.02l.47 2.26zM40.5 9.64l2.06-5.68 1.19 5.68H40.5zM23.56.9L20.37 15.1h-3.92L19.63.9h3.93z" fill="#1a1f71"/></svg>
          </span>
          {/* Bitcoin */}
          <span className="flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.655-1.915l.003-.024zm-2.97 4.165c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z" fill="#f7931a"/></svg>
          </span>
          {/* SSL */}
          <span className="flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          {/* Binnen 5 min actief */}
          <span className="flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#ef4444]" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </span>
        </div>
      </motion.div>

      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent" /></div>

      {/* 5. TESTIMONIALS */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs text-[#ef4444] font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/10 font-roboto-slab">
            Klantreviews
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Wat onze klanten zeggen
          </h2>
          <div className="flex items-center justify-center gap-1 pt-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            <span className="text-sm font-bold text-slate-700 ml-2">4.9 / 5</span>
            <span className="text-xs text-slate-400 ml-1">(2.400+ reviews)</span>
          </div>
        </div>
        {/* Klant van de maand */}
        <div className="bg-gradient-to-r from-[#0d1117] to-[#1a1a2e] rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row gap-4 items-start border border-[#ef4444]/20">
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="relative">
              <img src="https://i.pravatar.cc/80?img=33" alt="" className="w-16 h-16 rounded-full border-2 border-[#ef4444] object-cover" />
              <span className="absolute -bottom-1 -right-1 bg-[#ef4444] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">⭐ MVP</span>
            </div>
            <span className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest whitespace-nowrap">Klant v/d Maand</span>
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_,i) => <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-amber-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
            </div>
            <p className="text-white text-sm leading-relaxed">"Al meer dan een jaar klant en ik zou nooit meer teruggaan. Eredivisie in 4K zonder buffering, support reageert binnen minuten en de prijs is onverslaanbaar. Heb inmiddels 6 vrienden doorverwezen!"</p>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-black text-white text-sm">Ahmed B.</span>
                <span className="text-slate-400 text-xs ml-2">Amsterdam · 15 maanden pakket</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Verified
              </span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              name: "Daan Visser",
              location: "Amsterdam",
              avatar: "D",
              color: "bg-red-500",
              rating: 5,
              text: "Binnen 3 minuten alles ingesteld op mijn Samsung TV. Beeld is scherp, geen enkele buffer. Eredivisie in 4K — absoluut de beste keuze.",
              plan: "6 Maanden pakket",
            },
            {
              name: "Sophie van der Berg",
              location: "Rotterdam",
              avatar: "S",
              color: "bg-emerald-500",
              rating: 5,
              text: "Super makkelijk via WhatsApp besteld. Ze reageerden binnen 2 minuten en alles werkte direct. NPO, RTL en alle Belgische zenders erbij — top!",
              plan: "3 Maanden pakket",
            },
            {
              name: "Bram de Jong",
              location: "Den Haag",
              avatar: "B",
              color: "bg-blue-500",
              rating: 5,
              text: "Al 8 maanden klant en nog geen enkele storing gehad. 24/7 support is echt goed — mijn vraag werd op zondag om 23u direct beantwoord.",
              plan: "15 Maanden pakket",
            },
            {
              name: "Lotte Bakker",
              location: "Utrecht",
              avatar: "L",
              color: "bg-red-500",
              rating: 5,
              text: "Werkt perfect op mijn Firestick en telefoon tegelijk. Alle Nederlandse zenders, sport én Netflix-kwaliteit films — alles in één app. Aanrader!",
              plan: "6 Maanden pakket",
            },
          ].map((r) => (
            <div key={r.name} className="glass-card rounded-2xl p-5 md:p-6 space-y-3 md:space-y-4 flex flex-col">
              <div className="flex items-center gap-1">
                {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed flex-1">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-white font-black text-base shrink-0`}>
                  {r.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{r.name}</div>
                  <div className="text-xs text-slate-400">{r.location} · {r.plan}</div>
                </div>
                <span className="ml-auto flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Customer photo strip */}
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <div className="flex items-center -space-x-3">
            {[
              "https://i.pravatar.cc/48?img=1",
              "https://i.pravatar.cc/48?img=5",
              "https://i.pravatar.cc/48?img=8",
              "https://i.pravatar.cc/48?img=12",
              "https://i.pravatar.cc/48?img=15",
              "https://i.pravatar.cc/48?img=20",
              "https://i.pravatar.cc/48?img=25",
              "https://i.pravatar.cc/48?img=29",
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                style={{ zIndex: 8 - i }}
              />
            ))}
            <div className="w-9 h-9 rounded-full border-2 border-white bg-[#ef4444] flex items-center justify-center text-white text-[10px] font-black shadow-sm" style={{ zIndex: 0 }}>
              +4K
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-black text-slate-900">4.800+</span> tevreden klanten in Nederland
          </div>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-amber-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
            <span className="text-xs font-bold text-slate-700 ml-1">4.9</span>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent" /></div>

      {/* COMPARISON TABLE */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black tracking-[0.25em] text-[#ef4444] uppercase bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full inline-block font-roboto-slab">Waarom goedkopeiptv?</span>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Wij vs. de rest</h2>
        </div>
        <div className="max-w-3xl mx-auto overflow-x-auto rounded-2xl border border-slate-200 shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white">
                <th className="text-left px-3 sm:px-5 py-3 sm:py-4 font-black text-xs sm:text-sm">Functie</th>
                <th className="px-2 sm:px-5 py-3 sm:py-4 font-black text-[#ef4444] text-xs sm:text-sm">goedkopeiptv</th>
                <th className="px-2 sm:px-5 py-3 sm:py-4 font-bold text-slate-400 text-xs sm:text-sm">Ziggo</th>
                <th className="px-2 sm:px-5 py-3 sm:py-4 font-bold text-slate-400 text-xs sm:text-sm">KPN</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Zenders", ours: "20.000+", ziggo: "~150", kpn: "~120" },
                { feature: "4K Ultra HD", ours: "✓", ziggo: "Beperkt", kpn: "Beperkt" },
                { feature: "Prijs", ours: "v.a. €34,99 / 3mnd", ziggo: "v.a. €50/mnd", kpn: "v.a. €45/mnd" },
                { feature: "Contract", ours: "Nee", ziggo: "2 jaar", kpn: "2 jaar" },
                { feature: "Internationaal", ours: "150+ landen", ziggo: "Beperkt", kpn: "Beperkt" },
                { feature: "Eredivisie", ours: "✓ Gratis", ziggo: "+€20", kpn: "+€20" },
                { feature: "Activatie", ours: "< 5 min", ziggo: "3–5 dgn", kpn: "3–5 dgn" },
                { feature: "Support", ours: "24/7 WA", ziggo: "Beperkt", kpn: "Beperkt" },
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 font-semibold text-slate-700 text-xs sm:text-sm">{row.feature}</td>
                  <td className="px-2 sm:px-5 py-2.5 sm:py-3.5 text-center font-black text-emerald-600 text-xs sm:text-sm">{row.ours}</td>
                  <td className="px-2 sm:px-5 py-2.5 sm:py-3.5 text-center text-slate-400 font-medium text-xs sm:text-sm">{row.ziggo}</td>
                  <td className="px-2 sm:px-5 py-2.5 sm:py-3.5 text-center text-slate-400 font-medium text-xs sm:text-sm">{row.kpn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent" /></div>

      {/* MINI ORDER MAP */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="shrink-0 relative w-36 h-44">
          <svg viewBox="0 0 140 175" className="w-full h-full" aria-hidden>
            <path d="M72,4 L80,3 L95,6 L108,12 L118,22 L122,34 L124,48 L120,60 L116,68 L122,76 L118,90 L113,104 L108,116 L100,130 L95,140 L90,148 L85,153 L78,150 L72,148 L66,145 L60,140 L54,132 L48,122 L44,112 L40,102 L36,92 L30,82 L22,74 L16,66 L20,58 L14,50 L18,40 L22,32 L28,22 L38,14 L50,8 L62,4 Z"
              fill="none" stroke="#334155" strokeWidth="1.2" />
            {[
              { x: 64, y: 42,  city: "Amsterdam",  delay: "0s" },
              { x: 48, y: 72,  city: "Rotterdam",   delay: "0.4s" },
              { x: 40, y: 65,  city: "Den Haag",    delay: "0.8s" },
              { x: 70, y: 62,  city: "Utrecht",     delay: "0.2s" },
              { x: 84, y: 96,  city: "Eindhoven",   delay: "0.6s" },
              { x: 100, y: 20, city: "Groningen",   delay: "1s" },
              { x: 62, y: 90,  city: "Tilburg",     delay: "0.9s" },
            ].map(({ x, y, city, delay }) => (
              <g key={city}>
                <circle cx={x} cy={y} r="6" fill="#ef4444" opacity="0.15" style={{ animation: `pulse-ring 2s ${delay} infinite` }} />
                <circle cx={x} cy={y} r="3" fill="#ef4444" />
              </g>
            ))}
          </svg>
        </div>
        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Live bestellingen</span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-900">Populair door heel Nederland</h3>
          <p className="text-sm text-slate-500 leading-relaxed font-roboto-slab">Elke minuut worden er nieuwe pakketten besteld. Van Groningen tot Maastricht — goedkopeiptv is de #1 keuze.</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {["Amsterdam", "Rotterdam", "Utrecht", "Eindhoven", "Groningen"].map(c => (
              <span key={c} className="text-xs bg-red-50 text-[#ef4444] border border-red-200 font-bold px-2.5 py-1 rounded-lg">{c}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* HOE HET WERKT */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black tracking-widest text-[#ef4444] uppercase bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full inline-block font-roboto-slab">
            In 3 stappen live
          </span>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Hoe het werkt</h2>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-0.5 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
              className="origin-left h-full"
              style={{ background: "repeating-linear-gradient(90deg,#ef4444 0,#ef4444 8px,transparent 8px,transparent 16px)" }}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Kies je pakket", desc: "Kies 3, 6 of 15 maanden — klik op 'Bestellen via WhatsApp' en stuur je bericht.", icon: Package },
            { step: "02", title: "Betaal veilig", desc: "Betaal via PayPal, Visa of Bitcoin. Volledig beveiligd met SSL-encryptie.", icon: Lock },
            { step: "03", title: "Direct actief", desc: "Binnen 5 minuten ontvang je je inloggegevens via WhatsApp en kun je beginnen.", icon: Zap },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="glass-card rounded-2xl p-5 md:p-6 flex flex-col items-center text-center gap-3 relative z-10"
            >
              <span className="absolute top-4 right-4 text-xs font-black text-slate-300 tracking-widest">{item.step}</span>
              <div className="w-14 h-14 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center ring-4 ring-white">
                <Icon className="w-6 h-6 text-[#ef4444]" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-base mb-1">{item.title}</div>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
            );
          })}
          </div>
        </div>
      </motion.div>

      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent" /></div>

      {/* WHATSAPP CHAT PREVIEW */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black tracking-widest text-[#ef4444] uppercase bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full inline-block font-roboto-slab">
            Zo makkelijk is het
          </span>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Bestel in 1 WhatsApp bericht</h2>
        </div>
        <div className="max-w-sm mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            {/* WA header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
              </div>
              <div>
                <div className="text-white font-bold text-sm">goedkopeiptv</div>
                <div className="text-[#b2dfdb] text-xs">🟢 Online — reageert binnen 2 min</div>
              </div>
            </div>
            {/* Chat body */}
            <div className="bg-[#ECE5DD] px-4 py-4 space-y-3" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c0b8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
              {/* User message */}
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[82%] shadow-sm">
                  <p className="text-[13px] text-slate-900 leading-snug">Hallo! Ik wil graag het 15 maanden pakket bestellen 🙏</p>
                  <p className="text-[10px] text-slate-400 text-right mt-1">14:32</p>
                </div>
              </div>
              {/* Typing indicator 1 */}
              <div className="flex justify-end">
                <div className="bg-[#25D366] rounded-2xl rounded-tr-sm px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  </div>
                </div>
              </div>
              {/* Agent reply */}
              <div className="flex justify-end">
                <div className="bg-[#25D366] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[82%] shadow-sm">
                  <p className="text-[13px] text-white leading-snug">Hoi! Top keuze 😊 Stuur je je naam en welk apparaat je gebruikt?</p>
                  <p className="text-[10px] text-white/70 text-right mt-1">14:32 ✓✓</p>
                </div>
              </div>
              {/* User reply */}
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[82%] shadow-sm">
                  <p className="text-[13px] text-slate-900 leading-snug">Lars, Samsung Smart TV</p>
                  <p className="text-[10px] text-slate-400 text-right mt-1">14:33</p>
                </div>
              </div>
              {/* Typing indicator 2 */}
              <div className="flex justify-end">
                <div className="bg-[#25D366] rounded-2xl rounded-tr-sm px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  </div>
                </div>
              </div>
              {/* Agent final */}
              <div className="flex justify-end">
                <div className="bg-[#25D366] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[82%] shadow-sm">
                  <p className="text-[13px] text-white leading-snug">✅ Lars, je account is <span className="font-black">actief</span>! Inloggegevens verstuurd 🚀</p>
                  <p className="text-[10px] text-white/70 text-right mt-1">14:35 ✓✓</p>
                </div>
              </div>
              {/* Time badge */}
              <div className="flex justify-center pt-1">
                <span className="bg-black/25 text-white text-[10px] font-semibold px-3 py-1 rounded-full">⚡ 3 minuten later — Lars kijkt al live</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent" /></div>

      {/* 6. FAQ */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs text-[#ef4444] font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/10 font-roboto-slab">
            Veelgestelde Vragen
          </span>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
            Alles wat je wilt weten
          </h2>
        </div>

        {/* Search bar */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              value={faqSearch}
              onChange={e => { setFaqSearch(e.target.value); setOpenFaqId(null); }}
              placeholder="Zoek een vraag…"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 focus:border-[#ef4444]"
            />
            {faqSearch && (
              <button onClick={() => setFaqSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.filter(f => !faqSearch || f.question.toLowerCase().includes(faqSearch.toLowerCase()) || f.answer.toLowerCase().includes(faqSearch.toLowerCase())).length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">Geen resultaten voor "<span className="font-bold text-slate-600">{faqSearch}</span>"</div>
          )}
          {faqs.filter(f => !faqSearch || f.question.toLowerCase().includes(faqSearch.toLowerCase()) || f.answer.toLowerCase().includes(faqSearch.toLowerCase())).map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-slate-400/10 transition"
                >
                  <span className="font-bold text-base text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  {isOpen
                    ? <ChevronUp className="w-5 h-5 text-[#ef4444] shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  }
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-slate-100 pt-4">
                        <p className="text-base text-slate-600 leading-relaxed">{faq.answer}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(faq.answer).catch(() => {});
                            setCopiedFaq(faq.id);
                            setTimeout(() => setCopiedFaq(null), 2000);
                          }}
                          className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        >
                          {copiedFaq === faq.id ? (
                            <><svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span className="text-emerald-500 font-bold">Gekopieerd!</span></>
                          ) : (
                            <><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Kopieer antwoord</span></>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. CTA */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-14 text-center glass-card-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.1),transparent_65%)]" />

        {/* Satisfaction seal */}
        <div className="absolute top-4 right-4 md:top-6 md:right-8 w-20 h-20 md:w-24 md:h-24 select-none pointer-events-none" aria-hidden>
          <svg viewBox="0 0 120 120" className="w-full h-full" style={{ animation: "spin 18s linear infinite" }}>
            <defs>
              <path id="sealCircle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
            </defs>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
            <circle cx="60" cy="60" r="44" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.3" />
            <text fontSize="9.5" fontWeight="900" fill="#ef4444" letterSpacing="2.2" fontFamily="Outfit, sans-serif">
              <textPath href="#sealCircle">100% TEVREDENHEID · IPTVKIJKEN ·</textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/40 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="text-5xl">🇳🇱</div>
          <h2 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight">
            De Beste Nederlandse IPTV Ervaring
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto font-roboto-slab">
            Stream alle Nederlandse zenders, Eredivisie, Champions League en duizenden internationale kanalen in 4K Ultra HD. Bestel nu via WhatsApp — binnen 5 minuten actief.
          </p>
          {/* QR code */}
          <div className="flex items-center justify-center gap-4 bg-white/60 border border-slate-200 rounded-2xl px-5 py-4 max-w-xs mx-auto">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://wa.me/447449708976%3Ftext%3DHallo%2C%20ik%20wil%20graag%20een%20IPTV%20pakket%20bestellen."
              alt="QR code WhatsApp"
              className="w-16 h-16 rounded-lg shrink-0"
            />
            <div className="text-left">
              <p className="text-xs font-black text-slate-900">Scan & bestel direct</p>
              <p className="text-xs text-slate-500 mt-0.5">Open WhatsApp op je telefoon of TV en scan de code.</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <button
              onClick={() => window.open(`https://wa.me/447449708976?text=${encodeURIComponent("Hallo, ik wil graag weten hoe ik IPTV kan instellen op mijn apparaat. Kunt u mij helpen met de installatie?")}`, "_blank")}
              className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20b859] text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
              Nu Bestellen via WhatsApp
            </button>
            <button
              onClick={() => { onSelectTab("support"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm px-6 py-4 rounded-2xl transition cursor-pointer"
            >
              Meer Informatie
            </button>
          </div>
        </div>
      </div>

      {/* 7. FOOTER */}
      <footer className="-mx-3 sm:-mx-4 md:-mx-8 lg:-mx-10 bg-[#0d1117] px-3 sm:px-4 md:px-8 lg:px-10 pt-14 pb-28 md:pb-8 space-y-10 mt-8">
        {/* Top row */}
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center">
              <div className="leading-none">
                <Wordmark className="text-white text-lg block" />
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              De #1 premium IPTV-aanbieder van Nederland. Alle zenders, sport en series in 4K — binnen 5 minuten actief via WhatsApp.
            </p>
            {/* WhatsApp CTA */}
            <button
              onClick={() => window.open(`https://wa.me/447449708976?text=${encodeURIComponent("Hallo, ik heb een vraag over goedkopeiptv. Kunt u mij helpen?")}`, "_blank")}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20b859] text-white text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer w-fit"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
              Direct contact via WhatsApp
            </button>
          </div>

          {/* Service links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Service</h4>
            <ul className="space-y-3">
              {[
                { label: "Abonnementen & Prijzen", tab: "subscription" },
                { label: "Installatiegids", tab: "support" },
                { label: "Helpdesk & Support", tab: "support" },
                { label: "WhatsApp Bestellen", tab: null },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => item.tab ? (onSelectTab(item.tab), window.scrollTo({ top: 0, behavior: "smooth" })) : window.open(`https://wa.me/447449708976?text=${encodeURIComponent("Hallo, ik heb een vraag over goedkopeiptv. Kunt u mij helpen?")}`, "_blank")}
                    className="text-sm text-slate-400 hover:text-[#ef4444] transition flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#ef4444]/40 group-hover:bg-[#ef4444] transition" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & payment */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Betaalmethoden</h4>
            <div className="flex flex-wrap gap-2">
              {["🅿 PayPal", "💳 Visa", "₿ Bitcoin", "🔐 SSL"].map(m => (
                <span key={m} className="text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">{m}</span>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-500 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between"><span>Encryptie</span><span className="text-emerald-400">TLS 1.3</span></div>
              <div className="flex justify-between"><span>Server</span><span className="text-slate-300">NL — Amsterdam</span></div>
              <div className="flex justify-between"><span>Uptime</span><span className="text-emerald-400">99.9%</span></div>
              <div className="flex justify-between"><span>Activatie</span><span className="text-[#ef4444]">≤ 5 minuten</span></div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-600">© 2026 goedkopeiptv. Alle rechten voorbehouden.</span>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <button className="hover:text-slate-400 transition">Algemene Voorwaarden</button>
            <button className="hover:text-slate-400 transition">Privacybeleid</button>
            <button className="hover:text-slate-400 transition">AVG / GDPR</button>
          </div>
        </div>
      </footer>

      {/* ORDER CONFIRMATION MODAL */}
      <AnimatePresence>
        {showQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowQuiz(false)}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 space-y-6"
            >
              {quizStep < 3 ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[#ef4444] uppercase tracking-widest">Stap {quizStep + 1} van 3</span>
                      <button onClick={() => setShowQuiz(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-[#ef4444] rounded-full transition-all duration-500" style={{ width: `${((quizStep + 1) / 3) * 100}%` }} /></div>
                    <h3 className="text-lg font-black text-slate-900 pt-2">{QUIZ_STEPS[quizStep].q}</h3>
                  </div>
                  <div className="space-y-2">
                    {QUIZ_STEPS[quizStep].opts.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => { setQuizAnswers(a => [...a, opt.label]); setQuizStep(s => s + 1); }}
                        className="w-full text-left px-4 py-3 rounded-2xl border border-slate-200 hover:border-[#ef4444] hover:bg-red-50 font-semibold text-slate-800 text-sm transition cursor-pointer flex items-center gap-3"
                      >
                        <span className="text-[#ef4444] shrink-0">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-4xl">🎉</div>
                  <h3 className="text-xl font-black text-slate-900">Jouw beste keuze:</h3>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-2xl font-black text-[#ef4444]">{quizResult} pakket</p>
                    <p className="text-sm text-slate-500 mt-1">Gebaseerd op jouw antwoorden</p>
                  </div>
                  <button
                    onClick={() => { setShowQuiz(false); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }}
                    className="w-full bg-[#25D366] hover:bg-[#20b859] text-white font-black py-3.5 rounded-2xl transition cursor-pointer"
                  >
                    Bekijk het {quizResult} pakket →
                  </button>
                  <button onClick={() => setShowQuiz(false)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Sluiten</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
        {orderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setOrderModal(null)}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 space-y-5"
            >
              {/* Progress steps */}
              <div className="flex items-center justify-center gap-0">
                {[{ n: "1", label: "Pakket" }, { n: "2", label: "Betaal" }, { n: "3", label: "Actief" }].map((s, i) => (
                  <React.Fragment key={s.n}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-[#ef4444] text-white" : i === 1 ? "bg-[#ef4444] text-white" : "bg-slate-100 text-slate-400"}`}>
                        {i < 2 ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : s.n}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${i < 2 ? "text-[#ef4444]" : "text-slate-400"}`}>{s.label}</span>
                    </div>
                    {i < 2 && <div className={`h-0.5 w-10 mb-4 ${i === 0 ? "bg-[#ef4444]" : "bg-slate-200"}`} />}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-100 mx-auto">
                  <ShoppingCart className="w-7 h-7 text-[#ef4444]" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Bevestig je bestelling</h3>
                <p className="text-xs text-slate-500">Controleer je keuze voordat je naar WhatsApp gaat</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 font-medium">Pakket</span><span className="font-black text-slate-900">{orderModal.plan}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-medium">Duur</span><span className="font-black text-slate-900">{orderModal.period}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-medium">Schermen</span><span className="font-black text-slate-900">{orderModal.screens}x</span></div>
                {orderModal.vpn && <div className="flex justify-between"><span className="text-slate-500 font-medium">VPN</span><span className="font-black text-emerald-600">Inbegrepen (+€10)</span></div>}
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="font-black text-slate-900">Totaal</span>
                  <span className="text-2xl font-black text-[#ef4444]">€{orderModal.price.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => { openWhatsApp(orderModal.plan, orderModal.period, orderModal.price, orderModal.vpn, orderModal.screens); setOrderModal(null); }}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20b859] text-white font-black text-sm py-4 rounded-2xl transition active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
                  Bestellen via WhatsApp
                </button>
                <button onClick={() => setOrderModal(null)} className="w-full text-xs text-slate-400 hover:text-slate-600 py-2 cursor-pointer transition">Annuleren</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
