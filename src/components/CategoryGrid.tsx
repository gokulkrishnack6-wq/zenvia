import React from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { CATEGORIES } from "../data/products";
import { CategoryType } from "../types";

interface CategoryGridProps {
  onSelectCategory: (cat: CategoryType) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#090909]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-neutral-800 pb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium block mb-2">
            Curated Universes
          </span>
          <h2 className="font-serif-luxury text-4xl sm:text-5xl font-light text-white">
            Featured Collections
          </h2>
        </div>
        <p className="mt-4 md:mt-0 text-neutral-400 text-sm max-w-md font-light">
          Each domain is meticulously assembled with limited-production creations designed for modern connoisseurs.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            onClick={() => {
              onSelectCategory(cat.id);
              const section = document.getElementById("catalog-section");
              if (section) section.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative h-[380px] rounded-xl overflow-hidden cursor-pointer border border-neutral-800 hover:border-[#D4AF37]/50 transition-all duration-500 shadow-2xl"
          >
            {/* Background Image with Zoom on hover */}
            <img
              src={cat.image}
              alt={cat.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-75 group-hover:scale-110 group-hover:brightness-90 transition-transform duration-700 ease-out"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-black/60 backdrop-blur-md">
                  {cat.itemCount} Creations
                </span>

                <div className="w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300 shadow-lg">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="font-serif-luxury text-3xl text-white font-normal group-hover:text-[#F4E0A5] transition-colors mb-2">
                  {cat.name}
                </h3>
                <p className="text-xs text-neutral-300 font-light leading-relaxed line-clamp-2">
                  {cat.tagline}
                </p>
                <div className="mt-4 flex items-center space-x-2 text-xs text-[#D4AF37] font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Explore Collection</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
