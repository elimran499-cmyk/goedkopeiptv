import { useState, useEffect, useRef } from "react";
import { IPTVChannel, MovieOrSeries, Episode } from "../types";
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  RotateCcw, SkipForward, Radio, Heart, HelpCircle, 
  Settings, Layers, Tv, ChevronRight, Activity, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MediaPlayerProps {
  initialActiveChannel?: IPTVChannel | null;
  initialActiveMovie?: MovieOrSeries | null;
  initialActiveEpisode?: Episode | null;
  channels: IPTVChannel[];
  onToggleFavorite: (channelId: string) => void;
  favoriteChannels: string[];
}

export default function MediaPlayer({
  initialActiveChannel,
  initialActiveMovie,
  initialActiveEpisode,
  channels,
  onToggleFavorite,
  favoriteChannels,
}: MediaPlayerProps) {
  // Navigation stream states
  const [activeChannel, setActiveChannel] = useState<IPTVChannel | null>(initialActiveChannel || null);
  const [activeMovie, setActiveMovie] = useState<MovieOrSeries | null>(initialActiveMovie || null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(initialActiveEpisode || null);

  // Player configurations
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(25); // initial simulated progress for VOD
  const [duration, setDuration] = useState("02:14:32");
  const [currentTime, setCurrentTime] = useState("00:33:45");
  const [quality, setQuality] = useState("Source");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isZapping, setIsZapping] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [playerCategory, setPlayerCategory] = useState<string>("All");

  // Dynamic viewer count jitter
  const [liveViewers, setLiveViewers] = useState(0);

  // Refs for tracking elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize when parent passes down media
  useEffect(() => {
    if (initialActiveChannel) {
      triggerZapping();
      setActiveChannel(initialActiveChannel);
      setActiveMovie(null);
      setActiveEpisode(null);
    }
  }, [initialActiveChannel]);

  useEffect(() => {
    if (initialActiveMovie) {
      triggerZapping();
      setActiveMovie(initialActiveMovie);
      setActiveChannel(null);
      if (initialActiveEpisode) {
        setActiveEpisode(initialActiveEpisode);
      } else if (initialActiveMovie.episodes && initialActiveMovie.episodes.length > 0) {
        setActiveEpisode(initialActiveMovie.episodes[0]);
      } else {
        setActiveEpisode(null);
      }
    }
  }, [initialActiveMovie, initialActiveEpisode]);

  // Set initial viewers and jitter them
  useEffect(() => {
    if (activeChannel) {
      setLiveViewers(activeChannel.viewers);
      const interval = setInterval(() => {
        setLiveViewers((prev) => {
          const delta = Math.floor((Math.random() - 0.5) * 120);
          return Math.max(100, prev + delta);
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeChannel]);

  // Simulate video playback timers for VOD
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && (activeMovie || activeEpisode)) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.1;
        });

        // Simulating beautiful time tick
        setCurrentTime((prev) => {
          const parts = prev.split(":").map(Number);
          let hours = parts[0];
          let minutes = parts[1];
          let seconds = parts[2] + 1;

          if (seconds >= 60) {
            seconds = 0;
            minutes += 1;
          }
          if (minutes >= 60) {
            minutes = 0;
            hours += 1;
          }

          const hStr = hours.toString().padStart(2, "0");
          const mStr = minutes.toString().padStart(2, "0");
          const sStr = seconds.toString().padStart(2, "0");
          return `${hStr}:${mStr}:${sStr}`;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeMovie, activeEpisode]);

  const triggerZapping = () => {
    setIsZapping(true);
    setIsPlaying(false);
    const timeout = setTimeout(() => {
      setIsZapping(false);
      setIsPlaying(true);
      // reset random start times for VOD when zapped
      setProgress(Math.floor(Math.random() * 40));
      setCurrentTime(`00:${Math.floor(Math.random() * 20 + 10)}:${Math.floor(Math.random() * 50)}`);
    }, 650);
    return () => clearTimeout(timeout);
  };

  // Fullscreen handle
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error enabling fullscreen", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const categories = ["All", "Sports", "News", "Movies", "Documentaries", "Entertainment"];
  const filteredChannels = channels.filter(
    (ch) => playerCategory === "All" || ch.category === playerCategory
  );

  const activeMediaTitle = activeChannel 
    ? activeChannel.name 
    : activeMovie 
      ? `${activeMovie.title}${activeEpisode ? ` - S${activeEpisode.seasonNumber}E${activeEpisode.episodeNumber}: ${activeEpisode.title}` : ""}`
      : "No Media Selected";

  const streamSrc = activeChannel 
    ? activeChannel.streamUrl 
    : activeMovie 
      ? activeMovie.videoUrl 
      : "";

  return (
    <div id="iptv-player-screen" className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-130px)]">
      
      {/* 3/4 Area: Video Player & Controls */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        
        {/* Header Metadata */}
        <div className="flex items-center justify-between glass-card backdrop-blur border border-slate-200 px-5 py-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            {activeChannel ? (
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 text-xl flex items-center justify-center">
                {activeChannel.logo}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800">
                <img 
                  src={activeMovie?.poster || "https://picsum.photos/seed/placeholder/80/120"} 
                  alt={activeMovie?.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-white tracking-tight truncate">
                  {activeMediaTitle}
                </h1>
                {activeChannel && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 truncate mt-0.5">
                {activeChannel 
                  ? `${activeChannel.category} • HD Dual Audio • ${liveViewers.toLocaleString()} watching`
                  : `${activeMovie?.genre.join(", ")} • Released ${activeMovie?.year} • Rating ${activeMovie?.rating}/10`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeChannel && (
              <button
                onClick={() => onToggleFavorite(activeChannel.id)}
                className={`p-2.5 rounded-lg border transition ${
                  favoriteChannels.includes(activeChannel.id)
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20"
                    : "bg-slate-800/40 border-slate-700/50 text-slate-600 hover:text-white hover:bg-slate-800"
                }`}
                title="Favorite Channel"
                id={`fav-toggle-${activeChannel.id}`}
              >
                <Heart className="w-5 h-5" fill={favoriteChannels.includes(activeChannel.id) ? "currentColor" : "none"} />
              </button>
            )}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-2.5 rounded-lg border transition ${
                showStats 
                  ? "bg-orange-500/15 border-orange-500/40 text-orange-400"
                  : "bg-slate-800/40 border-slate-700/50 text-slate-600 hover:text-white"
              }`}
              title="Stream Diagnostics"
            >
              <Activity className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          className="relative bg-black rounded-2xl overflow-hidden aspect-video w-full border border-slate-800 shadow-2xl flex items-center justify-center group select-none"
        >
          {/* Main Video Element */}
          <video
            ref={videoRef}
            src={streamSrc}
            autoPlay={isPlaying}
            muted={isMuted}
            playsInline
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Diagnostics Overlay Panel */}
          {showStats && (
            <div className="absolute top-4 left-4 z-20 bg-slate-900/95 border border-slate-800 p-4 rounded-xl text-[11px] font-mono text-emerald-400 space-y-1.5 max-w-xs backdrop-blur shadow-2xl">
              <div className="text-slate-300 font-bold border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
                <span>GATEWAY ANALYTICS</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p>Format: {activeChannel ? "HLS Streaming (.ts)" : "VOD MP4 Progressive"}</p>
              <p>Active Bitrate: {activeChannel ? "6,240 kbps" : "8,450 kbps"}</p>
              <p>Resolution: {activeChannel ? activeChannel.resolution : "4K UHD"}</p>
              <p>Codec: H.264 / AAC High Profile</p>
              <p>Buffer Ahead: 12.4s (Constant)</p>
              <p>Packet Loss: 0.00%</p>
              <p>Connected Edge Server: Lon-Edge-90</p>
            </div>
          )}

          {/* Quick Zapping Screen Overlay */}
          <AnimatePresence>
            {isZapping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-slate-900/95 flex flex-col items-center justify-center gap-4"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-t-2 border-r-2 border-red-500 animate-spin" />
                  <Radio className="w-5 h-5 text-red-400 absolute animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-slate-900 uppercase tracking-widest font-mono">
                    Securing Stream Link...
                  </p>
                  <p className="text-xs text-slate-700 mt-1">
                    Optimizing anti-freeze buffer
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play/Pause Center Indicator on Tap */}
          {!isPlaying && !isZapping && (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 hover:bg-black/50 transition duration-300"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/30 transition transform hover:scale-110"
              >
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </motion.div>
            </button>
          )}

          {/* Player controls bottom bar */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-5 pt-12 z-15 flex flex-col gap-4"
              >
                
                {/* Progress bar for VOD only */}
                {(activeMovie || activeEpisode) && (
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-600">{currentTime}</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group/progress">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-fuchsia-500 rounded-full relative" 
                        style={{ width: `${progress}%` }}
                      >
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition" />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600">{duration}</span>
                  </div>
                )}

                {/* Primary Button Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    
                    {/* Play Button */}
                    {isPlaying ? (
                      <button 
                        onClick={() => setIsPlaying(false)}
                        className="text-slate-900 hover:text-white transition transform active:scale-95"
                        title="Pause"
                      >
                        <Pause className="w-5 h-5 fill-slate-200 hover:fill-white" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsPlaying(true)}
                        className="text-slate-900 hover:text-white transition transform active:scale-95"
                        title="Play"
                      >
                        <Play className="w-5 h-5 fill-slate-200 hover:fill-white" />
                      </button>
                    )}

                    {/* Quick back and skip for Movies/Series */}
                    {(activeMovie || activeEpisode) && (
                      <>
                        <button 
                          onClick={() => setProgress(Math.max(0, progress - 5))}
                          className="text-slate-600 hover:text-white transition"
                          title="Rewind 5s"
                        >
                          <RotateCcw className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => setProgress(Math.min(100, progress + 5))}
                          className="text-slate-600 hover:text-white transition"
                          title="Skip 5s"
                        >
                          <SkipForward className="w-4.5 h-4.5" />
                        </button>
                      </>
                    )}

                    {/* Volume Controls */}
                    <div className="flex items-center gap-2 group/volume">
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-slate-300 hover:text-white transition"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(Number(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-16 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-500 opacity-60 group-hover/volume:opacity-100 transition duration-300"
                        title="Volume Level"
                      />
                    </div>

                    {/* Resolution / Latency badge */}
                    <div className="hidden sm:flex items-center gap-2 text-[10px] bg-slate-800/60 border border-slate-700/40 px-2 py-0.5 rounded font-mono text-slate-800">
                      <span>{activeChannel ? activeChannel.resolution : "4K UHD"}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{activeChannel ? "45ms Jitter" : "Direct Feed"}</span>
                    </div>
                  </div>

                  {/* Right hand layout icons */}
                  <div className="flex items-center gap-4">
                    
                    {/* Quality selector dropdown style */}
                    <div className="flex items-center gap-1.5 bg-slate-200/60 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-800">
                      <Layers className="w-3.5 h-3.5 text-red-400" />
                      <select 
                        value={quality} 
                        onChange={(e) => {
                          setQuality(e.target.value);
                          triggerZapping();
                        }}
                        className="bg-transparent border-none outline-none focus:ring-0 cursor-pointer text-slate-900"
                        title="Stream Resolution Link"
                      >
                        <option value="Source" className="bg-slate-50">Source (Auto)</option>
                        <option value="1080p" className="bg-slate-50">1080p FHD</option>
                        <option value="720p" className="bg-slate-50">720p HD</option>
                        <option value="480p" className="bg-slate-50">480p SD</option>
                      </select>
                    </div>

                    {/* Fullscreen Button */}
                    <button 
                      onClick={handleFullscreen}
                      className="text-slate-300 hover:text-white transition"
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Live EPG Program Guide Card */}
        {activeChannel && (
          <div className="glass-card p-5 rounded-xl shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-orange-400" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono">
                  Electronic TV Program Guide (EPG)
                </h3>
              </div>
              <span className="text-xs text-orange-400 font-medium bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                7 Days Catch-Up Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Airing now */}
              <div className="bg-slate-50 border border-slate-800 p-4 rounded-xl flex items-start gap-3.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded shrink-0">
                  Airing Now
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-950 mt-0.5 group-hover:text-emerald-400 transition">
                    {activeChannel.category === "Sports" ? "Live: Ultimate Matchday Arena" : 
                     activeChannel.category === "News" ? "Global Report: Breaking Headlines" : 
                     activeChannel.category === "Movies" ? "CineSpectacular: Box Office Hit" :
                     "Prime Time Evening Broadcast"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    18:00 - 19:30 • Full coverage with immersive stadium sound & live telemetry analysis.
                  </p>
                  {/* Progress of show */}
                  <div className="mt-3.5 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-700">65% (45m left)</span>
                  </div>
                </div>
              </div>

              {/* Airing next */}
              <div className="bg-slate-50 border border-slate-800 p-4 rounded-xl flex items-start gap-3.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded shrink-0">
                  Up Next
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-950 mt-0.5 group-hover:text-orange-400 transition">
                    {activeChannel.category === "Sports" ? "Post-Match Analysis & Recap" : 
                     activeChannel.category === "News" ? "Deep Dive Insight: Planet Economics" : 
                     activeChannel.category === "Movies" ? "Late Night Suspense Selection" :
                     "Late Night Talkshow & Guest Panels"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    19:30 - 21:00 • High-definition analysis featuring veteran studio hosts and global analysts.
                  </p>
                  <p className="text-[10px] font-mono text-orange-400 mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Starts in 45 minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 1/4 Area: Channel list & Selector */}
      <div className="lg:col-span-1 glass-card rounded-2xl p-4 shadow-lg flex flex-col h-[calc(100vh-130px)] lg:sticky lg:top-24">
        
        {/* Search header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Tv className="w-5 h-5 text-orange-400" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider font-mono">
              Quick Stream Switcher
            </h3>
          </div>

          {/* Tab Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => setPlayerCategory(cat)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 transition ${
                  playerCategory === cat
                    ? "bg-orange-600 text-white"
                    : "bg-slate-50 text-slate-600 border border-slate-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable channels list */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-2.5 pr-1">
          {filteredChannels.map((ch) => {
            const isChActive = activeChannel?.id === ch.id;
            const isChFav = favoriteChannels.includes(ch.id);
            return (
              <button
                key={ch.id}
                id={`player-ch-select-${ch.id}`}
                onClick={() => {
                  if (activeChannel?.id !== ch.id) {
                    triggerZapping();
                    setActiveChannel(ch);
                    setActiveMovie(null);
                    setActiveEpisode(null);
                  }
                }}
                className={`w-full text-left p-3 rounded-xl border flex items-center gap-3.5 transition group relative ${
                  isChActive
                    ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/40 shadow-inner"
                    : "bg-slate-50/75 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                {/* Active left bar */}
                {isChActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-orange-500 rounded-r" />
                )}

                {/* Logo */}
                <div className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center shrink-0 ${
                  isChActive ? "bg-orange-500/20 text-white" : "bg-slate-800/30 text-slate-800"
                }`}>
                  {ch.logo}
                </div>

                {/* Info details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`font-semibold text-xs truncate ${isChActive ? "text-orange-300 font-bold" : "text-slate-900 group-hover:text-white"}`}>
                      {ch.name}
                    </span>
                    {isChFav && (
                      <Heart className="w-3 h-3 text-rose-500 shrink-0" fill="currentColor" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1">
                    <span>{ch.resolution} • {ch.language}</span>
                    <span className="flex items-center gap-1 shrink-0 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {(ch.viewers / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-slate-600 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            );
          })}

          {filteredChannels.length === 0 && (
            <div className="text-center py-12 px-4 bg-slate-200/40 rounded-xl border border-slate-200">
              <Tv className="w-8 h-8 text-slate-800 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">No Channels Found</p>
              <p className="text-[10px] text-slate-700 mt-1">Try resetting the category filter above.</p>
            </div>
          )}
        </div>

        {/* Total Channels indicator */}
        <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-700 text-center font-mono">
          Showing {filteredChannels.length} of {channels.length} Live Channels
        </div>
      </div>

    </div>
  );
}
