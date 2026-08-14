import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  User,
  MapPin,
  Package,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Phone,
  Mail,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  Building,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SavedAddress, CustomerOrder, OrderStatus, Currency } from "../types";
import { AuthModal } from "./AuthModal";

interface AccountModalProps {
  isOpen: boolean;
  currency?: Currency;
  onClose: () => void;
  initialTab?: "orders" | "addresses" | "profile";
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  currency,
  onClose,
  initialTab = "orders",
}) => {
  const {
    user,
    isAuthenticated,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    fetchMyOrders,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">(initialTab);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  // Address edit / add state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<{
    label: string;
    fullName: string;
    phone: string;
    email: string;
    houseNo: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>({
    label: "Home",
    fullName: "",
    phone: "",
    email: "",
    houseNo: "",
    street: "",
    landmark: "",
    city: "",
    state: "Karnataka",
    pincode: "",
    isDefault: false,
  });

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load orders when authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      setLoadingOrders(true);
      fetchMyOrders()
        .then((data) => setOrders(data))
        .finally(() => setLoadingOrders(false));
    }
  }, [isOpen, isAuthenticated, fetchMyOrders]);

  // Sync profile form
  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  if (!isOpen) return null;

  // If user is not logged in, show elegant Login / Sign-up view
  if (!isAuthenticated || !user) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center"
            id="zenvia-account-prompt-modal"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800/60 transition-colors"
              id="btn-close-account-prompt"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <User className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-serif text-stone-100 font-medium tracking-wide">
              Zenvia Customer Account
            </h2>
            <p className="text-sm text-stone-400 mt-2 mb-6 max-w-sm mx-auto">
              Sign in or create an account to view your previous orders, live tracking status, and saved delivery addresses for 1-click checkout.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-semibold text-sm transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
                id="btn-open-signin-from-account"
              >
                <span>Sign In or Create Account</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-stone-800/60 hover:bg-stone-800 text-stone-300 font-medium text-xs transition-colors"
                id="btn-continue-browsing"
              >
                Continue Browsing Store
              </button>
            </div>
          </motion.div>

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false);
            }}
          />
        </div>
      </AnimatePresence>
    );
  }

  // Handle Address Save
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.houseNo || !addressForm.street || !addressForm.city || !addressForm.pincode) {
      alert("Please fill in all required address fields.");
      return;
    }

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
      } else {
        await addAddress(addressForm);
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (err: any) {
      alert(err.message || "Failed to save address.");
    }
  };

  const handleEditAddressClick = (addr: SavedAddress) => {
    setAddressForm({
      label: addr.label || "Home",
      fullName: addr.fullName,
      phone: addr.phone,
      email: addr.email || user.email,
      houseNo: addr.houseNo,
      street: addr.street,
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: profileName,
        phone: profilePhone,
      });
      setIsEditingProfile(false);
    } catch (err: any) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const copyTrackingNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-800/80";
      case "SHIPPED":
      case "OUT FOR DELIVERY":
        return "bg-sky-950/80 text-sky-300 border-sky-800/80";
      case "PROCESSING":
        return "bg-amber-950/80 text-amber-300 border-amber-800/80";
      case "CANCELLED":
        return "bg-rose-950/80 text-rose-300 border-rose-800/80";
      default:
        return "bg-stone-800 text-amber-400 border-stone-700";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16 }}
          className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
          id="zenvia-account-modal"
        >
          {/* Header */}
          <div className="px-5 sm:px-8 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-amber-500/40 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-semibold flex items-center justify-center text-sm">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div>
                <h3 className="text-base sm:text-lg font-serif text-stone-100 font-medium">
                  {user.fullName || "My Account"}
                </h3>
                <p className="text-xs text-stone-400 font-mono">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-colors"
                title="Sign out of account"
                id="btn-signout-header"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800/80 transition-colors"
                id="btn-close-account"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-800 bg-stone-900/90 px-4 sm:px-8 shrink-0 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab("orders");
                setSelectedOrder(null);
              }}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
              id="tab-account-orders"
            >
              <Package className="w-4 h-4" />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("addresses");
                setSelectedOrder(null);
              }}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "addresses"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
              id="tab-account-addresses"
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses ({user.savedAddresses?.length || 0})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("profile");
                setSelectedOrder(null);
              }}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "profile"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
              id="tab-account-profile"
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-stone-950/40">
            {/* 1. ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {selectedOrder ? (
                  // ORDER DETAILS VIEW
                  <div className="space-y-6">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="inline-flex items-center gap-2 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                      id="btn-back-to-orders-list"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to All Orders</span>
                    </button>

                    {/* Order Status & Tracking Banner */}
                    <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-mono">
                            Order ID: {selectedOrder.id}
                          </span>
                          <h4 className="text-lg font-serif text-stone-100 font-medium mt-0.5">
                            Order Status: <span className="text-amber-400">{selectedOrder.orderStatus}</span>
                          </h4>
                          <p className="text-xs text-stone-400 mt-1">
                            Placed on {new Date(selectedOrder.date).toLocaleDateString("en-IN", { dateStyle: "long" })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadge(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Visual Order Progress Tracker */}
                      <div className="pt-5">
                        <span className="text-xs font-medium text-stone-300 mb-3 block">Shipment Timeline</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-stone-950 border border-emerald-800/40 flex items-center gap-2.5 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="font-semibold text-stone-100">Confirmed</p>
                              <p className="text-[10px] text-stone-400">Order verified</p>
                            </div>
                          </div>

                          <div className={`p-3 rounded-xl bg-stone-950 border flex items-center gap-2.5 ${
                            ["PROCESSING", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"].includes(selectedOrder.orderStatus)
                              ? "border-emerald-800/40 text-emerald-400"
                              : "border-stone-800 text-stone-500"
                          }`}>
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="font-semibold text-stone-100">Atelier Quality</p>
                              <p className="text-[10px] text-stone-400">Inspected & boxed</p>
                            </div>
                          </div>

                          <div className={`p-3 rounded-xl bg-stone-950 border flex items-center gap-2.5 ${
                            ["SHIPPED", "OUT FOR DELIVERY", "DELIVERED"].includes(selectedOrder.orderStatus)
                              ? "border-emerald-800/40 text-emerald-400"
                              : "border-stone-800 text-stone-500"
                          }`}>
                            <Truck className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="font-semibold text-stone-100">BlueDart Air</p>
                              <p className="text-[10px] text-stone-400">Express in-transit</p>
                            </div>
                          </div>

                          <div className={`p-3 rounded-xl bg-stone-950 border flex items-center gap-2.5 ${
                            selectedOrder.orderStatus === "DELIVERED"
                              ? "border-emerald-800/40 text-emerald-400"
                              : "border-stone-800 text-stone-500"
                          }`}>
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="font-semibold text-stone-100">Delivered</p>
                              <p className="text-[10px] text-stone-400">At your doorstep</p>
                            </div>
                          </div>
                        </div>

                        {/* BlueDart Tracking ID */}
                        {selectedOrder.trackingNumber && (
                          <div className="mt-4 p-3 rounded-xl bg-stone-950 border border-stone-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                              <Truck className="w-4 h-4 text-amber-400" />
                              <span className="text-stone-400">BlueDart Tracking ID:</span>
                              <span className="font-mono font-semibold text-stone-100">
                                {selectedOrder.trackingNumber}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyTrackingNumber(selectedOrder.trackingNumber)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] text-stone-200 transition-colors"
                            >
                              {copiedTracking ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items & Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Items list */}
                      <div className="md:col-span-2 space-y-3">
                        <h4 className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                          Purchased Items ({selectedOrder.items?.length || 0})
                        </h4>
                        <div className="space-y-2.5">
                          {selectedOrder.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-3.5"
                            >
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-14 rounded-lg object-cover bg-stone-800 border border-stone-700 shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 text-amber-400">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-stone-100 truncate">
                                  {item.name}
                                </h5>
                                <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                                  <span>Qty: {item.quantity}</span>
                                  {item.selectedColor && <span>• Color: {item.selectedColor}</span>}
                                  {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold text-stone-100">
                                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Summary & Address */}
                      <div className="space-y-4">
                        {/* Address */}
                        <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
                          <h4 className="font-semibold text-stone-200 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span>Delivered To</span>
                          </h4>
                          <p className="font-medium text-stone-100">
                            {selectedOrder.customerDetails?.fullName}
                          </p>
                          <p className="text-stone-400 leading-relaxed">
                            {selectedOrder.customerDetails?.fullAddress}
                          </p>
                          <p className="text-stone-400">
                            Phone: {selectedOrder.customerDetails?.phone}
                          </p>
                        </div>

                        {/* Payment Breakdown */}
                        <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
                          <h4 className="font-semibold text-stone-200 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Payment Summary</span>
                          </h4>
                          <div className="flex justify-between text-stone-400">
                            <span>Payment Mode</span>
                            <span className="text-stone-200">{selectedOrder.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between text-stone-400">
                            <span>Subtotal</span>
                            <span>₹{selectedOrder.subtotal?.toLocaleString("en-IN")}</span>
                          </div>
                          {selectedOrder.discount > 0 && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Discount</span>
                              <span>-₹{selectedOrder.discount?.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-stone-400">
                            <span>Shipping</span>
                            <span>{selectedOrder.shipping === 0 ? "Free (Express)" : `₹${selectedOrder.shipping}`}</span>
                          </div>
                          <div className="pt-2 border-t border-stone-800 flex justify-between font-semibold text-stone-100 text-sm">
                            <span>Total Amount</span>
                            <span className="text-amber-400">{selectedOrder.formattedTotal || `₹${selectedOrder.total?.toLocaleString("en-IN")}`}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // ORDERS LIST
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                        Your Order History
                      </span>
                      <span className="text-xs text-stone-500">
                        {orders.length} {orders.length === 1 ? "order" : "orders"} placed
                      </span>
                    </div>

                    {loadingOrders ? (
                      <div className="p-12 text-center text-stone-400 text-sm">
                        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading your orders...</span>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="p-10 rounded-2xl bg-stone-900/60 border border-stone-800 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
                          <Package className="w-6 h-6" />
                        </div>
                        <h4 className="text-stone-200 font-serif text-lg font-medium">No Orders Yet</h4>
                        <p className="text-xs text-stone-400 max-w-xs mx-auto">
                          When you make a purchase on Zenvia, your order details and live tracking will appear here automatically.
                        </p>
                      </div>
                    ) : (
                      orders.map((ord) => (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className="p-4 sm:p-5 rounded-2xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800/80 hover:border-amber-500/30 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          id={`order-card-${ord.id}`}
                        >
                          <div className="flex items-start gap-4">
                            {ord.items?.[0]?.image ? (
                              <img
                                src={ord.items[0].image}
                                alt={ord.items[0].name}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-xl object-cover bg-stone-800 border border-stone-700 shrink-0 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 text-amber-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-amber-400">
                                  {ord.id}
                                </span>
                                <span className="text-stone-500 text-xs">•</span>
                                <span className="text-xs text-stone-400">
                                  {new Date(ord.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </div>

                              <h4 className="text-sm font-medium text-stone-100 mt-1 line-clamp-1">
                                {ord.items?.[0]?.name}
                                {ord.items?.length > 1 && ` + ${ord.items.length - 1} more items`}
                              </h4>

                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadge(ord.orderStatus)}`}>
                                  {ord.orderStatus}
                                </span>
                                {ord.trackingNumber && (
                                  <span className="text-[11px] text-stone-400 font-mono">
                                    {ord.trackingNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                            <div className="text-left sm:text-right">
                              <span className="text-xs text-stone-400 block sm:inline mr-2">Total:</span>
                              <span className="text-base font-semibold text-stone-100">
                                {ord.formattedTotal || `₹${ord.total?.toLocaleString("en-IN")}`}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300"
                            >
                              <span>Details</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. SAVED ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Delivery Addresses
                    </h4>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Save multiple addresses for 1-tap checkout.
                    </p>
                  </div>

                  {!showAddressForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddressForm({
                          label: "Home",
                          fullName: user.fullName || "",
                          phone: user.phone || "",
                          email: user.email || "",
                          houseNo: "",
                          street: "",
                          landmark: "",
                          city: "",
                          state: "Karnataka",
                          pincode: "",
                          isDefault: (user.savedAddresses?.length || 0) === 0,
                        });
                        setEditingAddressId(null);
                        setShowAddressForm(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors shadow-sm"
                      id="btn-add-new-address"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Add / Edit Address Form Modal/Inline */}
                {showAddressForm ? (
                  <form
                    onSubmit={handleSaveAddress}
                    className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4"
                    id="form-saved-address"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                      <h4 className="text-sm font-semibold text-stone-100">
                        {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                        }}
                        className="text-stone-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tag / Label selector */}
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        Address Type
                      </label>
                      <div className="flex gap-2">
                        {["Home", "Work", "Other"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setAddressForm({ ...addressForm, label: tag })}
                            className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                              addressForm.label === tag
                                ? "bg-amber-500 text-stone-950 border-amber-500 font-semibold"
                                : "bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          placeholder="Receiver's full name"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-300 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          placeholder="10-digit mobile number"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Address Lines */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-300 mb-1">
                          Flat / House / Building *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.houseNo}
                          onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })}
                          placeholder="e.g. Flat 402, Oakwood Apts"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-300 mb-1">
                          Street / Area / Locality *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          placeholder="e.g. 100 Feet Road, Indiranagar"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-300 mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                          placeholder="e.g. Near Metro Station"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-300 mb-1">
                          City / Town *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="e.g. Bengaluru"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-300 mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "") })}
                          placeholder="6-digit PIN"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="check-default-addr"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 bg-stone-950 border-stone-800 focus:ring-amber-500"
                      />
                      <label htmlFor="check-default-addr" className="text-xs text-stone-300 cursor-pointer">
                        Set as default delivery address for 1-click checkout
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                        }}
                        className="py-2 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold shadow"
                      >
                        {editingAddressId ? "Update Address" : "Save Address"}
                      </button>
                    </div>
                  </form>
                ) : null}

                {/* List of saved addresses */}
                {user.savedAddresses?.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-stone-900/60 border border-stone-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h4 className="text-stone-200 font-medium text-sm">No Saved Addresses</h4>
                    <p className="text-xs text-stone-400 max-w-xs mx-auto">
                      Add your home or office address to autofill checkout instantly.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.savedAddresses?.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                          addr.isDefault
                            ? "bg-stone-900/90 border-amber-500/50 shadow-md"
                            : "bg-stone-900 border-stone-800"
                        }`}
                        id={`address-card-${addr.id}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              {addr.label === "Work" ? (
                                <Building className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Home className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                {addr.label}
                              </span>
                            </div>

                            {addr.isDefault && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          <h5 className="text-sm font-semibold text-stone-100">{addr.fullName}</h5>
                          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                            {addr.houseNo}, {addr.street}
                            {addr.landmark ? `, ${addr.landmark}` : ""}
                            <br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-xs text-stone-400 mt-2 font-mono">
                            Phone: {addr.phone}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-800/80 text-xs">
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-stone-400 hover:text-amber-400 transition-colors"
                            >
                              Set as Default
                            </button>
                          ) : (
                            <span className="text-stone-500 text-[11px]">Primary Address</span>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditAddressClick(addr)}
                              className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
                              title="Edit address"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this saved address?")) {
                                  deleteAddress(addr.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. PROFILE DETAILS TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Personal Details
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Manage your identity and contact information.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-6">
                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-stone-300 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-300 mb-1.5">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="py-2 px-4 rounded-xl bg-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="py-2 px-5 rounded-xl bg-amber-500 text-stone-950 text-xs font-semibold hover:bg-amber-400 shadow"
                        >
                          {savingProfile ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4 text-xs sm:text-sm">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <span className="text-stone-400">Full Name</span>
                        <span className="font-semibold text-stone-100">{user.fullName || "Not set"}</span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <span className="text-stone-400">Email Address</span>
                        <span className="font-mono text-stone-100">{user.email}</span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <span className="text-stone-400">Mobile Phone</span>
                        <span className="font-mono text-stone-100">{user.phone || "Not set"}</span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <span className="text-stone-400">Sign-in Method</span>
                        <span className="capitalize text-stone-200">{user.authProvider} Account</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Member Since</span>
                        <span className="text-stone-300">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "2026"}
                        </span>
                      </div>

                      <div className="pt-4 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 transition-colors"
                          id="btn-edit-profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-300 border border-rose-900/60 text-xs font-semibold transition-colors"
                          id="btn-signout-profile-tab"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
