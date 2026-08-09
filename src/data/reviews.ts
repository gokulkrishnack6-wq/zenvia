import { Review } from "../types";

export interface RatingDistribution {
  star5: number;
  star4: number;
  star3: number;
  star2: number;
  star1: number;
  total: number;
  average: number;
}

export const PRODUCT_RATING_STATS: Record<string, RatingDistribution> = {
  p1: { star5: 284, star4: 42, star3: 11, star2: 3, star1: 2, total: 342, average: 4.8 },
  p2: { star5: 198, star4: 31, star3: 8, star2: 2, star1: 1, total: 240, average: 4.7 },
  p3: { star5: 154, star4: 22, star3: 5, star2: 1, star1: 1, total: 183, average: 4.8 },
  p4: { star5: 215, star4: 28, star3: 6, star2: 2, star1: 1, total: 252, average: 4.8 },
  p5: { star5: 168, star4: 24, star3: 7, star2: 2, star1: 1, total: 202, average: 4.7 },
  p6: { star5: 132, star4: 18, star3: 4, star2: 1, star1: 0, total: 155, average: 4.8 },
  p7: { star5: 112, star4: 16, star3: 5, star2: 1, star1: 1, total: 135, average: 4.7 },
  p8: { star5: 240, star4: 35, star3: 9, star2: 3, star1: 1, total: 288, average: 4.8 },
  p9: { star5: 175, star4: 25, star3: 6, star2: 2, star1: 0, total: 208, average: 4.8 },
  p10: { star5: 145, star4: 21, star3: 5, star2: 2, star1: 1, total: 174, average: 4.7 },
  p11: { star5: 98, star4: 14, star3: 3, star2: 1, star1: 0, total: 116, average: 4.8 },
};

