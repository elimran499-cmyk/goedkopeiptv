import { useState, useEffect, FormEvent } from "react";
import { PlaylistItem, SpeedTestData } from "../types";
import { 
  Plus, Check, Trash2, AlertCircle, Play, Laptop, Smartphone, Tv, 
  Activity, ArrowUpRight, HelpCircle, HardDrive, RefreshCw, Radio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  playlists: PlaylistItem[];
  onAddPlaylist: (name: string, url: string) => void;
  onDeletePlaylist: (id: string) => void;
  totalChannelsCount: number;
}

interface DeviceSession {
  id: string;
  name: string;
  deviceType: "TV" | "Mobile" | "Tablet" | "Desktop";
  location: string;
  resolution: string;
  uptime: string;
  ipAddress: string;
}

export default function Dashboard({ playlists, onAddPlaylist, onDeletePlaylist, totalChannelsCount }: DashboardProps) {
  // Playlist add Form states
  const [playlistName, setPlaylistName] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Speed test simulation states
  const [speedTest, setSpeedTest] = useState<SpeedTestData>({
    latency: 0,
    downloadSpeed: 0,
    status: "idle",
  });
  const [testProgress, setTestProgress] = useState(0);

  // Active connected devices state
  const [devices, setDevices] = useState<DeviceSession[]>([
    { id: "dev-1", name: "LG OLED Smart TV", deviceType: "TV", location: "Woonkamer", resolution: "4K UHD", uptime: "2h 15m", ipAddress: "192.168.1.14" },
    { id: "dev-2", name: "iPhone 15 Pro Max", deviceType: "Mobile", location: "Mobiel Netwerk", resolution: "FHD (1080p)", uptime: "14m", ipAddress: "172.56.21.90" },
    { id: "dev-3", name: "MacBook Pro M3", deviceType: "Desktop", location: "Thuiskantoor", resolution: "FHD (1080p)", uptime: "1h 40m", ipAddress: "192.168.1.28" },
  ]);

  // Playlist Importer Handler
  const handleImportPlaylist = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setImportSuccess(false);

    if (!playlistName.trim()) {
      setFormError("Naam afspeellijst is verplicht");
      return;
    }
    if (!playlistUrl.trim() || !playlistUrl.startsWith("http")) {
      setFormError("Voer een geldige M3U HTTP-URL in");
      return;
    }

    setIsImporting(true);
    setTimeout(() => {
      onAddPlaylist(playlistName, playlistUrl);
      setIsImporting(false);
      setImportSuccess(true);
      setPlaylistName("");
      setPlaylistUrl("");

      // Hide success flag after 4 seconds
      setTimeout(() => setImportSuccess(false), 4000);
    }, 1800);
  };

  // Speed test simulator
  const runSpeedTest = () => {
    setSpeedTest({ latency: 0, downloadSpeed: 0, status: "running" });
    setTestProgress(0);

    const interval = setInterval(() => {
      setTestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSpeedTest({
            latency: Math.floor(Math.random() * 15) + 8, // 8-23ms
            downloadSpeed: Math.floor(Math.random() * 180) + 120, // 120-300 Mbps
            status: "completed",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 120);
  };

  // Disconnect active devices
  const handleKickDevice = (id: string) => {
    setDevices(devices.filter((dev) => dev.id !== id));
  };

  // Static stats values
  const systemStatus = {
    connectedDevicesCount: devices.length,
    bufferRate: "99.98%",
    bandwidthUsage: "14.2 GB",
    streamPing: "18 ms",
  };

  return (
    <div id="iptv-dashboard-panel" className="space-y-8">
      
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0e1726] to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl glow-purple">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-rose-600/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl">
          <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Premium IPTV Console
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-4 tracking-tight leading-tight">
            Naadloze Streams, Eindeloze Content.
          </h2>
          <p className="text-slate-600 mt-2 text-sm md:text-base leading-relaxed max-w-2xl">
            Welkom in jouw IPTV-beheerpaneel. Hier kun je M3U-afspeellijsten toevoegen, een snelheidstest uitvoeren en actieve apparaatverbindingen beheren.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl backdrop-blur-sm">
              <span className="text-xs text-slate-700 block uppercase tracking-wider font-mono">Gesynchroniseerde Zenders</span>
              <span className="text-xl md:text-2xl font-black text-white mt-1.5 block">
                {totalChannelsCount.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl backdrop-blur-sm">
              <span className="text-xs text-slate-700 block uppercase tracking-wider font-mono">Gelijktijdige Limieten</span>
              <span className="text-xl md:text-2xl font-black text-white mt-1.5 block">
                {systemStatus.connectedDevicesCount} / 4 Apparaten
              </span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl backdrop-blur-sm">
              <span className="text-xs text-slate-700 block uppercase tracking-wider font-mono">Streamkwaliteit</span>
              <span className="text-xl md:text-2xl font-black text-rose-400 mt-1.5 block">
                4K & 8K HDR
              </span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl backdrop-blur-sm">
              <span className="text-xs text-slate-700 block uppercase tracking-wider font-mono">Serververbinding</span>
              <span className="text-xl md:text-2xl font-black text-emerald-400 mt-1.5 block flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                99.9%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Playlist Importer & Connection Speed Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Playlists Manager */}
        <div className="glass-card rounded-2xl p-6 shadow-lg flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-950 tracking-tight">
                M3U Afspeellijsten
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Voeg M3U-URL's toe om je live IPTV-streams te synchroniseren.
              </p>
            </div>
            <span className="text-xs bg-slate-100 border border-slate-200 text-slate-800 font-mono px-2 py-1 rounded">
              {playlists.length} Portals
            </span>
          </div>

          {/* List of playlists */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {playlists.map((pl) => (
              <div 
                key={pl.id} 
                className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-sm text-slate-900 truncate">{pl.name}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-mono mt-1 truncate max-w-[280px]">
                    {pl.url}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-600 mt-2">
                    <span>{pl.channelsCount.toLocaleString()} Live Zenders</span>
                    <span>•</span>
                    <span>Actief sinds {pl.activeSince}</span>
                  </div>
                </div>

                <button 
                  onClick={() => onDeletePlaylist(pl.id)}
                  className="p-2 text-slate-700 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition shrink-0"
                  title="Verwijder afspeellijst"
                  id={`del-pl-${pl.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {playlists.length === 0 && (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-50/30">
                <p className="text-slate-600 text-sm">Geen afspeellijsten geladen.</p>
                <p className="text-[11px] text-slate-700 mt-1">Voer hieronder je M3U-URL in om te beginnen.</p>
              </div>
            )}
          </div>

          {/* Import playlist URL form */}
          <form onSubmit={handleImportPlaylist} className="border-t border-slate-200 pt-4 space-y-4">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">
              Nieuw IPTV-abonnement importeren
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1.5 font-medium">Naam afspeellijst</label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="bijv. Mijn Premium IPTV"
                  className="w-full bg-slate-50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-950 placeholder:text-slate-600 focus:border-rose-500 outline-none transition"
                  id="pl-input-name"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1.5 font-medium">M3U-afspeellijst URL</label>
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://server.iptv.com/get.m3u"
                  className="w-full bg-slate-50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-950 placeholder:text-slate-600 focus:border-rose-500 outline-none transition"
                  id="pl-input-url"
                />
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3.5 py-2 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-2 rounded-xl text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>IPTV-abonnement succesvol toegevoegd! Streams worden gesynchroniseerd.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isImporting}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-600 text-white text-sm font-semibold py-3 px-5 rounded-xl hover:from-rose-500 hover:to-rose-500 transition shadow-lg shadow-rose-600/15 flex items-center justify-center gap-2"
              id="pl-btn-submit"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gegevens valideren & streams compileren...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Afspeellijst synchroniseren</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Speed Diagnostics Component */}
        <div className="glass-card rounded-2xl p-6 shadow-lg flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-950 tracking-tight">
                Bandbreedte & Snelheidstest
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Test je netwerkverbinding voor optimale streamkwaliteit.
              </p>
            </div>
            <Activity className="w-5 h-5 text-rose-400 shrink-0" />
          </div>

          {/* Test area */}
          <div className="flex-1 flex flex-col justify-between py-2">
            
            {/* Speedometer display */}
            <div className="flex flex-col items-center justify-center py-5">
              {speedTest.status === "running" ? (
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      fill="transparent" 
                      stroke="#1e293b" 
                      strokeWidth="6" 
                    />
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      fill="transparent" 
                      stroke="url(#greenGradient)" 
                      strokeWidth="6" 
                      strokeDasharray="439.8"
                      strokeDashoffset={439.8 - (439.8 * testProgress) / 100}
                      className="transition-all duration-100 ease-out"
                    />
                    <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-center z-10">
                    <span className="text-3xl font-black text-slate-900 block tracking-tight">
                      {Math.floor(testProgress * 2.4)}
                    </span>
                    <span className="text-xs text-[#10b981] font-mono tracking-wide mt-1 block font-semibold uppercase">
                      Testen...
                    </span>
                  </div>
                </div>
              ) : speedTest.status === "completed" ? (
                <div className="grid grid-cols-2 gap-8 w-full text-center max-w-sm px-4">
                  <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-[#10b981]" />
                    <span className="text-xs text-slate-700 block uppercase tracking-wider font-mono">Download</span>
                    <span className="text-3xl font-black text-slate-900 block mt-1.5 tracking-tight">
                      {speedTest.downloadSpeed}
                    </span>
                    <span className="text-[10px] text-[#10b981] font-bold uppercase mt-1 block">Mbps</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <span className="text-xs text-slate-700 block uppercase tracking-wider font-mono">Latentie</span>
                    <span className="text-3xl font-black text-slate-900 block mt-1.5 tracking-tight">
                      {speedTest.latency}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase mt-1 block">ms</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-700">
                  <Radio className="w-12 h-12 text-slate-950 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 font-semibold">Snelheidstester Gereed</p>
                  <p className="text-xs text-slate-700 mt-1 max-w-xs">Test verbindingslatentie en streamsnelheid in realtime.</p>
                </div>
              )}
            </div>

            {/* Test advice / feedback text */}
            {speedTest.status === "completed" && (
              <div className="bg-slate-50/90 border border-slate-200 p-4 rounded-xl text-xs text-slate-800 leading-relaxed flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-950 block mb-0.5">Diagnoserapport: Hoge Bandbreedte</span>
                  Jouw verbindingssnelheid van <strong className="text-slate-950">{speedTest.downloadSpeed} Mbps</strong> en latentie van <strong className="text-slate-950">{speedTest.latency}ms</strong> ondersteunt comfortabel <strong className="text-[#10b981]">4 gelijktijdige 4K/8K-streams</strong> zonder buffering.
                </div>
              </div>
            )}

            <button
              onClick={runSpeedTest}
              disabled={speedTest.status === "running"}
              className="mt-4 w-full bg-slate-850 hover:bg-slate-800 text-slate-900 border border-slate-700/60 text-sm font-semibold py-3 px-5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>{speedTest.status === "running" ? "Snelheidstest loopt..." : "Start snelheidstest"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Concurrent Active Connected Sessions */}
      <div className="glass-card rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div>
            <h3 className="font-extrabold text-lg text-slate-950 tracking-tight">
              Actieve Verbonden Apparaten
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Beheer je verbonden apparaten binnen de abonnementslimieten.
            </p>
          </div>
          <span className="text-xs bg-emerald-500/10 text-[#10b981] border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
            {devices.length} / 4 Toegestane Verbindingen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {devices.map((dev) => (
            <div 
              key={dev.id} 
              className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition duration-300"
            >
              {/* Device Icon */}
              <div className="flex items-start justify-between gap-4">
                <div className="p-3 bg-slate-200 border border-slate-800 rounded-xl text-[#10b981]">
                  {dev.deviceType === "TV" ? <Tv className="w-5 h-5" /> : 
                   dev.deviceType === "Mobile" ? <Smartphone className="w-5 h-5" /> : 
                   <Laptop className="w-5 h-5" />}
                </div>

                <button 
                  onClick={() => handleKickDevice(dev.id)}
                  className="text-slate-700 hover:text-rose-400 bg-slate-200/40 hover:bg-rose-500/10 px-2.5 py-1 rounded-md text-[10px] font-bold border border-slate-800 hover:border-rose-500/20 transition cursor-pointer"
                >
                  Verbreek
                </button>
              </div>

              <div className="mt-4">
                <h4 className="font-bold text-sm text-slate-900">{dev.name}</h4>
                <p className="text-xs text-slate-600 mt-1">{dev.location} • {dev.ipAddress}</p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-900 text-[10px] font-mono">
                <span className="text-slate-700">Actief {dev.uptime}</span>
                <span className="text-emerald-400 font-semibold">{dev.resolution}</span>
              </div>
            </div>
          ))}

          {devices.length === 0 && (
            <div className="col-span-1 md:col-span-3 text-center py-10 border border-slate-800 bg-slate-50/20 rounded-xl">
              <Tv className="w-10 h-10 text-slate-900 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">Geen actieve verbindingen</p>
              <p className="text-xs text-slate-700 mt-0.5">Begin met streamen om verbonden apparaten te zien.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
