export interface IPTVChannel {
  id: string;
  name: string;
  logo: string;
  streamUrl: string;
  category: string;
  status: "online" | "offline";
  viewers: number;
  resolution: "4K" | "FHD" | "HD";
  language: string;
  isFavorite?: boolean;
}

export interface Episode {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  episodeNumber: number;
  seasonNumber: number;
}

export interface MovieOrSeries {
  id: string;
  title: string;
  type: "movie" | "series";
  poster: string;
  backdrop: string;
  genre: string[];
  rating: number;
  duration: string; // "128m" or "3 Seasons"
  year: number;
  description: string;
  cast: string[];
  isTrending?: boolean;
  videoUrl: string;
  episodes?: Episode[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  devices: number;
  resolutions: string[];
  supportsOffline: boolean;
  hasVipSupport: boolean;
  features: string[];
}

export interface UserSubscription {
  id: string;
  planId: string;
  status: "active" | "expired" | "paused";
  expiresAt: string;
  autoRenew: boolean;
  paymentMethodId: string;
  lastBillingDate: string;
  devicesConnected: number;
  playlistUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "crypto" | "ideal";
  details: {
    cardBrand?: string;
    last4?: string;
    email?: string;
    walletAddress?: string;
    coinType?: string;
    bankName?: string;
  };
  isDefault: boolean;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  planName: string;
  status: "paid" | "pending" | "failed";
  paymentMethodType: string;
  transactionHash?: string;
}

export interface PlaylistItem {
  id: string;
  name: string;
  url: string;
  channelsCount: number;
  activeSince: string;
  status: "active" | "error" | "expired";
}

export interface SpeedTestData {
  latency: number;
  downloadSpeed: number;
  status: "idle" | "running" | "completed";
}
