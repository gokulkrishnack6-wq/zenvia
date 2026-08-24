import React, { useState } from "react";
import { X, ShieldCheck, Truck, Phone, Mail, MapPin, CheckCircle2, Lock, FileText, RefreshCw, Info } from "lucide-react";
import { ZenviaLogo } from "./ZenviaLogo";

export type PolicyTab = "shipping" | "privacy" | "terms" | "refund" | "about" | "contact";

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
    } catch {
      setContactSubmitting(false);
      setContactError("Network error. Please try again later.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ZenviaLogo variant="gold" className="h-8 w-auto" />
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Zenvia Support & Policies</h3>
              <p className="text-[11px] text-neutral-400">Smart products for a better everyday life</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/80 overflow-x-auto no-scrollbar px-3 pt-2 text-xs">
          <button
            onClick={() => setActiveTab("shipping")}
            className={`px-3.5 py-2.5 font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "shipping"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Shipping Policy
          </button>

          <button
            onClick={() => setActiveTab("refund")}
            className={`px-3.5 py-2.5 font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "refund"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Refund & Cancellation
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3.5 py-2.5 font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "privacy"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Privacy Policy
          </button>

          <button
            onClick={() => setActiveTab("terms")}
            className={`px-3.5 py-2.5 font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "terms"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Terms & Conditions
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`px-3.5 py-2.5 font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "about"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            About Us
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`px-3.5 py-2.5 font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "contact"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Contact Us
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-xs text-neutral-300 leading-relaxed">
          {/* SHIPPING POLICY */}
          {activeTab === "shipping" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5 text-amber-400">
                <Truck className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">Shipping & Delivery Policy</h4>
              </div>

              <p>
                At Zenvia, we provide Pan-India delivery across serviceable pin codes. Each order is packed carefully and dispatched with reputable logistics partners.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Pan-India Delivery</span>
                  <p className="text-neutral-400 text-[11px]">
                    Delivery available across India. Delivery times may vary depending on your location, typically taking 3 to 7 business days from dispatch.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Free Delivery Across India 🚚</span>
                  <p className="text-neutral-400 text-[11px]">
                    All orders qualify for 100% free delivery across India with zero hidden shipping fees.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Order Tracking</span>
                  <p className="text-neutral-400 text-[11px]">
                    Once processed, tracking details are sent to your registered email or phone so you can monitor your package.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Packaging & Safety</span>
                  <p className="text-neutral-400 text-[11px]">
                    Items are securely boxed to prevent in-transit damage and ensure they arrive in pristine condition.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REFUND & CANCELLATION */}
          {activeTab === "refund" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5 text-amber-400">
                <RefreshCw className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">Refund & Cancellation Policy</h4>
              </div>

              <div className="space-y-3 text-neutral-300">
                <p>
                  We want you to have a dependable shopping experience with Zenvia. Please review our fair cancellation and replacement policy:
                </p>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-2">
                  <span className="text-white font-semibold block text-xs">Order Cancellation</span>
                  <p className="text-neutral-400 text-[11px]">
                    You can request to cancel your order prior to dispatch by emailing{" "}
                    <a
                      href="mailto:zenviashopindia@gmail.com"
                      className="text-amber-400 hover:underline font-medium"
                    >
                      zenviashopindia@gmail.com
                    </a>{" "}
                    with your Order ID. Once shipped, orders cannot be cancelled mid-transit.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-2">
                  <span className="text-white font-semibold block text-xs">Damaged or Defective Items</span>
                  <p className="text-neutral-400 text-[11px]">
                    If your product arrives damaged or defective, please contact our support team within 48 hours of delivery with photos/unboxing video. We will promptly arrange a replacement or refund.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-2">
                  <span className="text-white font-semibold block text-xs">Refund Processing</span>
                  <p className="text-neutral-400 text-[11px]">
                    Approved refunds for prepaid orders are credited back to the original source account within 5 to 7 working days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5 text-amber-400">
                <Lock className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">Privacy Policy</h4>
              </div>

              <p>
                Zenvia is committed to protecting your personal information. This privacy statement outlines how customer data is handled.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Data Collection & Use</span>
                  <p className="text-neutral-400 text-[11px]">
                    We collect necessary information such as your name, mobile number, email, and shipping address solely to process your orders, arrange delivery, and communicate updates.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Payment Data Security</span>
                  <p className="text-neutral-400 text-[11px]">
                    All payment processing happens over 256-bit encrypted SSL/HTTPS connections via certified payment gateways (such as Razorpay / UPI). We do not store your bank credentials or card CVVs.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Third-Party Sharing</span>
                  <p className="text-neutral-400 text-[11px]">
                    Your address and contact details are only shared with our verified courier partners for delivery fulfillment. We do not sell your personal data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TERMS & CONDITIONS */}
          {activeTab === "terms" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5 text-amber-400">
                <FileText className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">Terms & Conditions</h4>
              </div>

              <div className="space-y-3">
                <p>
                  By accessing and placing an order on Zenvia, you agree to the following terms and guidelines:
                </p>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Pricing & Product Accuracy</span>
                  <p className="text-neutral-400 text-[11px]">
                    All prices are in Indian Rupees (INR) and inclusive of applicable taxes. We strive to provide accurate product dimensions, materials, and color descriptions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Order Acceptance</span>
                  <p className="text-neutral-400 text-[11px]">
                    Receipt of an order confirmation indicates our receipt of your order request. Zenvia reserves the right to cancel orders in case of unserviceable pin codes or incorrect delivery details.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Applicable Law</span>
                  <p className="text-neutral-400 text-[11px]">
                    These terms are governed by and construed in accordance with the laws of India.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT US */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5 text-amber-400">
                <Info className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">About Zenvia</h4>
              </div>

              <p className="text-sm font-medium text-neutral-200">
                "Zenvia — Smart products for a better everyday life."
              </p>

              <p>
                Zenvia was founded to bring thoughtful, functional, and durable lifestyle and home products to customers across India. We focus on solving common daily problems with smartly designed tools.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Carefully Selected Products</span>
                  <p className="text-neutral-400 text-[11px]">
                    We focus on practical products designed to make everyday life easier and organized.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <span className="text-white font-semibold block text-xs">Quality First</span>
                  <p className="text-neutral-400 text-[11px]">
                    Every item is checked before dispatch to meet consistent standards of functionality and durability.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT US */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5 text-amber-400">
                <Phone className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">Need Help? Contact Our Support Team</h4>
              </div>

              <p>
                Need help with your order? Our support team is here to assist you with order status, product questions, or replacements.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
                    <Mail className="w-4 h-4" />
                    <span>Email Support</span>
                  </div>
                  <a
                    href="mailto:zenviashopindia@gmail.com"
                    className="text-white hover:text-amber-400 font-medium text-xs block transition-colors underline decoration-neutral-600 underline-offset-2"
                  >
                    zenviashopindia@gmail.com
                  </a>
                  <p className="text-neutral-400 text-[11px]">We typically respond within 24 business hours.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 space-y-1">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
                    <Phone className="w-4 h-4" />
                    <span>Support Hours</span>
                  </div>
                  <p className="text-white font-medium text-xs">Monday – Saturday</p>
                  <p className="text-neutral-400 text-[11px]">9:00 AM – 6:00 PM IST</p>
                </div>
              </div>

              {/* Contact Message Form */}
              <div className="mt-4 p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-3">
                <span className="text-white font-semibold block text-xs">Send Us a Direct Message</span>

                {contactSuccess ? (
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center space-x-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Thank you! Your message has been received. We will get back to you shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    {contactError && (
                      <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
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
                          placeholder="Your Name"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
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
                          placeholder="name@example.com"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
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
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                          Order ID (If applicable)
                        </label>
                        <input
                          type="text"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="e.g. ZEN-12345"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
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
                        placeholder="How can we help you?"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {contactSubmitting ? "Sending..." : "Send Message to Support"}
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
