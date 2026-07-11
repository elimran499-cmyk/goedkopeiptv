import { IPTVChannel, MovieOrSeries, SubscriptionPlan, PaymentMethod, BillingInvoice, PlaylistItem } from "../types";

export const MOCK_CHANNELS: IPTVChannel[] = [
  { id: "ch-1", name: "NPO 1", logo: "📺", streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-set-of-different-television-screens-39988-large.mp4", category: "Publiek", status: "online", viewers: 28430, resolution: "FHD", language: "Nederlands", isFavorite: true },
  { id: "ch-2", name: "NPO 2", logo: "🎓", streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-set-of-different-television-screens-39988-large.mp4", category: "Publiek", status: "online", viewers: 14200, resolution: "FHD", language: "Nederlands" },
  { id: "ch-3", name: "NPO 3", logo: "🎪", streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32115-large.mp4", category: "Publiek", status: "online", viewers: 9820, resolution: "FHD", language: "Nederlands", isFavorite: true },
  { id: "ch-4", name: "RTL 4", logo: "📡", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", category: "Entertainment", status: "online", viewers: 22100, resolution: "FHD", language: "Nederlands" },
  { id: "ch-5", name: "RTL 5", logo: "🎭", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", category: "Entertainment", status: "online", viewers: 11450, resolution: "FHD", language: "Nederlands" },
  { id: "ch-6", name: "RTL 7", logo: "⚽", streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-soccer-ball-hitting-the-net-goal-22538-large.mp4", category: "Sport", status: "online", viewers: 18340, resolution: "FHD", language: "Nederlands", isFavorite: true },
  { id: "ch-7", name: "SBS 6", logo: "🎬", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", category: "Entertainment", status: "online", viewers: 13200, resolution: "FHD", language: "Nederlands" },
  { id: "ch-8", name: "Veronica", logo: "🎵", streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32115-large.mp4", category: "Entertainment", status: "online", viewers: 8760, resolution: "FHD", language: "Nederlands" },
  { id: "ch-9", name: "Ziggo Sport", logo: "🏆", streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-going-down-a-snowy-slope-on-a-snowboard-34298-large.mp4", category: "Sport", status: "online", viewers: 31200, resolution: "4K", language: "Nederlands", isFavorite: true },
  { id: "ch-10", name: "Fox Sports NL", logo: "🦊", streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-soccer-ball-hitting-the-net-goal-22538-large.mp4", category: "Sport", status: "online", viewers: 24500, resolution: "4K", language: "Nederlands" },
  { id: "ch-11", name: "Comedy Central NL", logo: "😂", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", category: "Entertainment", status: "online", viewers: 7840, resolution: "FHD", language: "Nederlands" },
  { id: "ch-12", name: "AT5 Amsterdam", logo: "📰", streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-set-of-different-television-screens-39988-large.mp4", category: "Nieuws", status: "online", viewers: 4120, resolution: "FHD", language: "Nederlands" }
];

export const MOCK_MOVIES_AND_SERIES: MovieOrSeries[] = [
  {
    id: "nl-1",
    title: "Zwartboek (Black Book)",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/s8UyT6tUKJl07gYhPheLAzogG8V.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/vT39NcxIWHL5XVNQGRMbS8NxXs0.jpg",
    genre: ["Drama", "Thriller", "Oorlog"],
    rating: 7.7,
    duration: "145m",
    year: 2006,
    description: "In het bezette Nederland sluit een Joodse vrouw zich aan bij het verzet en infiltreert Gestapo-hoofdkwartier door een SS-officier te verleiden. Verhoevens meesterwerk.",
    cast: ["Carice van Houten", "Sebastian Koch", "Thom Hoffman"],
    isTrending: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  },
  {
    id: "nl-2",
    title: "Mocro Maffia",
    type: "series",
    poster: "https://media.themoviedb.org/t/p/w500/iM6tRt7VQ6p6yqnpBkwb8zZmprC.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/52YPN3cHpj5cgCCJrsO1bckoUK5.jpg",
    genre: ["Crime", "Drama", "Thriller"],
    rating: 7.8,
    duration: "4 Seizoenen",
    year: 2018,
    description: "Romano, Potlood en De Paus stijgen snel in de Amsterdamse onderwereld en grijpen de controle over de cocaïnemarkt — maar jaloezie breekt hun band. Gebaseerd op ware feiten.",
    cast: ["Noureddine Faryad", "Achraf Meziani", "Youssef Ottmani"],
    isTrending: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    episodes: [
      { id: "nl-2-e1", title: "De Opkomst", duration: "45m", episodeNumber: 1, seasonNumber: 1, thumbnail: "https://media.themoviedb.org/t/p/w500/iM6tRt7VQ6p6yqnpBkwb8zZmprC.jpg" },
      { id: "nl-2-e2", title: "Bloed Betaalt", duration: "48m", episodeNumber: 2, seasonNumber: 1, thumbnail: "https://media.themoviedb.org/t/p/w500/p1uDRaen4gR4mfCULBLFrtsCJiD.jpg" },
      { id: "nl-2-e3", title: "De Prijs", duration: "50m", episodeNumber: 3, seasonNumber: 1, thumbnail: "https://media.themoviedb.org/t/p/w500/rAzH6tXUkS39APkYPdSVNGQ34e0.jpg" }
    ]
  },
  {
    id: "nl-3",
    title: "De Slag om de Schelde",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/wU8ijITXE2ZgoXJexTQByJiHCbp.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/qmCCXB6fn1Sjztm4t56Xviw0uDI.jpg",
    genre: ["Oorlog", "Geschiedenis", "Drama"],
    rating: 7.0,
    duration: "126m",
    year: 2021,
    description: "De levens van een Britse zweefvliegtuigpiloot, een Nederlandse verzetsstrijder en een Duitse soldaat kruisen elkaar tijdens de Slag om de Schelde in WOII.",
    cast: ["Gijs Blom", "Jamie Flatters", "Tom Felton"],
    isTrending: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: "nl-4",
    title: "Soldaat van Oranje",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/kdlk0cz97i8Fyb1ZFpp9tokHxGD.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/kdlk0cz97i8Fyb1ZFpp9tokHxGD.jpg",
    genre: ["Drama", "Thriller", "Oorlog"],
    rating: 7.6,
    duration: "165m",
    year: 1977,
    description: "Tijdens de nazi-bezetting van Nederland krijgen zes bevriende studenten drastisch verschillende lotgevallen — sommigen collaboreren, anderen verzetten zich, één wordt een held.",
    cast: ["Rutger Hauer", "Jeroen Krabbé", "Peter Faber"],
    isTrending: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  },
  {
    id: "nl-5",
    title: "Ferry",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/1sZlGoyGShlPhKj1AspcuHh4jfU.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/1sZlGoyGShlPhKj1AspcuHh4jfU.jpg",
    genre: ["Crime", "Drama", "Actie"],
    rating: 6.9,
    duration: "106m",
    year: 2021,
    description: "Vóór hij een drugsimperium bouwde, keert Ferry Bouman terug naar zijn geboorteplaats voor wraak — een missie die zijn loyaliteit en zijn hart op de proef stelt.",
    cast: ["Frank Lammers", "Elise Schaap", "Huub Smit"],
    isTrending: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  },
  {
    id: "nl-6",
    title: "Ferry 2",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/8pwdnL3pEISIN1EGmwZzU6hpNVk.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/8pwdnL3pEISIN1EGmwZzU6hpNVk.jpg",
    genre: ["Crime", "Drama", "Thriller"],
    rating: 6.5,
    duration: "94m",
    year: 2024,
    description: "Na het verlies van zijn drugsimperium heeft Ferry Bouman rust gevonden — tot zijn verleden hem inhaalt en hij opnieuw keuzes moet maken over macht en loyaliteit.",
    cast: ["Frank Lammers", "Elise Schaap", "Wim Willaert"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: "nl-7",
    title: "De Oost",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/lcn9tfKLfvDGpZgUJw48eN0XCCA.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/lcn9tfKLfvDGpZgUJw48eN0XCCA.jpg",
    genre: ["Oorlog", "Drama", "Thriller"],
    rating: 7.0,
    duration: "137m",
    year: 2021,
    description: "Een jonge Nederlandse soldaat raakt verscheurd tussen plicht en geweten als hij in 1946 deelneemt aan de gewelddadige onderdrukking van de Indonesische onafhankelijkheidsstrijd.",
    cast: ["Marwan Kenzari", "Martijn Lakemeier", "Jonas Smulders"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  },
  {
    id: "nl-8",
    title: "Borgman",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/kasPhXDk4BI4FUS3ku5Y4GrgBJY.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/kasPhXDk4BI4FUS3ku5Y4GrgBJY.jpg",
    genre: ["Thriller", "Drama", "Mystery"],
    rating: 6.8,
    duration: "113m",
    year: 2013,
    description: "Een raadselachtige zwerver manipuleert zich in het leven van een arrogante rijke familie en verandert hun wereld in een psychologische nachtmerrie. Cannes-selectie.",
    cast: ["Jan Bijvoet", "Hadewych Minis", "Jeroen Perceval"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: "nl-9",
    title: "Instinct",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/i5Ai5Sr8UIHq4IbVnO45fm2RpVf.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/i5Ai5Sr8UIHq4IbVnO45fm2RpVf.jpg",
    genre: ["Drama", "Mystery", "Thriller"],
    rating: 6.0,
    duration: "98m",
    year: 2019,
    description: "Een gevangenispsycholoog raakt geobsedeerd door een schijnbaar geherformeerde zedendelinquent die op het punt staat vrijgelaten te worden. Winnaar Locarno Film Festival.",
    cast: ["Carice van Houten", "Marwan Kenzari"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  },
  {
    id: "nl-10",
    title: "Wolf",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/39SHAfnH7xoP2SH7BQoUXMeXjUQ.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/39SHAfnH7xoP2SH7BQoUXMeXjUQ.jpg",
    genre: ["Drama", "Actie", "Crime"],
    rating: 6.5,
    duration: "100m",
    year: 2021,
    description: "Een getalenteerde kickbokser wordt meegesleurd in de Amsterdamse onderwereld als zijn omgeving hem steeds dieper in de criminaliteit trekt.",
    cast: ["Tobias Kersloot", "Hümeyra", "Marwan Kenzari"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: "nl-11",
    title: "Matterhorn",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/hCZrQoZIHBlTV4luqWwvJRSp8d9.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/hCZrQoZIHBlTV4luqWwvJRSp8d9.jpg",
    genre: ["Drama", "Komedie"],
    rating: 7.1,
    duration: "87m",
    year: 2013,
    description: "Een eenzame weduwnaar in een streng calvinistisch dorp neemt een vreemde zwerver in huis — en wordt geconfronteerd met zijn diepste spijt en zijn gemeenschap.",
    cast: ["Ton Kas", "René van 't Hof", "Ruud Feltkamp"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: "nl-12",
    title: "Bon Bini Holland 3",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/dgC8P73K1VnvEbNJpe78TUwnZpE.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/dgC8P73K1VnvEbNJpe78TUwnZpE.jpg",
    genre: ["Komedie"],
    rating: 5.5,
    duration: "84m",
    year: 2022,
    description: "Jorrit en Bas dromen van een eigen stripclub in Miami, maar hun trip eindigt in een wervelwind van misverstanden, chaos en hilarische avonturen ver van huis.",
    cast: ["Jandino Asporaat", "Brandun Burke"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  },
  {
    id: "nl-13",
    title: "Bon Bini: Bangkok Nights",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/qS5cOwgu5G8GPWYLO4wv3PuFFhB.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/qS5cOwgu5G8GPWYLO4wv3PuFFhB.jpg",
    genre: ["Komedie", "Actie"],
    rating: 5.2,
    duration: "91m",
    year: 2023,
    description: "Judeska en Ping Ping worden opgelicht door een sluwe Aziatische zakenman en reizen naar Bangkok om hun restaurant terug te stelen in deze hilarische actiekomedie.",
    cast: ["Jandino Asporaat", "Ankie Beilke", "Phi Nguyen"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: "nl-14",
    title: "Loving Bali",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/b3vciZQgZEVMkFnruEztpczOvkr.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/b3vciZQgZEVMkFnruEztpczOvkr.jpg",
    genre: ["Romantiek", "Komedie"],
    rating: 5.0,
    duration: "113m",
    year: 2024,
    description: "Na het overlijden van haar Indiase oma overtuigt influencer Jenny haar moeder en zus om samen naar Bali te gaan — drie generaties, één eiland, onverwachte romantiek.",
    cast: ["Jim Bakkum", "Wieteke van Dort", "Nadja Hüpscher"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: "nl-15",
    title: "Fabula",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/26CaxmDelTmZ6CgTHY1lCsj8Pru.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/26CaxmDelTmZ6CgTHY1lCsj8Pru.jpg",
    genre: ["Komedie", "Crime", "Fantasy"],
    rating: 6.5,
    duration: "125m",
    year: 2025,
    description: "Jos, een kleine crimineel in Limburg, gelooft vervloekt te zijn na een mislukte drugsdeal en trekt door de bizarre uithoeken van de regio om de vloek te verbreken.",
    cast: ["Fedja van Huêt", "Sezgin Güleç", "Livia Lamers"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  },
  {
    id: "nl-16",
    title: "Verliefd op Ibiza",
    type: "movie",
    poster: "https://media.themoviedb.org/t/p/w500/srfg90ModqcMNpfeVxEkn5fAxlp.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w1280/srfg90ModqcMNpfeVxEkn5fAxlp.jpg",
    genre: ["Romantiek", "Komedie"],
    rating: 4.8,
    duration: "117m",
    year: 2013,
    description: "Vier singles vliegen naar Ibiza voor een vakantie zonder verwachtingen — maar het eiland heeft andere plannen met hun hart. De originele Nederlandse zomerhit.",
    cast: ["Tygo Gernandt", "Jelka van Houten", "Georgina Verbaan"],
    isTrending: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-3m",
    name: "3 Maanden",
    price: 34.99,
    billingPeriod: "3 maanden",
    devices: 1,
    resolutions: ["HD (720p)", "4K Ultra HD"],
    supportsOffline: false,
    hasVipSupport: false,
    features: [
      "10.000+ Live kanalen wereldwijd",
      "Alle Nederlandse zenders (NPO, RTL, SBS)",
      "Volledige VOD catalogus",
      "4K Ultra HD kwaliteit",
      "Champions League & Europa League",
      "Wereldwijd beschikbaar — op elk apparaat",
      "PayPal, Visa & Bitcoin betaling",
      "Geen contract — direkt actief"
    ]
  },
  {
    id: "plan-6m",
    name: "6 Maanden",
    price: 44.99,
    billingPeriod: "6 maanden",
    devices: 2,
    resolutions: ["4K Ultra HD", "UHD (4K)"],
    supportsOffline: true,
    hasVipSupport: false,
    features: [
      "15.000+ Live kanalen wereldwijd",
      "Alle Nederlandse zenders + Eredivisie Live",
      "4K Ultra HD stream",
      "Wereldwijd beschikbaar — op elk apparaat",
      "7 dagen terugkijken (NPO/RTL/SBS)",
      "Champions League & Europa League",
      "Anti-freeze buffering technologie",
      "Prioriteit klantenservice"
    ]
  },
  {
    id: "plan-15m",
    name: "12+3 Maanden",
    price: 78,
    billingPeriod: "15 maanden",
    devices: 4,
    resolutions: ["4K Ultra HD", "UHD (4K)", "8K HDR"],
    supportsOffline: true,
    hasVipSupport: true,
    features: [
      "20.000+ Premium live kanalen",
      "Alle Nederlandse zenders — compleet pakket",
      "4K UHD & 8K HDR — maximale kwaliteit",
      "Wereldwijd beschikbaar — op elk apparaat",
      "Eredivisie, Champions League, F1 Live",
      "Offline opslag & playlist download",
      "VIP klantsucces manager",
      "3 maanden GRATIS — beste waarde"
    ]
  }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm-1", type: "ideal", details: { bankName: "ING Bank" }, isDefault: true },
  { id: "pm-2", type: "card", details: { cardBrand: "visa", last4: "4242" }, isDefault: false },
  { id: "pm-3", type: "crypto", details: { walletAddress: "0x71C7...60A9", coinType: "USDT" }, isDefault: false }
];

export const INITIAL_INVOICES: BillingInvoice[] = [
  { id: "inv-2001", date: "2026-06-15", amount: 44.99, planName: "6 Maanden", status: "paid", paymentMethodType: "iDEAL (ING Bank)", transactionHash: "tx_8f7b2c019a3b4c5d" },
  { id: "inv-2002", date: "2025-12-15", amount: 78, planName: "12+3 Maanden", status: "paid", paymentMethodType: "iDEAL (ING Bank)", transactionHash: "tx_4e5d6c7b8a9b0c1d" },
  { id: "inv-2003", date: "2025-06-15", amount: 34.99, planName: "3 Maanden", status: "paid", paymentMethodType: "Visa ending in 4242", transactionHash: "tx_1a2b3c4d5e6f7g8h" }
];

export const MOCK_PLAYLISTS: PlaylistItem[] = [
  { id: "pl-1", name: "Nederlandse Zenders Pakket", url: "https://secure-streams.iptvcorp.io/api/m3u/nl-main.m3u", channelsCount: 8420, activeSince: "2026-06-15", status: "active" },
  { id: "pl-2", name: "Eredivisie & Sport Pakket", url: "https://premium.nlstream.tv/get.php?auth=9s8d7f6e&output=ts", channelsCount: 3280, activeSince: "2026-06-20", status: "active" }
];
