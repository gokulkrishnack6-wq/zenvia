import React, { useState } from "react";
import { Star, X } from "lucide-react";

export const DiscountBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="w-full bg-[#fcedea] text-neutral-800 text-[11px] sm:text-xs py-1.5 px-3 tracking-normal border-b border-[#f1d0c8]/60 font-medium select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-3 text-center">
          <div className="flex items-center space-x-1 justify-center">
            <div className="flex text-amber-500">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 text-amber-500" />
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 text-amber-500" />
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 text-amber-500" />
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 text-amber-500" />
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 text-amber-500" />
            </div>
            <span className="font-semibold text-neutral-900 ml-1 text-[11px] sm:text-xs">
              Thousands of happy customers
            </span>
          </div>

          <span className="hidden sm:inline text-neutral-400 font-bold">•</span>

          <span className="inline-flex items-center space-x-1.5 font-bold uppercase tracking-wider text-neutral-800 text-[10px] sm:text-xs">
            <span>📦 Free delivery on all orders across India</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-neutral-500 hover:text-neutral-900 transition-colors p-1 ml-2 shrink-0 cursor-pointer"
          title="Dismiss Announcement"
          aria-label="Dismiss Announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


