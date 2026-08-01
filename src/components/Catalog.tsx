import { useState } from "react";
import { MovieOrSeries, Episode } from "../types";
import { Search, Play, Star, Clock, User, Film, Tv, X, ChevronRight, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CatalogProps {
  moviesAndSeries: MovieOrSeries[];
  onPlayMedia: (media: MovieOrSeries, episode?: Episode) => void;
}

export default function Catalog({ moviesAndSeries, onPlayMedia }: CatalogProps) {
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<"all" | "movie" | "series">("all");
  const [selectedGenre, setSelectedGenre] = useState("Alle");

  // Detail Modal State
  const [selectedMedia, setSelectedMedia] = useState<MovieOrSeries | null>(null);

  // List of all genres for buttons
  const genresList = ["Alle", "Drama", "Thriller", "Crime", "Oorlog", "Komedie", "Romantiek", "Biografie", "Actie", "Geschiedenis"];

  // Filtering movies based on search and selected tabs
  const filteredMedia = moviesAndSeries.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.cast.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = activeType === "all" || item.type === activeType;
    const matchesGenre = selectedGenre === "Alle" || item.genre.includes(selectedGenre);

    return matchesSearch && matchesType && matchesGenre;
  });

  // Highlighted Featured Movie (Interstellar Journey or first trending item)
  const featured = moviesAndSeries.find((item) => item.isTrending && item.type === "movie") || moviesAndSeries[0];

  return (
    <div id="iptv-catalog-panel" className="space-y-8">
      
      {/* Immersive Featured Spotlight Banner */}
      {featured && !searchQuery && (
        <div 
          className="relative rounded-3xl overflow-hidden aspect-[21/9] md:aspect-[25/9] w-full border border-slate-800 shadow-2xl flex items-end group"
          id="catalog-featured-spotlight"
        >
          {/* Backdrop Graphic Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={featured.backdrop} 
              alt={featured.title} 
              className="w-full h-full object-cover filter brightness-[0.4] transition-all duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e2235] via-[#0b0f19]/40 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#1e2235] to-transparent" />
          </div>

          {/* Banner Contents */}
          <div className="relative z-10 p-6 md:p-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] bg-[#E0345F] text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-mono glow-red-sm">
🇳🇱 TRENDING NL
              </span>
              <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                {featured.rating} beoordeling
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {featured.title}
            </h2>

            <p className="text-slate-300 mt-2.5 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
              {featured.description}
            </p>

            <div className="flex items-center gap-3.5 mt-5">
              <button
                onClick={() => onPlayMedia(featured)}
                className="bg-[#E0345F] hover:bg-rose-600 text-white text-xs md:text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition transform active:scale-95 cursor-pointer glow-red-button"
                id="btn-play-featured"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Nu Kijken</span>
              </button>

              <button
                onClick={() => setSelectedMedia(featured)}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs md:text-sm font-semibold px-5 py-2.5 rounded-xl backdrop-blur-sm transition cursor-pointer"
              >
                Meer Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar controls */}
      <div className="glass-card rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Type selector Tabs (All, Movies, Series) */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveType("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide transition cursor-pointer ${
              activeType === "all" ? "bg-[#E0345F] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Alles
          </button>
          <button
            onClick={() => setActiveType("movie")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide transition cursor-pointer ${
              activeType === "movie" ? "bg-[#E0345F] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Films
          </button>
          <button
            onClick={() => setActiveType("series")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide transition cursor-pointer ${
              activeType === "series" ? "bg-[#E0345F] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Series
          </button>
        </div>

        {/* Search input field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek films, series, acteurs..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#E0345F] outline-none transition"
            id="catalog-search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Genre Filter Carousel tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
        {genresList.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`text-xs font-black px-4 py-2 rounded-xl shrink-0 transition-all border cursor-pointer ${
              selectedGenre === g
                ? "bg-[#E0345F] text-white border-[#E0345F] shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-[#E0345F]"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {filteredMedia.map((item) => (
          <div 
            key={item.id}
            id={`catalog-item-${item.id}`}
            onClick={() => setSelectedMedia(item)}
            className="group cursor-pointer glass-card rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 hover:glass-card transition-all duration-300 flex flex-col h-full"
          >
            {/* Poster Thumbnail */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
              <img 
                src={item.poster} 
                alt={item.title} 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayMedia(item);
                  }}
                  className="w-full bg-[#E0345F] hover:bg-rose-600 text-white font-extrabold text-xs py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 transition glow-red-button"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Nu Kijken
                </button>
              </div>

              {/* Rating tag top-left */}
              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-[10px] text-amber-400 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current" />
                {item.rating}
              </div>

              {/* Media type tag top-right */}
              <div className="absolute top-2.5 right-2.5 bg-slate-50/75 backdrop-blur-md text-[9px] text-slate-800 uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 rounded">
                {item.type}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#10b981] transition">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-mono">
                  <span>{item.year}</span>
                  <span>•</span>
                  <span>{item.duration}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-2.5">
                {item.genre.slice(0, 2).map((g) => (
                  <span key={g} className="text-[9px] bg-[#E0345F]/10 border border-[#E0345F]/25 text-[#E0345F] px-1.5 py-0.5 rounded-md font-bold">
                    {g}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-6 text-center py-20 bg-white/30 border border-slate-200 rounded-3xl">
            <Search className="w-12 h-12 text-slate-900 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-600">Geen resultaten gevonden</h3>
            <p className="text-xs text-slate-700 mt-1">Probeer een andere zoekterm of categorie.</p>
          </div>
        )}
      </div>

      {/* Media Details Interactive Modal popup */}
      <AnimatePresence>
        {selectedMedia && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
              id="catalog-detail-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur border border-slate-800/80 p-2 text-slate-600 hover:text-white rounded-full transition cursor-pointer"
                id="modal-close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Poster Backdrop Header */}
              <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-slate-900">
                <img 
                  src={selectedMedia.backdrop} 
                  alt={selectedMedia.title} 
                  className="w-full h-full object-cover filter brightness-[0.5]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-end gap-5">
                  <div className="hidden sm:block w-24 rounded-xl border-2 border-slate-800 overflow-hidden shadow-2xl relative -mb-10 aspect-[2/3] bg-black">
                    <img 
                      src={selectedMedia.poster} 
                      alt={selectedMedia.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] bg-[#E0345F] text-white px-1.5 py-0.5 rounded font-extrabold font-mono uppercase glow-red-sm">
                        {selectedMedia.type}
                      </span>
                      <span className="text-xs font-mono text-slate-600 font-semibold">{selectedMedia.year}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {selectedMedia.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Information body grid */}
              <div className="p-6 pt-14 sm:pt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 2/3 Content Info */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-600 uppercase tracking-widest font-mono">
                      SYNOPSIS
                    </h4>
                    <p className="text-slate-300 text-xs md:text-sm mt-1.5 leading-relaxed">
                      {selectedMedia.description}
                    </p>
                  </div>

                  {/* Cast list block */}
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-600 uppercase tracking-widest font-mono">
                      CAST
                    </h4>
                    <div className="flex flex-wrap gap-2.5 mt-2">
                      {selectedMedia.cast.map((actor) => (
                        <span key={actor} className="text-xs bg-slate-50 border border-slate-800 text-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-700" />
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* If series: render season episodes */}
                  {selectedMedia.type === "series" && selectedMedia.episodes && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                        <h4 className="font-extrabold text-xs text-slate-600 uppercase tracking-widest font-mono">
                          AFLEVERINGEN (Seizoen 1)
                        </h4>
                        <span className="text-[11px] text-slate-700">{selectedMedia.episodes.length} Afleveringen</span>
                      </div>
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {selectedMedia.episodes.map((ep) => (
                          <div 
                            key={ep.id}
                            id={`ep-select-${ep.id}`}
                            onClick={() => {
                              onPlayMedia(selectedMedia, ep);
                              setSelectedMedia(null);
                            }}
                            className="bg-slate-50 border border-slate-800 hover:border-[#10b981]/50 hover:bg-slate-400/10 p-2.5 rounded-xl flex items-center gap-3 cursor-pointer group/ep"
                          >
                            <div className="w-16 aspect-video rounded-lg overflow-hidden bg-slate-900 relative shrink-0">
                              <img 
                                src={ep.thumbnail} 
                                alt={ep.title} 
                                className="w-full h-full object-cover filter brightness-75 group-hover/ep:scale-105 transition"
                                referrerPolicy="no-referrer"
                              />
                              <PlayCircle className="absolute inset-0 m-auto w-5 h-5 text-white/80 group-hover/ep:text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono text-[#10b981] font-bold block">
                                Aflevering {ep.episodeNumber}
                              </span>
                              <span className="font-bold text-xs text-slate-900 group-hover/ep:text-[#10b981] block truncate">
                                {ep.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-700 px-2 shrink-0">{ep.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* 1/3 Quick Meta list */}
                <div className="bg-slate-50 border border-slate-800 p-4 rounded-xl flex flex-col gap-4 self-start">
                  
                  {/* Rating item */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700">Globale Score</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4.5 h-4.5 fill-current" />
                      {selectedMedia.rating} / 10
                    </span>
                  </div>

                  {/* Year */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700">Uitjaar</span>
                    <span className="font-semibold text-slate-900">{selectedMedia.year}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700">Speelduur</span>
                    <span className="font-semibold text-slate-900">{selectedMedia.duration}</span>
                  </div>

                  {/* Audio Format */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700">Audiocodec</span>
                    <span className="font-semibold text-slate-800">Dolby Atmos Digital</span>
                  </div>

                  {/* Action Direct Stream Button */}
                  <button
                    onClick={() => {
                      onPlayMedia(selectedMedia);
                      setSelectedMedia(null);
                    }}
                    className="w-full bg-[#E0345F] hover:bg-rose-600 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 mt-2 cursor-pointer glow-red-button"
                    id="btn-modal-stream"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Film Nu Kijken</span>
                  </button>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
