import React, { useState } from "react";
import { Sparkles, CheckCircle2, Copy, Check } from "lucide-react";

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 3) {
      setSubscribed(true);
      fetch("/api/notifications/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      }).catch((err) => console.log("Newsletter notification error:", err));
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText("ZENVIAVIP10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#090909] via-[#121212] to-[#090909] border-t border-neutral-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto glass-panel p-8 sm:p-14 rounded-3xl border border-[#D4AF37]/30 text-center relative z-10 shadow-2xl">
        <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium tracking-[0.25em] uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ZENVIA PRIVILEGE CLUB</span>
        </span>

        <h2 className="font-serif-luxury text-4xl sm:text-6xl font-light text-white mb-4">
          Join The Private Salon
        </h2>

        <p className="text-neutral-300 text-sm sm:text-base font-light max-w-xl mx-auto mb-8 leading-relaxed">
          Receive confidential invitations to secret drop releases, bespoke private concierge access, and a 10% welcome privilege code.
        </p>

        {!subscribed ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your confidential email..."
              className="flex-1 bg-black/80 border border-neutral-700 rounded-full px-6 py-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
            <button
              type="submit"
              className="px-8 py-3.5 rounded-full btn-gold-fill text-xs uppercase tracking-[0.2em] font-semibold whitespace-nowrap shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              Request Access
            </button>
          </form>
        ) : (
          <div className="bg-[#121212] border border-[#D4AF37]/50 p-6 rounded-2xl max-w-md mx-auto text-left shadow-2xl animate-fade-in">
            <div className="flex items-center space-x-2 text-emerald-400 font-medium text-sm mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Privilege Access Granted</span>
            </div>
            <p className="text-xs text-neutral-300 font-light mb-4">
              Your email has been added to our private concierge register. Use your exclusive welcome code below during checkout:
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-[#D4AF37]/40">
              <span className="font-mono text-base text-[#D4AF37] font-bold tracking-widest">
                ZENVIAVIP10
              </span>
              <button
                onClick={copyCode}
                className="px-3 py-1.5 rounded border border-[#D4AF37]/40 bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-medium flex items-center space-x-1 hover:bg-[#D4AF37] hover:text-black transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "COPIED" : "COPY CODE"}</span>
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-[10px] text-neutral-500 tracking-widest uppercase font-light">
          We respect absolute discretion. Zero spam guarantee.
        </p>
      </div>
    </section>
  );
};
