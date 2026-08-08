import React, { useState, useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { PRODUCTS } from "../data/products";
import { Product } from "../types";

interface RecentlyPurchasedPopupProps {
  onQuickView: (p: Product) => void;
}

export const RecentlyPurchasedPopup: React.FC<RecentlyPurchasedPopupProps> = ({ onQuickView }) => {
  const [visible, setVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [location, setLocation] = useState("Zurich, Switzerland");
  const [timeAgo, setTimeAgo] = useState("2m ago");

  const locations = [
    "Geneva, Switzerland",
    "London, United Kingdom",
    "Tokyo, Japan",
    "Dubai, UAE",
    "New York, USA",
    "Paris, France",
    "Monaco",
  ];

  const times = ["Just now", "2m ago", "5m ago", "12m ago", "18m ago"];

  useEffect(() => {
    // Show toast after 6 seconds initial delay, then cycle every 25 seconds
    const initialTimer = setTimeout(() => {
      showRandomToast();
    }, 6000);

    const intervalTimer = setInterval(() => {
      showRandomToast();
    }, 25000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const showRandomToast = () => {
    const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const randomLoc = locations[Math.floor(Math.random() * locations.length)];
    const randomTime = times[Math.floor(Math.random() * times.length)];

    setCurrentProduct(randomProduct);
    setLocation(randomLoc);
    setTimeAgo(randomTime);
    setVisible(true);

    // Auto hide after 6 seconds
    setTimeout(() => {
      setVisible(false);
    }, 6000);
  };

  if (!visible || !currentProduct) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm bg-[#121212]/95 border border-[#D4AF37]/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center space-x-3 text-xs animate-slide-up">
      <img
        src={currentProduct.image}
        alt={currentProduct.name}
        referrerPolicy="no-referrer"
        className="w-12 h-12 rounded-lg object-cover border border-neutral-800 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1.5 text-[10px] text-[#D4AF37] font-medium mb-0.5">
          <ShoppingBag className="w-3 h-3" />
          <span>RECENT PRIVILEGE ACQUISITION</span>
        </div>
        <p className="text-white font-medium text-xs truncate">{currentProduct.name}</p>
        <p className="text-[10px] text-neutral-400 font-light">
          Client in {location} • <span className="text-neutral-500 font-mono">{timeAgo}</span>
        </p>
      </div>

      <div className="flex flex-col space-y-1">
        <button
          onClick={() => setVisible(false)}
          className="text-neutral-500 hover:text-white p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            onQuickView(currentProduct);
            setVisible(false);
          }}
          className="text-[10px] text-[#D4AF37] font-semibold underline"
        >
          View
        </button>
      </div>
    </div>
  );
};
