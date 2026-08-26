import React from "react";
import { ShieldCheck, Lock, Truck, Headphones } from "lucide-react";
import { motion } from "motion/react";

export const LuxuryExperience: React.FC = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Quality Inspected",
      desc: "Every product is 100% quality checked before dispatch for smooth performance.",
    },
    {
      icon: Lock,
      title: "Secure Payments",
      desc: "Instant & safe checkout via GPay, PhonePe, UPI, Cards, Net Banking & Cash on Delivery.",
    },
    {
      icon: Truck,
      title: "Delivery Across India",
      desc: "Reliable shipping across India with fast dispatch, SMS & WhatsApp updates.",
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      desc: "Friendly Indian customer care support available via WhatsApp and Email.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-neutral-50/80 border-y border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-2">
            Why Choose Zenvia
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-3">
            Built for Trust & Satisfaction
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed">
            We bring you useful, high-value everyday smart finds with transparent service and reliable pan-India delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const IconComp = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white p-6 rounded-2xl border border-neutral-200/80 hover:border-amber-300 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 mb-4 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

