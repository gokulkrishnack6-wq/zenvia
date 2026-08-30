import React, { useState, useEffect } from "react";
import {
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  AlertCircle,
  Wrench,
  Droplets,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Sparkle,
  Truck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SinkCaddyCountdownAdGraphicProps {
  onShopNow?: () => void;
  className?: string;
  variant?: "standalone-card" | "embedded" | "ad-preview";
}

interface StoryScene {
  id: number;
  timeRange: string;
  phase: string;
  badge: string;
  badgeColor: string;
  headline: string;
  subtext: string;
  image: string;
  imageAlt: string;
  keyFeature: string;
}

const STORY_SCENES: StoryScene[] = [
  {
    id: 1,
    timeRange: "0–3s",
    phase: "THE PROBLEM",
    badge: "❌ REAL SINK FRUSTRATION",
    badgeColor: "bg-red-600 text-white",
    headline: "Is your sink always this messy?",
    subtext: "Wet sponges and dirty scrubbers sitting directly on the sink rim create standing water puddles.",
    image: "https://m.media-amazon.com/images/I/61sCt2dINzL._SL1000_.jpg",
    imageAlt: "Messy sink with sponges and scrubbers sitting in standing water puddle",
    keyFeature: "Soap scum, soggy sponges, and cluttered countertops",
  },
  {
    id: 2,
    timeRange: "3–6s",
    phase: "THE AGITATION",
    badge: "⚠️ UNHYGIENIC & SOGGY",
    badgeColor: "bg-amber-600 text-white",
    headline: "Sponges stay damp & smell bad",
    subtext: "Leaving damp sponges flat on counters traps moisture underneath and stains your countertop.",
    image: "https://m.media-amazon.com/images/I/71cMeldHQxL._SL1494_.jpg",
    imageAlt: "Water puddles and dirty counters around standard kitchen sinks",
    keyFeature: "Damp sponges take hours to dry when trapped in puddles",
  },
  {
    id: 3,
    timeRange: "6–10s",
    phase: "THE SOLUTION",
    badge: "✨ THE INSTANT FIX",
    badgeColor: "bg-emerald-600 text-white",
    headline: "Meet the ZENVIA Stainless Sink Caddy",
    subtext: "A dedicated stainless steel organizer that mounts directly to your faucet pipe in 10 seconds.",
    image: "https://m.media-amazon.com/images/I/61Boe-yze0L._SL1444_.jpg",
    imageAlt: "ZENVIA Stainless Steel Sink Caddy installed on faucet pipe",
    keyFeature: "Organizes sponge, scrubber, brush & accessories neatly",
  },
  {
    id: 4,
    timeRange: "10–15s",
    phase: "10-SEC INSTALLATION",
    badge: "🔧 ZERO DRILLING OR TOOLS",
    badgeColor: "bg-blue-600 text-white",
    headline: "Clamps onto faucet in 10 seconds",
    subtext: "Simply snap the bracket around any round faucet pipe (18-28mm) and tighten the twist knob.",
    image: "https://m.media-amazon.com/images/I/71nGZ8JZcAL._SL1500_.jpg",
    imageAlt: "Step-by-step demonstration of twist clamp installation on faucet pipe without tools",
    keyFeature: "No drilling • No sticky adhesive • No suction cups falling off",
  },
  {
    id: 5,
    timeRange: "15–20s",
    phase: "THE TRANSFORMATION",
    badge: "🌊 OPEN-DRAIN TECHNOLOGY",
    badgeColor: "bg-teal-600 text-white",
    headline: "Dries 3x faster straight into the drain",
    subtext: "Heavy-duty 304 food-grade stainless steel allows continuous 360° airflow so items stay clean and dry.",
    image: "https://m.media-amazon.com/images/I/71CMXXxF3UL._SL1200_.jpg",
    imageAlt: "Water draining freely from sink caddy directly into kitchen sink",
    keyFeature: "100% Rustproof 304 Stainless Steel • Built for heavy daily use",
  },
  {
    id: 6,
    timeRange: "20–24s",
    phase: "22-HOUR LIMITED OFFER",
    badge: "⏳ 22-HOUR FLASH DEAL",
    badgeColor: "bg-red-600 text-white",
    headline: "Special Offer: ₹299 (50% OFF)",
    subtext: "Original price ₹599. Genuine 22-hour flash price with Free Delivery and Cash on Delivery across India.",
    image: "https://res.cloudinary.com/vgl84jqo/image/upload/v1787247251/Codex_Image_Aug_20_2026_11_03_50_PM.png",
    imageAlt: "ZENVIA Stainless Steel Sink Caddy high quality packaging and product",
    keyFeature: "₹299 Special Price • Free Delivery • Cash on Delivery",
  },
];

export const SinkCaddyCountdownAdGraphic: React.FC<SinkCaddyCountdownAdGraphicProps> = ({
  onShopNow,
  className = "",
}) => {
  // Creative Mode Toggle: 'direct-response-card' (High-converting Feed ad) vs 'video-storyboard' (0-28s Interactive UGC Story)
  const [activeTab, setActiveTab] = useState<"card" | "story">("card");
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlayingStory, setIsPlayingStory] = useState<boolean>(true);

  // 22-Hour Countdown State
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: "22",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const STORAGE_KEY = "zenvia_sink_caddy_22h_timer_start";
    let startTime = localStorage.getItem(STORAGE_KEY);

    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(STORAGE_KEY, startTime);
    }

    const durationMs = 22 * 60 * 60 * 1000;

    const updateCountdown = () => {
      const start = parseInt(startTime || Date.now().toString(), 10);
      const elapsed = Date.now() - start;
      const remainingMs = Math.max(0, durationMs - (elapsed % durationMs));

      const totalSecs = Math.floor(remainingMs / 1000);
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      const pad = (n: number) => String(n).padStart(2, "0");
      setTimeLeft({
        hours: pad(hrs),
        minutes: pad(mins),
        seconds: pad(secs),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Storyboard Auto-play interval (4s per scene)
  useEffect(() => {
    if (!isPlayingStory || activeTab !== "story") return;

    const storyTimer = setInterval(() => {
      setCurrentSceneIdx((prev) => (prev + 1) % STORY_SCENES.length);
    }, 4000);

    return () => clearInterval(storyTimer);
  }, [isPlayingStory, activeTab]);

  const handleCtaClick = () => {
    if (onShopNow) {
      onShopNow();
    } else {
      const target =
        document.getElementById("product-pricing-card") ||
        document.getElementById("direct-buy-now-btn") ||
        document.getElementById("order-form-direct");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const currentScene = STORY_SCENES[currentSceneIdx];

  return (
    <div
      id="sink-caddy-direct-response-ad"
      className={`relative w-full max-w-2xl mx-auto overflow-hidden rounded-2xl bg-white border border-neutral-300/80 shadow-2xl text-neutral-900 font-sans ${className}`}
    >
      {/* Top Spotlight Badge & Format Switcher */}
      <div className="bg-neutral-950 text-white px-3.5 py-2 flex items-center justify-between border-b border-neutral-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-[11px] text-neutral-300">
            OFFICIAL ZENVIA PRODUCT SPOTLIGHT
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700">
          <button
            onClick={() => setActiveTab("card")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === "card"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Product Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("story")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === "story"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Play className="w-3 h-3" />
            <span>Step-by-Step Demo</span>
          </button>
        </div>
      </div>

      {/* Top 22-Hour Urgency Banner */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
            LIMITED-TIME OFFER
          </span>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 text-[11px] sm:text-xs font-black tracking-wider">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>ENDS IN 22 HOURS</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: HIGH-CONVERTING DIRECT-RESPONSE FEED AD (Before/After + Transformation) */}
      {/* ========================================================================= */}
      {activeTab === "card" && (
        <div className="p-4 sm:p-6 bg-gradient-to-b from-neutral-50 via-white to-neutral-50">
          {/* PROBLEM HOOK HEADLINE */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center space-x-1 px-3 py-1 mb-2 rounded-full bg-red-100 border border-red-200 text-red-800 text-[11px] font-black uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>THE DAILY SINK PROBLEM</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-950 tracking-tight leading-tight">
              Is your sink always this messy?
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1 max-w-md mx-auto">
              Stop leaving wet sponges and dirty scrubbers sitting in standing water puddles.
            </p>
          </div>

          {/* BEFORE VS AFTER TRANSFORMATION VISUAL */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-neutral-300 bg-neutral-900 shadow-lg mb-5 group">
            {/* Split Comparison Header */}
            <div className="grid grid-cols-2 text-center text-xs font-black uppercase tracking-wider text-white py-1.5 bg-neutral-950/90 border-b border-neutral-800 z-20 relative">
              <div className="text-red-400 flex items-center justify-center space-x-1 border-r border-neutral-800">
                <span>❌ BEFORE: Messy Sink Rim</span>
              </div>
              <div className="text-emerald-400 flex items-center justify-center space-x-1">
                <span> AFTER: Clean &amp; Dry</span>
              </div>
            </div>

            {/* Split Container with Side-by-Side Visuals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 relative bg-neutral-100">
              {/* Left Side: Before Messy */}
              <div className="relative aspect-4/3 sm:aspect-square bg-neutral-200 overflow-hidden border-b sm:border-b-0 sm:border-r border-neutral-300">
                <img
                  src="https://m.media-amazon.com/images/I/61sCt2dINzL._SL1000_.jpg"
                  alt="Messy sink with soggy sponges and dirty water puddles"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 bg-red-700 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-md">
                  Standing Water &amp; Scum
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white p-1.5 rounded text-[10px] text-center font-medium">
                  Sponges stay damp, collect odor, and stain countertops
                </div>
              </div>

              {/* Right Side: After Clean & Organized */}
              <div className="relative aspect-4/3 sm:aspect-square bg-neutral-100 overflow-hidden">
                <img
                  src="https://m.media-amazon.com/images/I/61Boe-yze0L._SL1444_.jpg"
                  alt="Clean kitchen sink with ZENVIA Adjustable Stainless Steel Sink Caddy installed"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 right-2.5 bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-md">
                  Mounted &amp; Draining
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/85 backdrop-blur-xs text-emerald-200 p-1.5 rounded text-[10px] text-center font-bold">
                  Water drips straight into drain • Dries 3x faster
                </div>
              </div>
            </div>

            {/* Middle Transformation Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-neutral-950 font-black shadow-xl border-2 border-white text-xs">
              VS
            </div>
          </div>

          {/* 3 PRE-PURCHASE OBJECTION KILLERS (Value & Trust) */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs text-center flex flex-col items-center justify-center">
              <Wrench className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-[11px] font-black text-neutral-900 leading-tight">
                No Drilling / Tools
              </span>
              <span className="text-[9px] text-neutral-500 mt-0.5">
                Clamps onto faucet in 10s
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs text-center flex flex-col items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-[11px] font-black text-neutral-900 leading-tight">
                100% 304 Stainless
              </span>
              <span className="text-[9px] text-neutral-500 mt-0.5">
                Food-grade rustproof steel
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs text-center flex flex-col items-center justify-center">
              <Droplets className="w-4 h-4 text-cyan-600 mb-1" />
              <span className="text-[11px] font-black text-neutral-900 leading-tight">
                Fast Air-Drainage
              </span>
              <span className="text-[9px] text-neutral-500 mt-0.5">
                Drips directly in sink
              </span>
            </div>
          </div>

          {/* ⏰ THE HERO DIGITAL COUNTDOWN TIMER BLOCK */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-950 text-white shadow-lg border border-neutral-800 relative overflow-hidden mb-5">
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center space-x-1.5 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>22-HOUR LIMITED-TIME OFFER EXPIRES IN</span>
              </div>

              {/* Segmented Digital Clock */}
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 w-full max-w-sm">
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full py-2 sm:py-2.5 px-1 rounded-lg bg-neutral-900 border-2 border-red-500/80 shadow-inner flex items-center justify-center">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-white tracking-widest">
                      {timeLeft.hours}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                    HOURS
                  </span>
                </div>

                <span className="font-mono font-black text-xl sm:text-2xl text-amber-400 -mt-3 animate-pulse">
                  :
                </span>

                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full py-2 sm:py-2.5 px-1 rounded-lg bg-neutral-900 border-2 border-amber-500/80 shadow-inner flex items-center justify-center">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-white tracking-widest">
                      {timeLeft.minutes}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                    MINUTES
                  </span>
                </div>

                <span className="font-mono font-black text-xl sm:text-2xl text-amber-400 -mt-3 animate-pulse">
                  :
                </span>

                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full py-2 sm:py-2.5 px-1 rounded-lg bg-neutral-900 border-2 border-red-500/80 shadow-inner flex items-center justify-center">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-red-400 tracking-widest">
                      {timeLeft.seconds}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                    SECONDS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PRICE & DIRECT PURCHASE CTA (Pre-qualifies Buyer & High Purchase Rate) */}
          <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl sm:text-3xl font-black text-neutral-950">
                  ₹299
                </span>
                <span className="text-sm text-neutral-400 line-through font-semibold">
                  ₹599
                </span>
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                  50% OFF
                </span>
              </div>
              <div className="text-[11px] font-bold text-emerald-700 mt-0.5 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Free Delivery Across India • Cash on Delivery</span>
              </div>
            </div>

            {/* High Intent Purchase CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCtaClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>ORDER NOW — ₹299 (50% OFF)</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: 0–28 SEC VIDEO / STORY DIRECT-RESPONSE SEQUENCE SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === "story" && (
        <div className="p-4 sm:p-6 bg-neutral-950 text-white">
          {/* Story Progress Bars */}
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {STORY_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  setCurrentSceneIdx(idx);
                  setIsPlayingStory(false);
                }}
                className="group flex flex-col items-center cursor-pointer"
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all ${
                    idx === currentSceneIdx
                      ? "bg-amber-400 shadow-sm"
                      : idx < currentSceneIdx
                      ? "bg-neutral-600"
                      : "bg-neutral-800"
                  }`}
                />
                <span className="text-[9px] text-neutral-400 mt-1 font-mono">
                  {scene.timeRange}
                </span>
              </button>
            ))}
          </div>

          {/* Active Story Scene Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800"
            >
              {/* Scene Header */}
              <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider ${currentScene.badgeColor}`}
                >
                  {currentScene.badge}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-400">
                  SCENE {currentScene.id} / 6 • {currentScene.phase}
                </span>
              </div>

              {/* Visual Demo Frame */}
              <div className="relative aspect-16/10 sm:aspect-16/9 bg-neutral-950 overflow-hidden">
                <img
                  src={currentScene.image}
                  alt={currentScene.imageAlt}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />

                {/* Subtitle Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {currentScene.headline}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-0.5 font-medium">
                    {currentScene.subtext}
                  </p>
                </div>
              </div>

              {/* Feature Callout */}
              <div className="p-3 bg-neutral-900/90 text-xs font-bold text-amber-300 flex items-center space-x-2 border-t border-neutral-800">
                <Sparkle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{currentScene.keyFeature}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Sequence Playback Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlayingStory(!isPlayingStory)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer text-white"
              >
                {isPlayingStory ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pause Sequence</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Play Demo</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setCurrentSceneIdx(0)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-400 hover:text-white cursor-pointer"
                title="Restart Story"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCtaClick}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <span>ORDER NOW — ₹299 (50% OFF)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Trust & Guarantee Strip */}
      <div className="px-4 py-2.5 bg-neutral-100 border-t border-neutral-200 grid grid-cols-3 gap-2 text-center text-[10px] text-neutral-700 font-bold">
        <div className="flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>304 Stainless Steel</span>
        </div>
        <div className="flex items-center justify-center space-x-1">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Cash on Delivery</span>
        </div>
        <div className="flex items-center justify-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Fits 18–28mm Faucets</span>
        </div>
      </div>
    </div>
  );
};
