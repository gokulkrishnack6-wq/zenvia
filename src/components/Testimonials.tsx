import React from "react";
import { Star, CheckCircle2, Quote } from "lucide-react";
import { motion } from "motion/react";
import { TESTIMONIALS } from "../data/testimonials";

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-white border-t border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-2">
            Real Customer Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-3">
            Loved Across India
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Read what verified shoppers from Mumbai, Delhi, Bengaluru & across India have to say about Zenvia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-neutral-50/80 p-6 rounded-2xl flex flex-col justify-between border border-neutral-200/80 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-amber-300/80" />
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed italic mb-4">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200/60">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={t.image}
                    alt={t.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-xs font-bold text-neutral-900">{t.name}</h3>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-neutral-500">{t.location}</p>
                  </div>
                </div>

                <div className="bg-white px-2.5 py-1 rounded-md border border-neutral-200/60 inline-block">
                  <span className="text-[10px] text-neutral-600 font-medium">
                    Purchased: <strong className="text-neutral-900 font-semibold">{t.productPurchased}</strong>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

