import React from "react";
import { X, Award, ShieldCheck, Clock, Key, Sparkles, MapPin, Package } from "lucide-react";
import { Currency } from "../types";

interface AccountModalProps {
  isOpen: boolean;
  currency: Currency;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, currency, onClose }) => {
  if (!isOpen) return null;

  const mockOrders = [
    {
      id: "ZV-891024",
      date: "August 1, 2026",
      product: "Audion S1 Titanium Headphones",
      total: 1290,
      status: "In Transit via Zurich Climate Courier",
    },
    {
      id: "ZV-710492",
      date: "July 18, 2026",
      product: "Lumina Kinetic Ambient Lamp",
      total: 2400,
      status: "Delivered & Certificate Verified",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#090909] border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-black flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-serif-luxury text-xl text-white">
              Zenvia Privilege Salon
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* VIP Black Card Presentation */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#1c1c1c] via-[#0d0d0d] to-[#000000] border border-[#D4AF37]/50 shadow-[0_10px_30px_rgba(212,175,55,0.2)] overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full border border-[#D4AF37] flex items-center justify-center bg-black">
                  <span className="font-serif-luxury text-base text-[#D4AF37]">Z</span>
                </div>
                <span className="font-serif-luxury text-2xl text-white tracking-widest uppercase font-medium">
                  ZENVIA
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black font-bold px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4E0A5]">
                BLACK CARD PRIVILEGE
              </span>
            </div>

            <div className="space-y-1 relative z-10 mb-8">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">
                Privilege Member Name
              </span>
              <p className="font-serif-luxury text-2xl text-white">
                Alexander von Bern
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono relative z-10 pt-4 border-t border-neutral-800/80">
              <div>
                <span className="text-[9px] uppercase text-neutral-500 block">Member ID</span>
                <span className="text-[#D4AF37]">ZV-VIP-88910</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-neutral-500 block">Atelier Region</span>
                <span className="text-white">Zurich / London</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-neutral-500 block">Privilege Status</span>
                <span className="text-emerald-400">Active</span>
              </div>
            </div>
          </div>

          {/* Member Benefits */}
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium block mb-3">
              Included VIP Privileges
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#121212] border border-neutral-800 space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-semibold text-white block">Dedicated Concierge</span>
                <p className="text-[11px] text-neutral-400 font-light">24/7 private WhatsApp & phone access to Zurich atelier.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-neutral-800 space-y-1">
                <Key className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-semibold text-white block">Private Secret Drops</span>
                <p className="text-[11px] text-neutral-400 font-light">48h early preview access before global collection launches.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-neutral-800 space-y-1">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-semibold text-white block">Atelier Servicing</span>
                <p className="text-[11px] text-neutral-400 font-light">Complimentary annual cleaning, tuning, & laser recalibration.</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block mb-3">
              Privilege Acquisition History
            </span>

            <div className="space-y-3">
              {mockOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-[#121212] border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs space-y-2 sm:space-y-0"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-[#D4AF37]" />
                      <span className="font-mono text-[#D4AF37] font-semibold">{ord.id}</span>
                      <span className="text-neutral-500">• {ord.date}</span>
                    </div>
                    <p className="font-serif-luxury text-base text-white">{ord.product}</p>
                    <p className="text-[10px] text-emerald-400">{ord.status}</p>
                  </div>

                  <span className="font-mono text-sm font-semibold text-white">
                    {currency.symbol}{(ord.total * currency.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
