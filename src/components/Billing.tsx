import { useState, FormEvent } from "react";
import { SubscriptionPlan, PaymentMethod, BillingInvoice } from "../types";
import { SUBSCRIPTION_PLANS } from "../data/mockData";

const SCREENS_PRICING: Record<string, Record<number, number>> = {
  "plan-3m":  { 1: 24, 2: 39.99,  3: 59.99  },
  "plan-6m":  { 1: 35, 2: 59.99,  3: 79.99  },
  "plan-15m": { 1: 49, 2: 89.99,  3: 129.99 },
};
import {
  CreditCard, Check, AlertCircle, Calendar, RefreshCw, Wallet, Monitor,
  ArrowDownRight, Copy, CheckCircle, ShieldAlert, FileText, Download, X, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BillingProps {
  currentPlanId: string;
  onUpdatePlan: (planId: string) => void;
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: (pm: PaymentMethod) => void;
  onDeletePaymentMethod: (id: string) => void;
  onSetDefaultPaymentMethod: (id: string) => void;
  invoices: BillingInvoice[];
  onAddNewInvoice: (invoice: BillingInvoice) => void;
}

export default function Billing({
  currentPlanId,
  onUpdatePlan,
  paymentMethods,
  onAddPaymentMethod,
  onDeletePaymentMethod,
  onSetDefaultPaymentMethod,
  invoices,
  onAddNewInvoice,
}: BillingProps) {
  // Billing cycle switcher: "monthly" | "annually"
  const [autoRenew, setAutoRenew] = useState(true);
  const [selectedPayType, setSelectedPayType] = useState<"card" | "paypal" | "crypto">("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [formError, setFormError] = useState("");

  const [vpnSelected, setVpnSelected] = useState<Record<string, boolean>>({});
  const [screensSelected, setScreensSelected] = useState<Record<string, number>>({});

  // Invoice display modal
  const [activeInvoice, setActiveInvoice] = useState<BillingInvoice | null>(null);

  // New Payment Form panel visibility
  const [showAddMethodForm, setShowAddMethodForm] = useState(false);

  // In-app checkout modal flow
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [checkoutStep, setCheckoutStep] =
    useState<"select_method" | "fill_form" | "confirming" | "success">("select_method");
  const [billingPeriod] = useState<"monthly" | "annually">("monthly");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Open the checkout modal for a given plan, resetting to the first step
  const openCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCheckoutStep("select_method");
    setFormError("");
  };

  // Drive the checkout: validate the active method, simulate processing,
  // then record the plan change + invoice and show the success screen.
  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (selectedPayType === "card") {
      if (!cardHolder.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCVC.trim()) {
        setFormError("Vul alstublieft alle kaartgegevens in.");
        return;
      }
    } else if (selectedPayType === "paypal") {
      if (!paypalEmail.trim() || !paypalEmail.includes("@")) {
        setFormError("Voer een geldig PayPal e-mailadres in.");
        return;
      }
    }

    const plan = selectedPlan;
    setCheckoutStep("confirming");
    window.setTimeout(() => {
      if (plan) {
        onUpdatePlan(plan.id);
        const amount = billingPeriod === "annually" ? plan.price * 0.8 * 12 : plan.price;
        const invoice: BillingInvoice = {
          id: `inv-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          amount: Number(amount.toFixed(2)),
          planName: plan.name,
          status: "paid",
          paymentMethodType: selectedPayType,
          ...(selectedPayType === "crypto"
            ? { transactionHash: "0x" + Math.random().toString(16).slice(2, 12) }
            : {}),
        };
        onAddNewInvoice(invoice);
      }
      setCheckoutStep("success");
    }, 2200);
  };

  // Crypto conversion rate calculator helper
  const getCryptoAmount = (usd: number, coin: string) => {
    switch (coin) {
      case "BTC": return (usd / 95000).toFixed(6);
      case "ETH": return (usd / 3100).toFixed(5);
      case "BNB": return (usd / 620).toFixed(4);
      default: return usd.toFixed(2); // USDT (1:1)
    }
  };

  const getCryptoAddress = (coin: string) => {
    switch (coin) {
      case "BTC": return "bc1qxy2kg3ut7as77v36w586689d7as77vk8n29t";
      case "ETH": return "0x71C7656EC7ab88b098defB751B7401B5f6d8975a";
      case "BNB": return "0x71C7656EC7ab88b098defB751B7401B5f6d8975a";
      default: return "0x4e12c98d7f45a769888be621945c7d6e812d8a1f"; // USDT TRC20/ERC20
    }
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    window.setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Add individual payment method (without purchasing)
  const handleAddNewPaymentMethod = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    const methodId = `pm-${Math.floor(Math.random() * 900) + 100}`;
    let pmDetails = {};

    if (selectedPayType === "card") {
      if (!cardHolder.trim() || !cardNumber.trim()) {
        setFormError("Please enter card credentials");
        return;
      }
      pmDetails = { cardBrand: "mastercard", last4: cardNumber.replace(/\s+/g, "").slice(-4) || "8841" };
    } else if (selectedPayType === "paypal") {
      if (!paypalEmail.trim() || !paypalEmail.includes("@")) {
        setFormError("Valid PayPal email required");
        return;
      }
      pmDetails = { email: paypalEmail };
    } else {
      pmDetails = { walletAddress: "0x3e1...b901", coinType: selectedCoin };
    }

    const newPm: PaymentMethod = {
      id: methodId,
      type: selectedPayType,
      details: pmDetails,
      isDefault: false
    };

    onAddPaymentMethod(newPm);
    setShowAddMethodForm(false);
    // clear fields
    setCardHolder("");
    setCardNumber("");
    setPaypalEmail("");
  };

  return (
    <div id="iptv-billing-panel" className="space-y-8">
      
      {/* Pricing Plans — WhatsApp order */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="font-extrabold text-lg text-slate-950 tracking-tight">🇳🇱 Kies jouw pakket</h3>
          <p className="text-xs text-slate-600 mt-0.5">Bestel direct via WhatsApp — binnen 5 minuten actief. Betaal met iDEAL, creditcard of crypto.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {SUBSCRIPTION_PLANS.map((plan, idx) => {
            const isPopular = idx === 2;
            const hasVpn = !!vpnSelected[plan.id];
            const screens = screensSelected[plan.id] || 1;
            const basePrice = SCREENS_PRICING[plan.id]?.[screens] ?? plan.price;
            const screensCost = basePrice - plan.price;
            const totalPrice = basePrice + (hasVpn ? 10 : 0);
            return (
              <div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                className={`relative rounded-2xl p-6 flex flex-col h-full transition-all duration-300 ${
                  isPopular
                    ? "bg-gradient-to-b from-[#1A0A10] to-[#2B0F1A] text-white border border-[#E0345F]/30 shadow-2xl glow-red"
                    : "glass-card hover:shadow-lg"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E0345F] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full glow-red-sm whitespace-nowrap">
                    🏆 Beste Waarde — 3 Maanden Gratis
                  </span>
                )}

                {/* grows to fill card height */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPopular ? "text-[#E0345F]" : "text-slate-400"}`}>{plan.billingPeriod}</div>
                    <h4 className={`font-extrabold text-xl tracking-tight ${isPopular ? "text-white" : "text-slate-900"}`}>{plan.name}</h4>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black transition-all ${isPopular ? "text-white" : "text-slate-900"}`}>€{totalPrice.toFixed(2)}</span>
                    <span className={`text-xs font-bold ${isPopular ? "text-slate-400" : "text-slate-500"}`}>eenmalig</span>
                  </div>
                  <ul className={`space-y-2 text-xs pt-3 border-t ${isPopular ? "border-white/10" : "border-slate-100"}`}>
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#E0345F] shrink-0 mt-0.5" />
                        <span className={isPopular ? "text-slate-300" : "text-slate-700"}>{feat}</span>
                      </li>
                    ))}
                    {hasVpn && (
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className={`font-bold ${isPopular ? "text-emerald-400" : "text-emerald-600"}`}>VPN (+€10)</span>
                      </li>
                    )}
                    {screens > 1 && (
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className={`font-bold ${isPopular ? "text-emerald-400" : "text-emerald-600"}`}>{screens} schermen inbegrepen</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* VPN add-on toggle — pinned above button */}
                <div className={`mt-4 rounded-xl p-3 border ${isPopular ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <label className="flex items-center justify-between gap-2 cursor-pointer select-none">
                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                      <svg viewBox="0 0 24 24" className={`w-4 h-4 shrink-0 ${isPopular ? "text-rose-300" : "text-[#E0345F]"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className={`text-xs font-black whitespace-nowrap ${isPopular ? "text-white" : "text-slate-900"}`}>VPN</span>
                      <span className={`text-[10px] font-medium whitespace-nowrap ${isPopular ? "text-slate-400" : "text-slate-500"}`}>· +€10,00</span>
                    </div>
                    <button
                      role="switch"
                      aria-checked={hasVpn}
                      onClick={() => setVpnSelected(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none ${hasVpn ? "bg-[#E0345F]" : isPopular ? "bg-white/20" : "bg-slate-300"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${hasVpn ? "left-6" : "left-1"}`} />
                    </button>
                  </label>
                </div>

                {/* Screens add-on */}
                <div className={`mt-3 rounded-xl p-3 border ${isPopular ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Monitor className="w-4 h-4 shrink-0 text-[#E0345F]" />
                      <span className={`text-xs font-black whitespace-nowrap ${isPopular ? "text-white" : "text-slate-900"}`}>Schermen</span>
                    </div>
                    <div className="flex gap-1">
                      {([1, 2, 3] as const).map((n) => (
                        <button
                          key={n}
                          onClick={() => setScreensSelected(prev => ({ ...prev, [plan.id]: n }))}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            screens === n
                              ? "bg-[#E0345F] text-white shadow"
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
                </div>

                <button
                  onClick={() => {
                    const lines = [
                      `Hallo, ik wil graag het goedkopeiptv pakket bestellen:`,
                      ``,
                      `Pakket: ${plan.name} (${plan.billingPeriod})`,
                      `Schermen: ${screens}`,
                      `VPN: ${hasVpn ? "Ja, inbegrepen" : "Nee"}`,
                      `Totaal: €${totalPrice.toFixed(2)}`,
                      ``,
                      `Kunt u mij activeren? Stuur mij alstublieft de betaalgegevens.`,
                    ];
                    window.open(`https://wa.me/447832486269?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
                  }}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b859] text-white font-black text-xs py-3.5 rounded-xl transition active:scale-95 cursor-pointer shadow-md"
                  id={`btn-plan-select-${plan.id}`}
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.082 1.508 5.799L0 24l6.335-1.482A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.36-.214-3.719.870.939-3.619-.236-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
                  Bestellen via WhatsApp
                </button>

                <button
                  onClick={() => openCheckout(plan)}
                  className={`mt-2 w-full flex items-center justify-center gap-2 font-black text-xs py-3 rounded-xl transition active:scale-95 cursor-pointer border ${
                    isPopular
                      ? "bg-white/5 hover:bg-white/10 text-white border-white/15"
                      : "bg-white hover:bg-slate-50 text-slate-900 border-slate-200"
                  }`}
                  id={`btn-plan-checkout-${plan.id}`}
                >
                  <CreditCard className="w-4 h-4 text-[#E0345F]" />
                  Direct online afrekenen
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap pt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm font-semibold text-slate-700">🏦 iDEAL</span>
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm font-semibold text-slate-700">💳 Creditcard</span>
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm font-semibold text-slate-700">₿ Crypto</span>
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm font-semibold text-slate-700">⚡ Binnen 5 min actief</span>
        </div>
      </div>

      {/* DELETED: Payment Settings & Billing Logs */}{false && <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Payment Methods Config */}
        <div className="glass-card rounded-2xl p-6 shadow-lg flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-950 tracking-tight">
                Stored Payment Sources
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Connect and manage credentials for secure automated IPTV renewal.
              </p>
            </div>
            <button 
              onClick={() => setShowAddMethodForm(!showAddMethodForm)}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700/60 cursor-pointer"
            >
              {showAddMethodForm ? "Close Form" : "Add Method"}
            </button>
          </div>

          {/* Stored methods list */}
          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <div 
                key={pm.id} 
                className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4"
                id={`pm-item-${pm.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-200 border border-slate-800 rounded-xl text-rose-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {pm.type === "ideal" ? "🏦 iDEAL" : pm.type === "card" ? `${pm.details.cardBrand} Card` : pm.type === "paypal" ? "PayPal" : "Crypto"}
                      </span>
                      {pm.isDefault && (
                        <span className="text-[9px] bg-rose-500/15 text-[#E0345F] border border-rose-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                          Standaard
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700  mt-0.5">
                      {pm.type === "ideal" ? `Bank: ${pm.details.bankName || "iDEAL"}` :
                       pm.type === "card" ? `•••• •••• •••• ${pm.details.last4}` :
                       pm.type === "paypal" ? pm.details.email :
                       `${pm.details.coinType} Wallet: ${pm.details.walletAddress}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!pm.isDefault && (
                    <button 
                      onClick={() => onSetDefaultPaymentMethod(pm.id)}
                      className="p-1 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline px-2"
                    >
                      Set Default
                    </button>
                  )}
                  <button 
                    onClick={() => onDeletePaymentMethod(pm.id)}
                    disabled={pm.isDefault && paymentMethods.length > 1}
                    className="p-2 text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Remove Payment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add method form */}
          {showAddMethodForm && (
            <form onSubmit={handleAddNewPaymentMethod} className="bg-slate-50 border border-slate-800 p-4 rounded-xl space-y-4">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider  border-b border-slate-800 pb-2">
                Setup Secure Account Source
              </h4>

              {/* Pay Selector */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 border border-slate-900 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedPayType("card")}
                  className={`text-[10px] py-1.5 rounded-md font-black transition uppercase ${
                    selectedPayType === "card" ? "bg-[#E0345F] text-white shadow glow-red-sm" : "text-slate-700 hover:text-slate-300"
                  }`}
                >
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayType("paypal")}
                  className={`text-[10px] py-1.5 rounded-md font-black transition uppercase ${
                    selectedPayType === "paypal" ? "bg-[#E0345F] text-white shadow glow-red-sm" : "text-slate-700 hover:text-slate-300"
                  }`}
                >
                  PayPal
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayType("crypto")}
                  className={`text-[10px] py-1.5 rounded-md font-black transition uppercase ${
                    selectedPayType === "crypto" ? "bg-[#E0345F] text-white shadow glow-red-sm" : "text-slate-700 hover:text-slate-300"
                  }`}
                >
                  Crypto
                </button>
              </div>

              {selectedPayType === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1">Card Holder</label>
                    <input 
                      type="text" 
                      value={cardHolder} 
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="e.g. EL IMRAN" 
                      className="w-full bg-white border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1">Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010" 
                      className="w-full bg-white border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-950 "
                    />
                  </div>
                </div>
              )}

              {selectedPayType === "paypal" && (
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1">PayPal Verified Email</label>
                  <input 
                    type="email" 
                    value={paypalEmail} 
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="user@example.com" 
                    className="w-full bg-white border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-950 "
                  />
                </div>
              )}

              {selectedPayType === "crypto" && (
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1">Cryptocurrency Coin</label>
                  <select 
                    value={selectedCoin} 
                    onChange={(e) => setSelectedCoin(e.target.value)}
                    className="w-full bg-white border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                  >
                    <option value="USDT">USDT (TRC-20)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ERC-20)</option>
                    <option value="BNB">Binance Smart Coin (BNB)</option>
                  </select>
                </div>
              )}

              {formError && (
                <p className="text-[10px] text-rose-400 flex items-center gap-1 ">
                  <AlertCircle className="w-3 h-3" />
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-750 text-slate-900 text-xs font-bold py-2 rounded-lg transition"
              >
                Save Payment Source
              </button>
            </form>
          )}

          {/* Automated billing panel configurations */}
          <div className="border-t border-slate-200 pt-4.5">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Automated Renew Settings</span>
                  <span className="text-xs text-slate-700 block mt-0.5">Recurring charges will trigger automatically on your default billing card.</span>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => setAutoRenew(!autoRenew)}
                className={`w-11 h-6.5 rounded-full p-1 transition duration-300 relative focus:outline-none ${
                  autoRenew ? "bg-rose-600" : "bg-slate-800"
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition duration-300 ${
                  autoRenew ? "translate-x-4.5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {autoRenew ? (
              <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Active Plan protected! Auto renewal is schedule for <strong>July 27, 2026</strong>.</span>
              </div>
            ) : (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Warning: Auto-billing deactivated. Streaming services will suspend on expiry.</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoices Logs */}
        <div className="glass-card rounded-2xl p-6 shadow-lg flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-950 tracking-tight">
                Billing Statements & Invoices
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Track historic payments and download certified invoice statements.
              </p>
            </div>
            <FileText className="w-5 h-5 text-rose-400 shrink-0" />
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                id={`invoice-item-${inv.id}`}
                onClick={() => setActiveInvoice(inv)}
                className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl hover:border-slate-700 transition duration-200 cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{inv.planName}</span>
                    <span className="text-[10px] bg-slate-200 border border-slate-800 text-slate-600  px-1.5 py-0.5 rounded">
                      {inv.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-700 mt-1.5 ">
                    <span>{inv.date}</span>
                    <span>•</span>
                    <span>{inv.paymentMethodType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-950 block">€{inv.amount.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block uppercase">BETAALD</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-700" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-700 text-center ">
            Encrypted with SHA-256 SSL Protocol
          </div>
        </div>

      </div>
      </div>}

      {/* REMOVED: checkout modal — orders handled via WhatsApp */}
      {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col"
              id="checkout-modal"
            >
              {/* Checkout Header */}
              <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base text-slate-950">
                    Checkout: {selectedPlan.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">Secure, 256-bit automated transaction server</p>
                </div>
                {checkoutStep !== "confirming" && (
                  <button 
                    onClick={() => setSelectedPlan(null)}
                    className="p-1.5 text-slate-700 hover:text-white rounded-lg hover:bg-slate-800"
                    id="checkout-close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Checkout Progress */}
              <div className="p-6 flex-1 space-y-6">
                
                {/* Steps Router */}
                {checkoutStep === "select_method" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-slate-600 uppercase tracking-widest ">
                      1. Select Payment Channel
                    </h4>

                    <div className="grid grid-cols-1 gap-3">

                      {/* iDEAL option — Dutch default */}
                      <button
                        onClick={() => setSelectedPayType("ideal" as "card")}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition ${
                          (selectedPayType as string) === "ideal"
                            ? "bg-rose-500/10 border-[#E0345F]"
                            : "bg-slate-50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🏦</span>
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">iDEAL</span>
                            <span className="text-xs text-slate-600 block mt-0.5">Betaal veilig via jouw eigen bank — meest populair in NL</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-rose-500/10 text-[#E0345F] border border-rose-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Aanbevolen</span>
                          {(selectedPayType as string) === "ideal" && <CheckCircle className="w-5 h-5 text-[#E0345F] shrink-0" />}
                        </div>
                      </button>

                      {/* Card option */}
                      <button
                        onClick={() => setSelectedPayType("card")}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition ${
                          selectedPayType === "card" 
                            ? "bg-emerald-500/10 border-[#E0345F]" 
                            : "bg-slate-50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-[#10b981]" />
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">Credit or Debit Card</span>
                            <span className="text-xs text-slate-700 block mt-0.5">Pay with Visa, Mastercard, or Amex</span>
                          </div>
                        </div>
                        {selectedPayType === "card" && <CheckCircle className="w-5 h-5 text-[#10b981] shrink-0" />}
                      </button>

                      {/* PayPal option */}
                      <button
                        onClick={() => setSelectedPayType("paypal")}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition ${
                          selectedPayType === "paypal" 
                            ? "bg-emerald-500/10 border-[#E0345F]" 
                            : "bg-slate-50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-amber-400" />
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">PayPal Express Checkout</span>
                            <span className="text-xs text-slate-700 block mt-0.5">Authenticate with your secure PayPal credentials</span>
                          </div>
                        </div>
                        {selectedPayType === "paypal" && <CheckCircle className="w-5 h-5 text-[#10b981] shrink-0" />}
                      </button>

                      {/* Crypto option */}
                      <button
                        onClick={() => setSelectedPayType("crypto")}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition ${
                          selectedPayType === "crypto" 
                            ? "bg-emerald-500/10 border-[#E0345F]" 
                            : "bg-slate-50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-emerald-400" />
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">Cryptocurrency Payment</span>
                            <span className="text-xs text-slate-700 block mt-0.5">Pay with BTC, ETH, BNB or USDT-TRC20</span>
                          </div>
                        </div>
                        {selectedPayType === "crypto" && <CheckCircle className="w-5 h-5 text-[#10b981] shrink-0" />}
                      </button>

                    </div>

                    <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline">
                      <span className="text-xs text-slate-600 font-medium">Nu te betalen:</span>
                      <span className="text-xl font-black text-white">
                        €{(billingPeriod === "annually" ? selectedPlan.price * 0.8 * 12 : selectedPlan.price).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => setCheckoutStep("fill_form")}
                      className="w-full bg-[#E0345F] hover:bg-rose-600 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-lg transition glow-red-button"
                      id="checkout-step-next"
                    >
                      Continue to Payment Credentials
                    </button>
                  </div>
                )}

                {checkoutStep === "fill_form" && (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <h4 className="font-bold text-xs text-slate-600 uppercase tracking-widest ">
                      2. Payment Details ({selectedPayType.toUpperCase()})
                    </h4>

                    {selectedPayType === "card" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-600 mb-1 font-medium">Card Holder Name</label>
                          <input 
                            type="text" 
                            required
                            value={cardHolder} 
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="e.g. EL IMRAN" 
                            className="w-full bg-slate-50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 outline-none focus:border-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1 font-medium">Card Number</label>
                          <input 
                            type="text" 
                            required
                            value={cardNumber} 
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4242 4242 4242 4242" 
                            className="w-full bg-slate-50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950  outline-none focus:border-rose-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-600 mb-1 font-medium">Expiry</label>
                            <input 
                              type="text" 
                              required
                              value={cardExpiry} 
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY" 
                              className="w-full bg-slate-50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950  outline-none focus:border-rose-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1 font-medium">CVC / Security Code</label>
                            <input 
                              type="password" 
                              required
                              value={cardCVC} 
                              onChange={(e) => setCardCVC(e.target.value)}
                              placeholder="•••" 
                              maxLength={4}
                              className="w-full bg-slate-50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950  outline-none focus:border-rose-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPayType === "paypal" && (
                      <div>
                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                          Authenticate safely. Enter your linked PayPal email address below to link express gateway credentials.
                        </p>
                        <label className="block text-xs text-slate-600 mb-1 font-medium">PayPal Email</label>
                        <input 
                          type="email" 
                          required
                          value={paypalEmail} 
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          placeholder="user.iptv@example.com" 
                          className="w-full bg-slate-50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950  outline-none focus:border-rose-500"
                        />
                      </div>
                    )}

                    {selectedPayType === "crypto" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                          {["USDT", "BTC", "ETH", "BNB"].map((coin) => (
                            <button
                              key={coin}
                              type="button"
                              onClick={() => setSelectedCoin(coin)}
                              className={`text-[10px] py-2 rounded-xl font-bold transition border uppercase ${
                                selectedCoin === coin 
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                                  : "bg-slate-50 border-slate-800 text-slate-600 hover:text-white"
                              }`}
                            >
                              {coin}
                            </button>
                          ))}
                        </div>

                        {/* QR Code and Wallet addresses display */}
                        <div className="bg-slate-50 border border-slate-800 p-4 rounded-xl flex flex-col items-center gap-4 text-center">
                          {/* Simulated SVG QR Code */}
                          <div className="w-28 h-28 bg-white p-2.5 rounded-lg">
                            <svg className="w-full h-full text-black" viewBox="0 0 100 100">
                              <rect width="100" height="100" fill="white" />
                              {/* QR Code visual markers */}
                              <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                              <rect x="5" y="5" width="20" height="20" fill="white" />
                              <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                              <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                              <rect x="75" y="5" width="20" height="20" fill="white" />
                              <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                              <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                              <rect x="5" y="75" width="20" height="20" fill="white" />
                              <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                              {/* Matrix simulation lines */}
                              <rect x="40" y="10" width="10" height="40" fill="currentColor" />
                              <rect x="50" y="20" width="10" height="10" fill="currentColor" />
                              <rect x="20" y="45" width="30" height="10" fill="currentColor" />
                              <rect x="70" y="40" width="20" height="20" fill="currentColor" />
                              <rect x="50" y="70" width="30" height="10" fill="currentColor" />
                              <rect x="85" y="75" width="15" height="15" fill="currentColor" />
                            </svg>
                          </div>

                          <div className="min-w-0 w-full">
                            <span className="text-[10px] text-slate-700 block">SEND EXACT AMOUNT</span>
                            <strong className="text-sm text-slate-950 block  mt-0.5">
                              {getCryptoAmount(billingPeriod === "annually" ? selectedPlan.price * 0.8 * 12 : selectedPlan.price, selectedCoin)} {selectedCoin}
                            </strong>
                            
                            {/* Wallet Address bar */}
                            <div className="mt-3 bg-slate-50 border border-slate-900 rounded-lg py-2 px-3 flex items-center justify-between gap-3.5">
                              <span className="text-[11px]  text-emerald-400 truncate text-left">
                                {getCryptoAddress(selectedCoin)}
                              </span>
                              <button 
                                type="button" 
                                onClick={() => handleCopyAddress(getCryptoAddress(selectedCoin))}
                                className="text-slate-700 hover:text-white shrink-0 p-1"
                                title="Copy Address"
                              >
                                {copiedAddress ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Blockchain confirmation scans automatically. Do not close dialog after sending transaction broadcast.</span>
                        </div>
                      </div>
                    )}

                    {formError && (
                      <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3.5 py-2 rounded-xl text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep("select_method")}
                        className="flex-1 bg-slate-200 hover:bg-slate-850 text-slate-800 border border-slate-850 text-xs font-semibold py-3 px-4 rounded-xl transition"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-rose-600 to-rose-600 text-white text-xs font-bold py-3 px-4 rounded-xl hover:from-rose-500 hover:to-rose-500 transition shadow-lg shadow-rose-600/15"
                        id="checkout-btn-auth"
                      >
                        {selectedPayType === "crypto" ? "I Have Broadcasted Transaction" : "Authorize Automated Payment"}
                      </button>
                    </div>
                  </form>
                )}

                {checkoutStep === "confirming" && (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-rose-500 animate-spin" />
                      <CreditCard className="w-6 h-6 text-rose-400 absolute animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-950 uppercase tracking-widest ">
                        Securing Ledger Channel...
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                        Authorizing secure credentials with payment processor. Automated billing schedule is being registered.
                      </p>
                    </div>
                  </div>
                )}

                {checkoutStep === "success" && (
                  <div className="py-6 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      <Check className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-950 tracking-tight">
                        Subscription Synchronized!
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
                        Your IPTV account has been upgraded to <strong className="text-white">{selectedPlan.name}</strong>. Dynamic stream pipelines are ready to play.
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedPlan(null)}
                      className="w-full mt-4 bg-slate-200 hover:bg-slate-850 text-slate-900 text-xs font-bold py-3 px-4 rounded-xl border border-slate-800"
                      id="checkout-btn-success-close"
                    >
                      Enter Streaming Portal
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}

      {/* Printable Invoice detail modal */}
      <AnimatePresence>
        {activeInvoice && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={() => setActiveInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-slate-950 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col p-6 font-sans relative"
              id="invoice-details-modal"
            >
              {/* Close in modal */}
              <button 
                onClick={() => setActiveInvoice(null)}
                className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 text-rose-600 font-extrabold text-lg">
                  <span>goedkopeiptv IPTV</span>
                </div>
                <p className="text-[10px] text-slate-700  mt-1">Invoice Statement #{activeInvoice.id}</p>
              </div>

              {/* Receipt Body */}
              <div className="py-5 space-y-6">
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-600 block font-medium uppercase tracking-wider text-[10px]">Merchant</span>
                    <strong className="text-slate-950 mt-1 block">goedkopeiptv Holdings Ltd.</strong>
                    <span className="text-slate-700 mt-0.5 block leading-tight">Canary Wharf, London, E14 5AB</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block font-medium uppercase tracking-wider text-[10px]">Billed To</span>
                    <strong className="text-slate-950 mt-1 block">EL IMRAN</strong>
                    <span className="text-slate-700 mt-0.5 block">elimran499@gmail.com</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-700 font-bold border-b border-slate-200 pb-2 mb-2">
                    <span>Description</span>
                    <span>Price</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-slate-950 py-1">
                    <span>IPTV Service Package: {activeInvoice.planName}</span>
                    <span>€{activeInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 py-0.5 text-[11px]">
                    <span>BTW (21% — inbegrepen)</span>
                    <span>€0.00 (Inbegrepen)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-4 text-sm font-bold text-slate-900">
                  <span>Totaal Betaald</span>
                  <span className="text-lg font-black text-[#E0345F]">€{activeInvoice.amount.toFixed(2)}</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold block">Transaction Certified Completed</span>
                    Secure network hash: <strong className=" text-[10px] block mt-0.5 break-all">{activeInvoice.transactionHash}</strong>
                  </div>
                </div>
              </div>

              {/* Invoice Footer Actions */}
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full bg-slate-200 hover:bg-slate-850 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download / Print Statement PDF</span>
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