export const INITIAL_PRODUCT_REVIEWS: Review[] = [
  // --- p1: Mini Thermal Printer ---
  {
    id: "rev-p1-1",
    productId: "p1",
    author: "Rohan Verma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "04 Aug 2026",
    headline: "Extremely useful for study notes and quick labels!",
    comment: "This pocket printer exceeded my expectations. Bluetooth setup with my iPhone took less than 20 seconds. Printing test labels and study diagrams is super fast and clear. No ink mess at all!",
    verified: true,
    location: "Mumbai, MH",
    customerImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?q=80&w=800&auto=format&fit=crop",
    customerImageCaption: "Printed pocket study notes",
    helpfulCount: 42,
  },
  {
    id: "rev-p1-2",
    productId: "p1",
    author: "Ananya Deshmukh",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "28 Jul 2026",
    headline: "Super cute and portable, battery lasts forever!",
    comment: "Loved the pastel design. Comes with paper rolls included. I print my daily task lists every morning and stick them on my monitor. Delivered to Pune in 2 days via express shipping.",
    verified: true,
    location: "Pune, MH",
    helpfulCount: 29,
  },
  {
    id: "rev-p1-3",
    productId: "p1",
    author: "Karan Johar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "15 Jul 2026",
    headline: "Great for small business shipping labels",
    comment: "I run an Instagram thrift shop and use this for address labels on orders. Saves so much time compared to writing by hand. Very crisp thermal print quality.",
    verified: true,
    location: "Bengaluru, KA",
    customerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    customerImageCaption: "Shipping labels printed in seconds",
    helpfulCount: 18,
  },
  {
    id: "rev-p1-4",
    productId: "p1",
    author: "Meera Nair",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    rating: 4,
    date: "02 Jul 2026",
    headline: "Compact device, fast delivery",
    comment: "Solid build quality and very easy to refill rolls. Print speed is impressive for such a tiny device.",
    verified: true,
    location: "Kochi, KL",
    helpfulCount: 11,
  },

  // --- p2: Multi-Blade Vegetable Chopper ---
  {
    id: "rev-p2-1",
    productId: "p2",
    author: "Shalini Sharma",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "01 Aug 2026",
    headline: "Cuts kitchen prep time in half! Must have item",
    comment: "Dicing onions without tears is a lifesaver. Stainless steel blades are razor sharp and the collection container is sturdy. Cleaning brush included makes washing easy.",
    verified: true,
    location: "New Delhi, NCR",
    customerImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop",
    customerImageCaption: "Finely chopped vegetables in seconds",
    helpfulCount: 38,
  },
  {
    id: "rev-p2-2",
    productId: "p2",
    author: "Vikram Kapoor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "20 Jul 2026",
    headline: "Heavy duty build & prompt Cash on Delivery",
    comment: "Ordered via COD to Gurgaon. Received in pristine box packaging. The blade attachments swap out seamlessly. Highly recommended for meal prep.",
    verified: true,
    location: "Gurgaon, HR",
    helpfulCount: 22,
  },

  // --- p3: Pink Bow Glass Tumbler ---
  {
    id: "rev-p3-1",
    productId: "p3",
    author: "Sanya Roy",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "05 Aug 2026",
    headline: "Aesthetic dream glass! So pretty for iced coffee",
    comment: "The bow detail is even nicer in person! Thick borosilicate glass with bamboo lid and glass straw. Got so many compliments at my work desk.",
    verified: true,
    location: "Kolkata, WB",
    customerImage: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop",
    customerImageCaption: "Iced matcha in coquette bow tumbler",
    helpfulCount: 31,
  },
  {
    id: "rev-p3-2",
    productId: "p3",
    author: "Divya Agarwal",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "22 Jul 2026",
    headline: "Carefully bubble-wrapped delivery",
    comment: "I was worried about glass shipping, but Zenvia packaged it super safely with air cushions. Absolutely gorgeous tumbler!",
    verified: true,
    location: "Jaipur, RJ",
    helpfulCount: 19,
  },

  // --- p4: Soft Silicone Panda Night Light ---
  {
    id: "rev-p4-1",
    productId: "p4",
    author: "Pooja Reddy",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "03 Aug 2026",
    headline: "Adorable squishy panda lamp for bedroom!",
    comment: "Touch sensor works perfectly to switch colors or warm white light. Soft silicone texture is soothing. USB rechargeable and holds charge for days.",
    verified: true,
    location: "Hyderabad, TS",
    customerImage: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop",
    customerImageCaption: "Warm night glow on bedside table",
    helpfulCount: 45,
  },
  {
    id: "rev-p4-2",
    productId: "p4",
    author: "Aman Gupta",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "19 Jul 2026",
    headline: "Kids love it! Perfect gift idea",
    comment: "Bought 2 for my niece and nephew. They love tapping it to change ambient light colors before bedtime.",
    verified: true,
    location: "Chandigarh, PB",
    helpfulCount: 26,
  },

  // --- p5: 3D Shiatsu Neck Massager ---
  {
    id: "rev-p5-1",
    productId: "p5",
    author: "Rajesh Iyer",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "02 Aug 2026",
    headline: "Relieves shoulder stiffness after long work hours",
    comment: "The deep tissue kneading nodes with optional heat therapy work wonders on neck strain. Cordless rechargeable battery makes it convenient while watching TV.",
    verified: true,
    location: "Chennai, TN",
    helpfulCount: 34,
  },

  // --- p6: Ultrasonic Jewelry Cleaner ---
  {
    id: "rev-p6-1",
    productId: "p6",
    author: "Neha Singhania",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "30 Jul 2026",
    headline: "Cleans ring and specs like brand new!",
    comment: "Put my diamond ring and reading glasses in with warm water and a drop of liquid soap. In 3 minutes, all grime and oils were lifted. Amazing device!",
    verified: true,
    location: "Ahmedabad, GJ",
    customerImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop",
    customerImageCaption: "Sparkling clean jewelry",
    helpfulCount: 27,
  },

  // --- p7: Desktop Vacuum Cleaner ---
  {
    id: "rev-p7-1",
    productId: "p7",
    author: "Tushar Saxena",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "25 Jul 2026",
    headline: "Keeps keyboard & study table spotless",
    comment: "Sucks up eraser dust, pencil shavings, and crumbs effortlessly. Small, cute, USB charging cable included.",
    verified: true,
    location: "Noida, UP",
    helpfulCount: 16,
  },

  // --- p8: Sunset Halo Projection Lamp ---
  {
    id: "rev-p8-1",
    productId: "p8",
    author: "Kritika Pandey",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "06 Aug 2026",
    headline: "Gives amazing golden hour aesthetic for photos!",
    comment: "Rotates 180 degrees to project a stunning golden hour halo onto walls. Perfect background for video calls and photoshoots. Fast delivery to Lucknow.",
    verified: true,
    location: "Lucknow, UP",
    customerImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    customerImageCaption: "Warm sunset projection on wall",
    helpfulCount: 52,
  },

  // --- p9: Smart LED Temperature Water Bottle ---
  {
    id: "rev-p9-1",
    productId: "p9",
    author: "Varun Bhatia",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "01 Aug 2026",
    headline: "Keeps water ice cold all day during workout!",
    comment: "LED touch lid shows exact beverage temperature. Double wall vacuum insulation works flawlessly. Leakproof rubber seal.",
    verified: true,
    location: "Chandigarh, UT",
    helpfulCount: 30,
  },

  // --- p10: Cordless Hair Straightener Brush ---
  {
    id: "rev-p10-1",
    productId: "p10",
    author: "Rhea Sen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "29 Jul 2026",
    headline: "Lifesaver for touchups while traveling",
    comment: "Heats up fast and smooths frizzy hair without burning. Compact enough to carry in handbag.",
    verified: true,
    location: "Kolkata, WB",
    helpfulCount: 23,
  },

  // --- p11: Silicone Scalp Massager Brush ---
  {
    id: "rev-p11-1",
    productId: "p11",
    author: "Deepak Patel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "27 Jul 2026",
    headline: "Feels heavenly during hair wash!",
    comment: "Gentle soft silicone bristles deep clean scalp and stimulate hair follicles. Great value product.",
    verified: true,
    location: "Surat, GJ",
    helpfulCount: 14,
  },
];

// Alias for backwards compatibility
export const SAMPLE_REVIEWS = INITIAL_PRODUCT_REVIEWS;
