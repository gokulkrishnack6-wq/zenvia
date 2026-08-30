import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export const SINK_CADDY_USE_PHOTOS = [
  "https://res.cloudinary.com/vgl84jqo/image/upload/v1787247251/Codex_Image_Aug_20_2026_11_03_50_PM.png",
  "https://images.meesho.com/images/ratings_reviews/6179543748/6212072402/6179543748_6212072402_7646f481889c0.avif?width=512",
  "https://images.meesho.com/images/ratings_reviews/6753100561/6787872920/6753100561_6787872920_6be0edcc7786b.avif?width=512",
  "https://images.meesho.com/images/ratings_reviews/6581996097/6616274775/6581996097_6616274775_400e658fd58a0.avif?width=512",
  "https://images.meesho.com/images/ratings_reviews/6208993094/6241657567/6208993094_6241657567_13f1e354e4fce.avif?width=512",
  "https://images.meesho.com/images/ratings_reviews/6131308905/6163607216/6131308905_6163607216_90fbe99919ba1.avif?width=512",
];

interface SinkCaddySocialProofGalleryProps {
  className?: string;
}

export const SinkCaddySocialProofGallery: React.FC<SinkCaddySocialProofGalleryProps> = ({
  className = "",
}) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter out any image that failed to load
  const validPhotos = SINK_CADDY_USE_PHOTOS.filter(
    (url) => !failedImages.has(url)
  );

  const handleImageError = (url: string) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null || validPhotos.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % validPhotos.length);
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null || validPhotos.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + validPhotos.length) % validPhotos.length);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, validPhotos.length]);

  if (validPhotos.length === 0) return null;

  return (
    <section
      id="sink-caddy-social-proof-gallery"
      className={`bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-5 sm:p-7 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 pb-3 border-b border-neutral-100">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">
            <Camera className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Visual Gallery</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Product in Use &amp; Customer Photos
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
            See how the sink caddy installs on faucet pipes and organizes sponges &amp; soaps
          </p>
        </div>

        {/* Carousel Navigation Buttons for Desktop */}
        <div className="hidden sm:flex items-center space-x-2 shrink-0">
          <button
            onClick={() => scrollCarousel("left")}
            aria-label="Scroll photos left"
            className="p-2 rounded-xl bg-neutral-100 hover:bg-amber-100 hover:text-amber-900 text-neutral-700 transition-colors border border-neutral-200/80 cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollCarousel("right")}
            aria-label="Scroll photos right"
            className="p-2 rounded-xl bg-neutral-100 hover:bg-amber-100 hover:text-amber-900 text-neutral-700 transition-colors border border-neutral-200/80 cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swipeable / Scrollable Photo Carousel & Multi-column Display */}
      <div
        ref={carouselRef}
        className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {validPhotos.map((url, index) => (
          <div
            key={url}
            onClick={() => openLightbox(index)}
            className="relative shrink-0 w-[45%] sm:w-[28%] md:w-[22%] lg:w-[17%] aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group shadow-2xs hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer snap-start"
          >
            <img
              src={url}
              alt={`Kitchen Sink Caddy in use - Photo ${index + 1}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => handleImageError(url)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-neutral-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <span className="p-1.5 rounded-full bg-black/60 backdrop-blur-xs text-white">
                <Maximize2 className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden flex items-center justify-between pt-2 text-[11px] text-neutral-600 font-medium">
        <span>← Swipe to see more photos</span>
        <span className="font-bold text-amber-800">{validPhotos.length} photos</span>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none"
          >
            {/* Lightbox Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            >
              {/* Top Controls */}
              <div className="w-full flex items-center justify-between text-white/90 mb-3 px-2">
                <div className="text-xs sm:text-sm font-semibold tracking-wide">
                  <span>Photo {lightboxIndex + 1} of {validPhotos.length}</span>
                  <span className="text-white/60 ml-2 hidden sm:inline">• Kitchen Sink Caddy</span>
                </div>
                <button
                  onClick={closeLightbox}
                  aria-label="Close lightbox"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image */}
              <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10">
                <img
                  src={validPhotos[lightboxIndex]}
                  alt={`Kitchen Sink Caddy in use - Photo ${lightboxIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
                />

                {/* Left Arrow */}
                {validPhotos.length > 1 && (
                  <button
                    onClick={showPrev}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-xs transition-transform active:scale-90 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Right Arrow */}
                {validPhotos.length > 1 && (
                  <button
                    onClick={showNext}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-xs transition-transform active:scale-90 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              {validPhotos.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto max-w-full py-3 px-2 mt-2 scrollbar-none">
                  {validPhotos.map((url, idx) => (
                    <button
                      key={url}
                      onClick={() => setLightboxIndex(idx)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                        idx === lightboxIndex
                          ? "border-amber-400 ring-2 ring-amber-400 scale-105"
                          : "border-white/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
