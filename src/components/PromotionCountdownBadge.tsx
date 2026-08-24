import React from "react";
import { Flame, Clock, AlertCircle } from "lucide-react";
import { usePromotionCountdown, PROMOTION_CONFIG } from "../lib/promotionConfig";

interface PromotionCountdownBadgeProps {
  variant?: "product-page" | "checkout" | "compact";
  className?: string;
}

export const PromotionCountdownBadge: React.FC<PromotionCountdownBadgeProps> = ({
  variant = "product-page",
  className = "",
}) => {
  const { isActive, isExpired, hours, minutes, seconds } = usePromotionCountdown();

  // If promotion is not enabled in configuration, don't render anything
  if (!PROMOTION_CONFIG.enabled) {
    return null;
  }

  // Expired State
  if (isExpired) {
    return (
      <div
        className={`p-2.5 sm:p-3 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs flex items-center space-x-2 ${className}`}
      >
        <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
        <div>
          <span className="font-bold text-neutral-700 block">
            {PROMOTION_CONFIG.expiredNotice}
          </span>
          <span className="text-[11px] text-neutral-500">Standard catalog pricing applies.</span>
        </div>
      </div>
    );
  }

  // Checkout Compact Variant
  if (variant === "checkout") {
    return (
      <div
        className={`px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between text-xs ${className}`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 shrink-0">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <span className="font-extrabold text-neutral-900 tracking-tight block">
              {PROMOTION_CONFIG.checkoutNotice}
            </span>
            <span className="text-[11px] text-neutral-500 font-medium">
              Deal ends in:
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 font-mono font-black text-amber-900 text-xs sm:text-sm bg-white/90 px-2.5 py-1 rounded-lg border border-amber-300/70 shadow-2xs">
          <span>{hours}</span>
          <span className="text-amber-500">:</span>
          <span>{minutes}</span>
          <span className="text-amber-500">:</span>
          <span>{seconds}</span>
        </div>
      </div>
    );
  }

  // Compact Variant (e.g. for sticky bars)
  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300/80 text-amber-950 text-xs font-medium ${className}`}
      >
        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600 shrink-0" />
        <span className="font-bold text-[11px] uppercase tracking-wider text-amber-900">
          Deal Ends In:
        </span>
        <span className="font-mono font-black text-xs text-amber-900">
          {hours}:{minutes}:{seconds}
        </span>
      </div>
    );
  }

  // Product Page Full Highlight Variant
  return (
    <div
      id="product-limited-time-deal"
      className={`rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50/70 p-3 sm:p-3.5 shadow-2xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        {/* Left Side: Header & Subtext */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Flame className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                {PROMOTION_CONFIG.badgeText}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            </div>
            <p className="text-[11px] text-amber-900/80 font-medium">
              {PROMOTION_CONFIG.activeSubtext}
            </p>
          </div>
        </div>

        {/* Right Side: Clean Digital Countdown Blocks */}
        <div className="flex items-center space-x-1.5 self-start sm:self-center">
          <span className="text-[10px] uppercase font-bold text-amber-900/70 tracking-wider mr-1 hidden xs:inline">
            Ends in:
          </span>
          {/* Hours Block */}
          <div className="flex flex-col items-center">
            <div className="min-w-[34px] sm:min-w-[38px] px-1.5 py-1 bg-white border border-amber-300 rounded-lg text-center shadow-2xs font-mono font-black text-sm sm:text-base text-neutral-900">
              {hours}
            </div>
            <span className="text-[9px] font-bold text-amber-900/70 uppercase tracking-widest mt-0.5">
              HRS
            </span>
          </div>

          <span className="font-mono font-bold text-amber-600 text-sm -mt-3.5">:</span>

          {/* Minutes Block */}
          <div className="flex flex-col items-center">
            <div className="min-w-[34px] sm:min-w-[38px] px-1.5 py-1 bg-white border border-amber-300 rounded-lg text-center shadow-2xs font-mono font-black text-sm sm:text-base text-neutral-900">
              {minutes}
            </div>
            <span className="text-[9px] font-bold text-amber-900/70 uppercase tracking-widest mt-0.5">
              MIN
            </span>
          </div>

          <span className="font-mono font-bold text-amber-600 text-sm -mt-3.5">:</span>

          {/* Seconds Block */}
          <div className="flex flex-col items-center">
            <div className="min-w-[34px] sm:min-w-[38px] px-1.5 py-1 bg-white border border-amber-300 rounded-lg text-center shadow-2xs font-mono font-black text-sm sm:text-base text-amber-800">
              {seconds}
            </div>
            <span className="text-[9px] font-bold text-amber-900/70 uppercase tracking-widest mt-0.5">
              SEC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
