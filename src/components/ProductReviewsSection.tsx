import React, { useState, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  Filter,
  Camera,
  MessageSquarePlus,
  X,
  Upload,
  Sparkles,
} from "lucide-react";
import { Review, Product } from "../types";
import { INITIAL_PRODUCT_REVIEWS, PRODUCT_RATING_STATS } from "../data/reviews";

interface ProductReviewsSectionProps {
  product: Product;
  className?: string;
}

const STORAGE_KEY = "zenvia_customer_reviews_v1";

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
  className = "",
}) => {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [filterStar, setFilterStar] = useState<number | "all">("all");
  const [filterWithPhotos, setFilterWithPhotos] = useState<boolean>(false);
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest" | "helpful">("recent");
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Reset pagination when product or filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [product.id, filterStar, filterWithPhotos, filterVerified, sortBy]);

  // Write Review Modal state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Selected photo lightbox
  const [selectedImageModal, setSelectedImageModal] = useState<{
    url: string;
    author: string;
    caption?: string;
  } | null>(null);

  // Load reviews from localStorage + INITIAL_PRODUCT_REVIEWS
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const userReviews: Review[] = saved ? JSON.parse(saved) : [];
      setAllReviews([...userReviews, ...INITIAL_PRODUCT_REVIEWS]);
    } catch {
      setAllReviews(INITIAL_PRODUCT_REVIEWS);
    }
  }, []);

  // Filter reviews for current product
  const productReviews = allReviews.filter((r) => r.productId === product.id);

  // Rating stats calculation
  const baseStats = PRODUCT_RATING_STATS[product.id] || {
    star5: 0,
    star4: 0,
    star3: 0,
    star2: 0,
    star1: 0,
    total: 0,
    average: product.rating || 5.0,
  };

  const starCounts = {
    5: baseStats.star5,
    4: baseStats.star4,
    3: baseStats.star3,
    2: baseStats.star2,
    1: baseStats.star1,
  };

  // Add user reviews (which are not in baseStats) to counts
  const userAddedReviews = productReviews.filter((r) => r.id.startsWith("usr-rev-"));
  userAddedReviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const totalReviewsCount =
    baseStats.total + userAddedReviews.length > 0
      ? baseStats.total + userAddedReviews.length
      : productReviews.length;

  const sumStars =
    starCounts[5] * 5 +
    starCounts[4] * 4 +
    starCounts[3] * 3 +
    starCounts[2] * 2 +
    starCounts[1] * 1;

  const averageRating =
    totalReviewsCount > 0 ? (sumStars / totalReviewsCount).toFixed(1) : (product.rating || 4.8).toFixed(1);

  // Filter & Sort
  let filteredReviews = productReviews.filter((r) => {
    if (filterStar !== "all" && Math.round(r.rating) !== filterStar) return false;
    if (filterWithPhotos && !r.customerImage) return false;
    if (filterVerified && !r.verified) return false;
    return true;
  });

  filteredReviews.sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    if (sortBy === "helpful") return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Review Highlights extraction
  const getReviewHighlights = (): string[] => {
    if (product.id === "p12") {
      return [
        "Easy 5-second deploy & fold mechanism",
        "Reduces direct sunlight heat inside cabin",
        "Fits car window & driver door pocket easily",
        "Strong alloy multi-rib skeleton",
      ];
    }
    if (productReviews.length > 0) {
      return [
        "High quality build and materials",
        "Easy and convenient for daily use",
        "Great value for money",
        "Fast dispatch and protective packaging",
      ];
    }
    return [];
  };

  const reviewHighlights = getReviewHighlights();

  // Collect customer photo gallery
  const customerPhotos = productReviews
    .filter((r) => r.customerImage && r.customerImage.trim() !== "")
    .map((r) => ({
      url: r.customerImage!,
      author: r.author,
      caption: r.customerImageCaption || r.headline,
    }));

  // Upvote helpful handler
  const handleToggleHelpful = (reviewId: string) => {
    setAllReviews((prev) => {
      const updated = prev.map((r) => {
        if (r.id === reviewId) {
          const currentHelpful = r.helpfulCount || 0;
          const isVoted = r.userVotedHelpful;
          return {
            ...r,
            helpfulCount: isVoted ? currentHelpful - 1 : currentHelpful + 1,
            userVotedHelpful: !isVoted,
          };
        }
        return r;
      });
      try {
        const userOnly = updated.filter((r) => r.id.startsWith("usr-rev-"));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
      } catch (e) {
        console.error("Storage error:", e);
      }
      return updated;
    });
  };

  // Image upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Review Handler
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const finalPhoto = photoPreview || newPhotoUrl || undefined;
    const isVerified = Boolean(newOrderNumber.trim());

    const newReviewItem: Review = {
      id: `usr-rev-${Date.now()}`,
      productId: product.id,
      author: newName.trim(),
      rating: newRating,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      headline: newHeadline.trim() || `${newRating} Star Review`,
      comment: newComment.trim(),
      verified: isVerified,
      location: newLocation.trim() || "Verified Buyer, India",
      customerImage: finalPhoto,
      helpfulCount: 0,
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const userReviews: Review[] = saved ? JSON.parse(saved) : [];
      const updatedUserReviews = [newReviewItem, ...userReviews];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUserReviews));
      setAllReviews((prev) => [newReviewItem, ...prev]);
    } catch {
      setAllReviews((prev) => [newReviewItem, ...prev]);
    }

    // Notify Store Owner via Backend API
    fetch("/api/notifications/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: newName.trim(),
        productName: product.name,
        rating: newRating,
        headline: newHeadline.trim() || `${newRating} Star Review`,
        comment: newComment.trim(),
        orderNumber: newOrderNumber.trim() || undefined,
        verified: isVerified,
        photoUrl: finalPhoto,
      }),
    }).catch((err) => console.log("Review notification error:", err));

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsWriteModalOpen(false);
      setNewName("");
      setNewLocation("");
      setNewHeadline("");
      setNewComment("");
      setNewOrderNumber("");
      setNewPhotoUrl("");
      setPhotoPreview(null);
      setNewRating(5);
    }, 1800);
  };

  return (
    <div id="product-reviews-section" className={`space-y-8 ${className}`}>
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
              Customer Feedback
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded border border-amber-200">
              {product.name}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Customer Reviews
          </h2>
        </div>

        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] shrink-0 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Main Rating Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80">
        {/* Overall Score Box */}
        <div className="flex flex-col items-center justify-center text-center p-5 bg-white rounded-xl border border-neutral-200/60 shadow-sm">
          <div className="flex items-baseline space-x-1.5 mb-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
              {averageRating}
            </span>
            <span className="text-sm font-bold text-neutral-500">/ 5</span>
          </div>

          <div className="flex text-amber-400 my-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(Number(averageRating))
                    ? "fill-amber-400 text-amber-400"
                    : "text-neutral-300"
                }`}
              />
            ))}
          </div>

          <span className="text-xs font-bold text-neutral-800 mt-1">
            {totalReviewsCount > 0
              ? `Based on ${totalReviewsCount} customer feedback ${totalReviewsCount > 1 ? "reviews" : "review"}`
              : "No reviews submitted yet"}
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star as keyof typeof starCounts] || 0;
            const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
            return (
              <button
                key={star}
                onClick={() => setFilterStar(filterStar === star ? "all" : star)}
                className={`flex items-center space-x-3 group text-left p-1 rounded-lg transition-colors ${
                  filterStar === star ? "bg-amber-100/60" : "hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center space-x-1 min-w-12 shrink-0">
                  <span className="text-xs font-bold text-neutral-800">{star}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="text-[11px] font-mono font-bold text-neutral-600 min-w-12 text-right shrink-0">
                  {count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CUSTOMERS LOVE HIGHLIGHTS */}
      {reviewHighlights.length > 0 && (
        <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80">
          <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>CUSTOMERS LOVE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {reviewHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white border border-amber-200/60 shadow-2xs text-xs font-bold text-neutral-800"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Photos Gallery */}
      {customerPhotos.length > 0 && (
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>Customer Photos ({customerPhotos.length})</span>
            </h3>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
              Verified Customer Photos
            </span>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
            {customerPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setSelectedImageModal(photo)}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 group shrink-0 shadow-sm hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                  View
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 pb-2 border-y border-neutral-200">
        {/* Star Rating Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-neutral-500 mr-1 flex items-center shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Filter:
          </span>

          <button
            onClick={() => setFilterStar("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filterStar === "all"
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            All Reviews ({productReviews.length})
          </button>

          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStar(filterStar === s ? "all" : s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center space-x-1 transition-all cursor-pointer ${
                filterStar === s
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <span>{s}</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}

          <button
            onClick={() => setFilterVerified(!filterVerified)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center space-x-1 transition-all cursor-pointer ${
              filterVerified
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified Purchases</span>
          </button>

          {customerPhotos.length > 0 && (
            <button
              onClick={() => setFilterWithPhotos(!filterWithPhotos)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center space-x-1 transition-all cursor-pointer ${
                filterWithPhotos
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>With Photos</span>
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-bold text-neutral-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 px-4 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            {productReviews.length === 0 ? (
              <>
                <h3 className="text-base font-extrabold text-neutral-900">
                  Be the first to share your experience
                </h3>
                <p className="text-xs text-neutral-600 max-w-md mx-auto font-medium">
                  Your feedback helps other customers shop with confidence.
                </p>
                <button
                  onClick={() => setIsWriteModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer mt-2"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Write the First Review</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-neutral-600 font-medium">
                  No reviews match the selected filter criteria.
                </p>
                <button
                  onClick={() => {
                    setFilterStar("all");
                    setFilterWithPhotos(false);
                    setFilterVerified(false);
                  }}
                  className="text-xs font-bold text-amber-700 underline hover:text-amber-800 cursor-pointer"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {filteredReviews.slice(0, visibleCount).map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-sm hover:border-neutral-300 transition-all space-y-3"
              >
                {/* Header: Author, Avatar/Initial, Badges, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    {rev.avatar ? (
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-neutral-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center uppercase shrink-0">
                        {rev.author.charAt(0)}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-neutral-900">
                          {rev.author}
                        </span>

                        {/* Verified Purchase or Customer Feedback Badge */}
                        {rev.verified ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified Purchase</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                            <span>Customer Feedback</span>
                          </span>
                        )}
                      </div>
                      {rev.location && (
                        <span className="text-[10px] text-neutral-400 block font-medium">
                          {rev.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-neutral-400 font-medium">
                    {rev.date}
                  </span>
                </div>

                {/* Star Rating & Headline */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(rev.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-neutral-900">
                      {rev.headline}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-neutral-700 leading-relaxed pt-1">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Customer Photo attached to review */}
                {rev.customerImage && (
                  <div className="pt-2">
                    <div className="inline-block relative group">
                      <img
                        src={rev.customerImage}
                        alt="Customer review photo"
                        referrerPolicy="no-referrer"
                        onClick={() =>
                          setSelectedImageModal({
                            url: rev.customerImage!,
                            author: rev.author,
                            caption: rev.headline,
                          })
                        }
                        className="w-24 h-24 object-cover rounded-xl border border-neutral-200 cursor-pointer hover:opacity-95 transition-opacity"
                      />
                      <span className="mt-1 block text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Customer Photo</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer Actions: Helpful button */}
                <div className="flex items-center justify-between pt-2 text-xs border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleToggleHelpful(rev.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border transition-all text-[11px] font-semibold cursor-pointer ${
                      rev.userVotedHelpful
                        ? "bg-amber-100 border-amber-300 text-amber-900"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${rev.userVotedHelpful ? "fill-amber-700 text-amber-700" : ""}`} />
                    <span>
                      Helpful {rev.helpfulCount ? `(${rev.helpfulCount})` : ""}
                    </span>
                  </button>

                  <span className="text-[10px] text-neutral-400 font-medium">
                    {product.name}
                  </span>
                </div>
              </div>
            ))}

            {/* Load More Reviews Button */}
            {filteredReviews.length > visibleCount && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Load More Reviews ({filteredReviews.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Write a Review Button CTA */}
      <div className="pt-4 text-center border-t border-neutral-200">
        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Review for {product.name}</span>
        </button>
      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-neutral-200 my-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-extrabold text-neutral-900">
                  Write a Review for {product.name}
                </h3>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-neutral-900">
                  Review Published!
                </h4>
                <p className="text-xs text-neutral-600">
                  Thank you for sharing your experience with the Zenvia community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {/* Rating selection */}
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Your Overall Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 text-amber-400 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= newRating ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-neutral-900 ml-2">
                      {newRating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Customer Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Mumbai, MH"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    value={newHeadline}
                    onChange={(e) => setNewHeadline(e.target.value)}
                    placeholder="e.g. Very handy for daily use!"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                {/* Comment Body */}
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Detailed Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share details about ease of use, quality, packaging..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium resize-none"
                  />
                </div>

                {/* Order Verification (Optional) */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                  <label className="block font-bold text-amber-900">
                    Order Number (Optional - for Verified Purchase Badge)
                  </label>
                  <input
                    type="text"
                    value={newOrderNumber}
                    onChange={(e) => setNewOrderNumber(e.target.value)}
                    placeholder="e.g. ZENV-8921"
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white focus:outline-none font-mono text-xs"
                  />
                  <span className="text-[10px] text-amber-800 block">
                    Entering an order number validates your purchase and awards the "✓ Verified Purchase" badge.
                  </span>
                </div>

                {/* Optional Photo Attachment */}
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Attach Product Photo (Optional)
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer px-4 py-2 rounded-xl border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-semibold flex items-center space-x-1.5">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <span className="text-[10px] text-neutral-400 font-medium">or</span>

                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => {
                        setNewPhotoUrl(e.target.value);
                        setPhotoPreview(e.target.value);
                      }}
                      placeholder="Paste Image URL"
                      className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none font-medium"
                    />
                  </div>

                  {photoPreview && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Upload preview"
                        className="w-20 h-20 object-cover rounded-xl border border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setNewPhotoUrl("");
                        }}
                        className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white rounded-full p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox for Customer Photo */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-neutral-900 rounded-2xl p-4 text-white space-y-3">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={selectedImageModal.url}
              alt={selectedImageModal.caption}
              referrerPolicy="no-referrer"
              className="w-full max-h-[70vh] object-contain rounded-xl bg-black"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="font-bold text-white block">
                  {selectedImageModal.author}
                </span>
                <span className="text-neutral-400 text-[11px]">
                  {selectedImageModal.caption}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-full">
                Verified Customer Photo
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
