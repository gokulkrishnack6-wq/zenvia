import React, { useState } from "react";
import { Instagram, Heart, ShoppingBag } from "lucide-react";
import { INSTAGRAM_POSTS } from "../data/instagram";
import { PRODUCTS } from "../data/products";
import { Product } from "../types";

interface InstagramGalleryProps {
  onQuickView: (p: Product) => void;
}

export const InstagramGallery: React.FC<InstagramGalleryProps> = ({ onQuickView }) => {
  const [activePost, setActivePost] = useState<string | null>(null);

  return (
    <section className="py-24 bg-[#090909] border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-neutral-800 pb-6">
          <div>
            <span className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium block mb-2">
              <Instagram className="w-3.5 h-3.5" />
              <span>@ZENVIAOFFICIAL</span>
            </span>
            <h2 className="font-serif-luxury text-4xl sm:text-5xl font-light text-white">
              The Curated Gallery
            </h2>
          </div>
          <p className="mt-2 sm:mt-0 text-xs text-neutral-400 font-light">
            Tag <strong className="text-[#D4AF37]">#ZenviaLifestyle</strong> to be featured in our private global archive.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {INSTAGRAM_POSTS.map((post) => {
            const taggedProduct = PRODUCTS.find((p) => post.taggedProductIds?.includes(p.id));

            return (
              <div
                key={post.id}
                onMouseEnter={() => setActivePost(post.id)}
                onMouseLeave={() => setActivePost(null)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-neutral-800 hover:border-[#D4AF37]/50 transition-all duration-500 cursor-pointer bg-neutral-950 shadow-xl"
              >
                <img
                  src={post.image}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-90"
                />

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between text-xs text-[#D4AF37]">
                    <span className="font-mono text-[10px]">{post.handle}</span>
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3 fill-[#D4AF37]" />
                      <span className="text-[10px]">{post.likes}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-300 font-light line-clamp-2">
                    {post.caption}
                  </p>

                  {taggedProduct && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(taggedProduct);
                      }}
                      className="w-full py-1.5 px-2 rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] text-[10px] uppercase font-medium tracking-wider flex items-center justify-center space-x-1 transition-all"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Shop Look</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
