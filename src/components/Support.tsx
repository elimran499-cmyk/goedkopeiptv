import { useState } from "react";
import { Tv, Smartphone, Zap, Monitor, Box } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const devices = [
  {
    id: "smarttv",
    label: "Smart TV",
    Icon: Tv,
    compatible: "SMART TV",
    title: "Smart TV Installatie",
    subtitle: "Samsung, LG, Sony, Android TV, Hisense en Apple TV.",
    steps: [
      "Installeer de app IPTV Smarters Pro of Smart IPTV via de app store van jouw TV.",
      "Voer je serverlink en inloggegevens in die je via WhatsApp hebt ontvangen.",
      "Klaar — geniet direct van 4K-kwaliteit op je grote scherm!",
    ],
    portalLabel: "SMART TV KLAAR",
    portalDesc: "Voer je server-URL en inloggegevens in om te activeren.",
  },
  {
    id: "mobile",
    label: "Smartphone & Tablet",
    Icon: Smartphone,
    compatible: "MOBIEL",
    title: "Smartphone & Tablet Installatie",
    subtitle: "Android-telefoons, iPhones, iPads en Android-tablets.",
    steps: [
      "Installeer IPTV Smarters (Android) of GSE IPTV (iOS) via de app store.",
      "Voer je M3U-URL of Xtream API-gegevens in die je na aankoop ontvangt.",
      "Geniet overal van alle zenders in volledige HD-kwaliteit!",
    ],
    portalLabel: "MOBIEL KLAAR",
    portalDesc: "Compatibel met M3U, Xtream API en portallinks.",
  },
  {
    id: "firestick",
    label: "Amazon Fire Stick",
    Icon: Zap,
    compatible: "FIRE STICK",
    title: "Amazon Fire Stick Installatie",
    subtitle: "Fire Stick 4K, Fire TV Cube en Fire TV Edition.",
    steps: [
      "Activeer 'Apps van onbekende bronnen' in de instellingen van je Fire Stick.",
      "Installeer IPTV Smarters Pro via Downloader of de Amazon App Store.",
      "Voer je servergegevens in en stream direct in 4K.",
    ],
    portalLabel: "FIRE STICK KLAAR",
    portalDesc: "Ondersteunt M3U-afspeellijsten en Xtream Codes API.",
  },
  {
    id: "pc",
    label: "PC & Mac",
    Icon: Monitor,
    compatible: "PC & MAC",
    title: "PC & Mac Installatie",
    subtitle: "Windows 10/11, macOS Monterey en hoger.",
    steps: [
      "Download VLC Player of IPTV Smarters Web op je computer.",
      "Laad je M3U-afspeellijst of voer je Xtream API-gegevens in.",
      "Stream alle 20.000+ zenders direct in je browser of app.",
    ],
    portalLabel: "PC & MAC KLAAR",
    portalDesc: "Werkt met VLC, Kodi en alle grote IPTV-spelers.",
  },
  {
    id: "mag",
    label: "MAG & Formuler",
    Icon: Box,
    compatible: "MAG / FORMULER",
    title: "MAG & Formuler Installatie",
    subtitle: "MAG 254, 256, 322, 324 en alle Formuler Z-series apparaten.",
    steps: [
      "Ga naar Instellingen → Systeeminstellingen → Servers → Portals.",
      "Voer je goedkopeiptv portal-URL in en sla de configuratie op.",
      "Herstart je apparaat en geniet direct van alle zenders.",
    ],
    portalLabel: "MAG KLAAR",
    portalDesc: "Portal-URL direct na aankoop via WhatsApp ontvangen.",
  },
];

export default function Support() {
  const [activeId, setActiveId] = useState("smarttv");
  const device = devices.find((d) => d.id === activeId)!;
  const { Icon } = device;

  return (
    <div id="support-panel" className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#ef4444] uppercase bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full inline-block">
          Compatibele apparaten
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Installeer IPTV op al je schermen
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          goedkopeiptv werkt op alle grote apparaten en smart TV-platforms.
          Volg de stappen hieronder om direct te beginnen.
        </p>
      </div>

      {/* Device tabs */}
      <div className="flex gap-3 justify-center flex-wrap">
        {devices.map((d) => {
          const DIcon = d.Icon;
          const isActive = activeId === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={`flex flex-col items-center gap-2.5 px-5 py-4 rounded-2xl border transition-all duration-200 cursor-pointer min-w-[110px] ${
                isActive
                  ? "bg-[#1a1a2e] border-[#ef4444]/40 text-white shadow-lg glow-red"
                  : "glass-card text-slate-500 hover:text-slate-800 hover:border-[#ef4444]/30"
              }`}
            >
              <DIcon className={`w-5 h-5 ${isActive ? "text-[#ef4444]" : "text-slate-400"}`} />
              <span className="text-[11px] font-bold text-center leading-tight">{d.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="glass-card-lg rounded-2xl p-8"
        >
          <div className="grid md:grid-cols-5 gap-8">
            {/* Left: steps */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black tracking-widest text-[#ef4444] uppercase">
                    {device.compatible}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">
                    Compatibel
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{device.title}</h2>
                <p className="text-slate-500 text-sm mt-1">{device.subtitle}</p>
              </div>

              <div className="border-t border-slate-200" />

              <ol className="space-y-5">
                {device.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-7 h-7 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center text-[11px] font-black text-[#ef4444] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-700 text-sm leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Right: portal check card */}
            <div className="md:col-span-2 flex items-start">
              <div className="w-full glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Portaal Check
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                <div className="flex flex-col items-center text-center gap-3 py-4">
                  <div className="w-14 h-14 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-[#ef4444]" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 tracking-wider uppercase">
                      {device.portalLabel}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[160px] mx-auto">
                      {device.portalDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 border-t border-slate-200 pt-3">
                  {["M3U", "XTREAM API", "PORTAL"].map((tag) => (
                    <span key={tag} className="text-[9px] font-black text-slate-400 tracking-wider uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* WhatsApp support banner */}
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-11 h-11 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center shrink-0">
          <span className="text-[#ef4444] font-black text-lg">?</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-slate-900 text-sm">
            Hulp nodig bij het instellen van je apparaat?
          </div>
          <div className="text-slate-500 text-xs mt-0.5">
            Ons supportteam staat 24/7 voor je klaar om je IPTV-app te configureren via WhatsApp.
          </div>
        </div>
        <button
          onClick={() =>
            window.open(
              `https://wa.me/447449708976?text=${encodeURIComponent("Hallo, ik heb hulp nodig bij het instellen van mijn IPTV-app. Kunt u mij helpen?")}`,
              "_blank"
            )
          }
          className="bg-[#25D366] hover:bg-[#20b859] text-white font-black text-xs px-6 py-3 rounded-xl transition shrink-0 cursor-pointer shadow-md"
        >
          WhatsApp Ondersteuning
        </button>
      </div>
    </div>
  );
}
