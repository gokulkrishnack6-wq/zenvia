import React, { useState } from "react";
import { X, ShieldCheck, Truck, RotateCcw, Phone, Mail, MapPin, Award, CheckCircle2, Lock } from "lucide-react";
import { ZenviaLogo } from "./ZenviaLogo";

export type PolicyTab = "shipping" | "returns" | "authenticity" | "about" | "contact";

interface PolicyModalProps {
  isOpen: boolean;
  defaultTab?: PolicyTab;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, defaultTab = "shipping", onClose }) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(defaultTab);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError("Please fill in your name, email address, and message.");
      return;
    }

    setContactSubmitting(true);
    try {
      const res = await fetch("/api/notifications/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim() || undefined,
          subject: contactSubject.trim() || "Customer Enquiry",
          message: contactMessage.trim(),
        }),
      });

      const data = await res.json();
      setContactSubmitting(false);

      if (res.ok && data.success) {
        setContactSuccess(true);
        setContactName("");
        setContactEmail("");
        setContactPhone("");
        setContactSubject("");
        setContactMessage("");
        setTimeout(() => setContactSuccess(false), 5000);
      } else {
        setContactError(data.error || "Failed to send message. Please try again.");
      }
    } catch (err: any) {
      setContactSubmitting(false);
      setContactError("Network error. Please try again later.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#090909] border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[85vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-black flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ZenviaLogo variant="gold" className="h-8 w-auto" />
            <h3 className="font-serif-luxury text-xl text-white">Client Services</h3>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-[#121212] overflow-x-auto no-scrollbar px-4 pt-2">
          <button
            onClick={() => setActiveTab("shipping")}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "shipping"
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Ships Across India
          </button>

          <button
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "returns"
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            7-Day Returns & Refund
          </button>

          <button
            onClick={() => setActiveTab("authenticity")}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "authenticity"
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            100% Genuine Guarantee
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "about"
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            About Maison
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "contact"
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Contact & Concierge
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs font-light text-neutral-300 leading-relaxed">
          {activeTab === "shipping" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-[#D4AF37]">
                <Truck className="w-6 h-6" />
                <h4 className="font-serif-luxury text-2xl text-white">🚚 Delivery Across India</h4>
              </div>

              <p>
                Delivery availability and estimated delivery time may vary by product and location. At Zenvia, orders are dispatched across India using trusted logistics partners.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#121212] border border-neutral-800 space-y-1">
                  <span className="text-white font-semibold block text-sm">Metro 24-48 Hour Delivery</span>
                  <p className="text-neutral-400 text-[11px]">
                    Guaranteed overnight or 2-day delivery to Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, and Ahmedabad.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#121212] border border-neutral-800 space-y-1">
                  <span className="text-white font-semibold block text-sm">Free Shipping over ₹1,999</span>
                  <p className="text-neutral-400 text-[11px]">
                    All orders above ₹1,999 qualify for complimentary white-glove express insured delivery.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black border border-[#D4AF37]/30 flex items-center space-x-3">
                <Lock className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <div>
                  <span className="text-white font-medium block">Tamper-Evident Velvet Vault Packaging</span>
                  <p className="text-[11px] text-neutral-400">
                    Each package features a unique serialized security seal. Do not accept the delivery if the gold seal is broken.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "returns" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-[#D4AF37]">
                <RotateCcw className="w-6 h-6" />
                <h4 className="font-serif-luxury text-2xl text-white">7-Day Easy Replacement & Instant Refund</h4>
              </div>

              <p>
                We stand behind every single product in our catalog. If your order arrives with any flaw or does not match your expectations, you enjoy a hassle-free 7-day replacement or full refund.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span><strong>Doorstep Pickup Across India:</strong> Our courier executive will collect the item directly from your address at zero extra cost.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span><strong>Instant UPI / Bank Refund:</strong> Refund is processed within 2 hours of quality inspection at our hub directly to your GPay, PhonePe, UPI ID, or Bank Account.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span><strong>Zero Return Fee:</strong> We bear all return shipping and handling expenses.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "authenticity" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-[#D4AF37]">
                <ShieldCheck className="w-6 h-6" />
                <h4 className="font-serif-luxury text-2xl text-white">100% Quality Checked & Genuine Guarantee</h4>
              </div>

              <p>
                Zenvia enforces a strict zero-counterfeit policy. Every timepiece, audio driver, ceramic body, and leather piece undergoes a 12-point manual inspection by master quality engineers prior to sealing.
              </p>

              <div className="p-4 rounded-xl bg-[#121212] border border-neutral-800 space-y-2">
                <div className="flex items-center space-x-2 text-[#D4AF37]">
                  <Award className="w-4 h-4" />
                  <span className="font-semibold text-white">Certificate of Authenticity Included</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Every order includes a physical engraved certificate containing the unique serial number, inspection date, and master artisan signature.
                </p>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              <h4 className="font-serif-luxury text-2xl text-white">India’s Premier Luxury Lifestyle Store</h4>
              <p>
                "Luxury isn't a product. It's an experience." Zenvia was established to bring world-class design, engineering, and craftsmanship to discerning Indian buyers.
              </p>
              <p>
                From acoustic transducers machined out of titanium to hand-carved Marquina marble kinetic lamps, Zenvia bridges timeless luxury aesthetics with modern Indian living.
              </p>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <h4 className="font-serif-luxury text-2xl text-white">24/7 Indian Concierge Helpline</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#121212] border border-neutral-800 flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Toll-Free Helpline</span>
                    <span className="text-sm font-mono text-[#D4AF37] block mt-0.5">1800-ZENVIA-IN (1800-936-842)</span>
                    <span className="text-[10px] text-neutral-500">Mon - Sun: 24/7 Support</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121212] border border-neutral-800 flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Official Email Support</span>
                    <span className="text-xs font-mono text-[#D4AF37] block mt-0.5">support@zenvia.in</span>
                    <span className="text-[10px] text-neutral-500">Guaranteed response within 1 hour</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121212] border border-neutral-800 flex items-start space-x-3 sm:col-span-2">
                  <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Executive Lounge & Fulfillment Centers</span>
                    <span className="text-xs text-neutral-300 block mt-0.5">
                      • Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051<br />
                      • UB City, Vittal Mallya Road, Bengaluru, Karnataka 560001
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Enquiry Form */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-[#D4AF37]/30 space-y-4">
                <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <h5 className="font-serif-luxury text-lg text-white">Send Direct Enquiry to Store Owner</h5>
                </div>

                {contactSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center space-x-3 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Thank you! Your enquiry has been dispatched directly to the Zenvia Store Owner. We will respond shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    {contactError && (
                      <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                        {contactError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Ananya Rao"
                          className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="ananya@example.com"
                          className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                          Mobile Number (Optional)
                        </label>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                          Subject / Enquiry Type
                        </label>
                        <input
                          type="text"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="Product availability, Bespoke order, etc."
                          className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                        Your Message *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Please write your enquiry or message here..."
                        className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="w-full py-2.5 rounded-xl btn-gold-fill text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    >
                      {contactSubmitting ? "Dispatching Message..." : "Send Message to Store Owner"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
