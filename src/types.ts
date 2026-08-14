export type CategoryType =
  | "All"
  | "Home & Kitchen"
  | "Lifestyle"
  | "Personal Care"
  | "Cute & Trending"
  | "Best Sellers";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductVideo {
  title: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToUseStep {
  stepNumber: number;
  title: string;
  description: string;
  image?: string;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: CategoryType;
  image: string;
  alternateImage: string;
  galleryImages: string[];
  rotation360Images?: string[];
  videoUrl?: string;
  videos?: ProductVideo[];
  whyYouNeedThis?: {
    headline: string;
    description: string;
    callout?: string;
  };
  beforeAfterStory?: {
    beforeTitle: string;
    beforeText: string;
    afterTitle: string;
    afterText: string;
  };
  howToUse?: HowToUseStep[];
  faqs?: FAQItem[];
  specs: ProductSpec[];
  description: string;
  craftsmanshipStory: string;
  features: string[];
  tags: string[];
  stockCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  giftWrap?: boolean;
  giftMessage?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  headline: string;
  comment: string;
  verified: boolean; // Verified Purchase badge
  isSample?: boolean; // Clearly indicates "Sample Review" or "Demo Review" for dev/placeholder data
  customerImage?: string;
  customerImageCaption?: string;
  isGenuineCustomerPhoto?: boolean;
  helpfulCount?: number;
  userVotedHelpful?: boolean;
  location?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  location: string;
  quote: string;
  image: string;
  rating: number;
  productPurchased: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  handle: string;
  likes: string;
  caption: string;
  taggedProductIds: string[];
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // multiplier from USD
  name: string;
}

export interface FilterOptions {
  category: CategoryType;
  priceRange: [number, number];
  minRating: number;
  sortBy: "bestseller" | "price-low" | "price-high" | "rating" | "newest";
  searchQuery: string;
}

export interface CheckoutData {
  fullName: string;
  phone: string;
  email: string;
  houseNo: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  shippingMethod: "standard" | "express" | "concierge";
  paymentMethod: "razorpay" | "cod" | "upi" | "card" | "netbanking";
  couponCode?: string;
  discountPercentage?: number;
  // Backward compatibility fields
  firstName?: string;
  lastName?: string;
  address?: string;
  postalCode?: string;
}

export interface SavedAddress {
  id: string;
  label: "Home" | "Work" | "Other" | string;
  fullName: string;
  phone: string;
  email?: string;
  houseNo: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  authProvider: "google" | "email";
  createdAt: string;
  savedAddresses: SavedAddress[];
}

export type OrderStatus =
  | "ORDER PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT FOR DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemRecord {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface CustomerOrder {
  id: string; // e.g. "ZENVIA-COD-123456" or "order_xxxx"
  userId?: string;
  userEmail: string;
  date: string;
  items: OrderItemRecord[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  formattedTotal: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: string;
  trackingNumber: string;
  orderStatus: OrderStatus;
  customerDetails: {
    fullName: string;
    phone: string;
    email: string;
    houseNo: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
  };
  shippingMethod?: string;
  createdAt: string;
}

