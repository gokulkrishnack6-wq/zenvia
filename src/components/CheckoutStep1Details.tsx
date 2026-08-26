import React from "react";
import {
  MapPin,
  User,
  Truck,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Building,
  Mail,
  Phone,
} from "lucide-react";
import { PincodeValidationResult } from "../lib/pincodeService";

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi NCR",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export interface CheckoutFormState {
  fullName: string;
  phone: string;
  email: string;
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: "razorpay" | "cod";
}

export interface ValidationErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  houseNo?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface CheckoutStep1DetailsProps {
  formData: CheckoutFormState;
  fieldErrors: ValidationErrors;
  touchedFields: Record<string, boolean>;
  pincodeCheckState: {
    status: "idle" | "checking" | "serviceable" | "unserviceable" | "invalid";
    message?: string;
    location?: string;
  };
  onInputChange: (key: keyof CheckoutFormState, value: string) => void;
  onBlur: (key: keyof CheckoutFormState) => void;
  onContinueToPayment: () => void;
}

export const CheckoutStep1Details: React.FC<CheckoutStep1DetailsProps> = ({
  formData,
  fieldErrors,
  touchedFields,
  pincodeCheckState,
  onInputChange,
  onBlur,
  onContinueToPayment,
}) => {
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
              Where should we deliver your order?
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Enter your delivery details to continue to payment.
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Free Delivery</span>
          </span>
        </div>
      </div>

      {/* Form Fields Container */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-neutral-900 font-bold text-xs block mb-1.5">
            Full Name <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="checkout-full-name-input"
              autoComplete="name"
              value={formData.fullName}
              onChange={(e) => onInputChange("fullName", e.target.value)}
              onBlur={() => onBlur("fullName")}
              className={`w-full bg-white border ${
                touchedFields.fullName && fieldErrors.fullName
                  ? "border-rose-500 bg-rose-50/20"
                  : "border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              } rounded-xl pl-10 pr-3.5 py-3 text-neutral-950 font-medium text-[16px] md:text-sm focus:outline-none min-h-[48px] transition-all`}
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          {touchedFields.fullName && fieldErrors.fullName && (
            <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.fullName}</span>
            </p>
          )}
        </div>

        {/* Mobile Number & Email Address (2-col on tablet/desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Mobile Number */}
          <div>
            <label className="text-neutral-900 font-bold text-xs block mb-1.5">
              Mobile Number <span className="text-rose-600">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-600 font-bold text-sm pointer-events-none select-none">
                +91
              </span>
              <input
                type="tel"
                id="checkout-phone-input"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => onInputChange("phone", e.target.value.replace(/\D/g, ""))}
                onBlur={() => onBlur("phone")}
                className={`w-full bg-white border ${
                  touchedFields.phone && fieldErrors.phone
                    ? "border-rose-500 bg-rose-50/20"
                    : "border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                } rounded-xl pl-12 pr-3.5 py-3 text-neutral-950 font-mono text-[16px] md:text-sm focus:outline-none min-h-[48px] transition-all`}
                placeholder="10-digit number"
              />
            </div>
            {touchedFields.phone && fieldErrors.phone && (
              <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.phone}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="text-neutral-900 font-bold text-xs block mb-1.5">
              Email Address <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                id="checkout-email-input"
                inputMode="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => onInputChange("email", e.target.value)}
                onBlur={() => onBlur("email")}
                className={`w-full bg-white border ${
                  touchedFields.email && fieldErrors.email
                    ? "border-rose-500 bg-rose-50/20"
                    : "border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                } rounded-xl pl-10 pr-3.5 py-3 text-neutral-950 text-[16px] md:text-sm focus:outline-none min-h-[48px] transition-all`}
                placeholder="name@example.com"
              />
            </div>
            {touchedFields.email && fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* House / Building / Street Address */}
        <div>
          <label className="text-neutral-900 font-bold text-xs block mb-1.5">
            House / Flat / Building <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <Building className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="checkout-house-input"
              autoComplete="address-line1"
              value={formData.houseNo}
              onChange={(e) => onInputChange("houseNo", e.target.value)}
              onBlur={() => onBlur("houseNo")}
              className={`w-full bg-white border ${
                touchedFields.houseNo && fieldErrors.houseNo
                  ? "border-rose-500 bg-rose-50/20"
                  : "border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              } rounded-xl pl-10 pr-3.5 py-3 text-neutral-950 text-[16px] md:text-sm focus:outline-none min-h-[48px] transition-all`}
              placeholder="Flat / House / Floor / Building No."
            />
          </div>
          {touchedFields.houseNo && fieldErrors.houseNo && (
            <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.houseNo}</span>
            </p>
          )}
        </div>

        {/* Area / Street / Locality */}
        <div>
          <label className="text-neutral-900 font-bold text-xs block mb-1.5">
            Area / Street / Locality <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="checkout-street-input"
              autoComplete="address-line2"
              value={formData.street}
              onChange={(e) => onInputChange("street", e.target.value)}
              onBlur={() => onBlur("street")}
              className={`w-full bg-white border ${
                touchedFields.street && fieldErrors.street
                  ? "border-rose-500 bg-rose-50/20"
                  : "border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              } rounded-xl pl-10 pr-3.5 py-3 text-neutral-950 text-[16px] md:text-sm focus:outline-none min-h-[48px] transition-all`}
              placeholder="Street name, Area, Colony, Locality"
            />
          </div>
          {touchedFields.street && fieldErrors.street && (
            <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.street}</span>
            </p>
          )}
        </div>

        {/* Landmark (Optional) */}
        <div>
          <label className="text-neutral-900 font-bold text-xs block mb-1.5">
            Landmark <span className="text-neutral-400 font-normal text-[11px]">(Optional)</span>
          </label>
          <input
            type="text"
            id="checkout-landmark-input"
            value={formData.landmark}
            onChange={(e) => onInputChange("landmark", e.target.value)}
            className="w-full bg-white border border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 rounded-xl px-3.5 py-3 text-neutral-950 text-[16px] md:text-sm focus:outline-none min-h-[48px] transition-all"
            placeholder="Nearby landmark (e.g. Near Metro Station / Park)"
          />
        </div>

        {/* PIN Code, City & State (Row grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* PIN Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-neutral-900 font-bold text-xs">
                PIN Code <span className="text-rose-600">*</span>
              </label>
              {pincodeCheckState.status === "checking" && (
                <span className="text-[10px] text-amber-700 flex items-center space-x-1 font-semibold">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Checking...</span>
                </span>
              )}
            </div>

            <input
              type="text"
              id="checkout-pincode-input"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              value={formData.pincode}
              onChange={(e) => onInputChange("pincode", e.target.value.replace(/\D/g, ""))}
              onBlur={() => onBlur("pincode")}
              className={`w-full bg-white border ${
                touchedFields.pincode &&
                (fieldErrors.pincode ||
                  pincodeCheckState.status === "unserviceable" ||
                  pincodeCheckState.status === "invalid")
                  ? "border-rose-500 bg-rose-50/20"
                  : pincodeCheckState.status === "serviceable"
                  ? "border-emerald-500 bg-emerald-50/10"
                  : "border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              } rounded-xl px-3.5 py-3 text-neutral-950 font-mono text-[16px] md:text-sm focus:outline-none min-h-[48px] transition-all`}
              placeholder="6-digit PIN"
            />

            {pincodeCheckState.status === "serviceable" && (
              <p className="text-[11px] text-emerald-700 mt-1 font-bold">
                ✓ {pincodeCheckState.location || "Serviceable"}
              </p>
            )}

            {pincodeCheckState.status === "unserviceable" && (
              <p className="text-xs text-rose-600 mt-1 font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{pincodeCheckState.message}</span>
              </p>
            )}

            {touchedFields.pincode &&
              fieldErrors.pincode &&
              pincodeCheckState.status === "idle" && (
                <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.pincode}</span>
                </p>
              )}
          </div>

          {/* City */}
          <div>
            <label className="text-neutral-900 font-bold text-xs block mb-1.5">
              City <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              id="checkout-city-input"
              autoComplete="address-level2"
              value={formData.city}
              onChange={(e) => onInputChange("city", e.target.value)}
              onBlur={() => onBlur("city")}
              className={`w-full bg-white border ${
                touchedFields.city && fieldErrors.city
                  ? "border-rose-500 bg-rose-50/20"
                  : "border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              } rounded-xl px-3.5 py-3 text-neutral-950 focus:outline-none font-medium text-[16px] md:text-sm min-h-[48px] transition-all`}
              placeholder="City / District"
            />
            {touchedFields.city && fieldErrors.city && (
              <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.city}</span>
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="text-neutral-900 font-bold text-xs block mb-1.5">
              State <span className="text-rose-600">*</span>
            </label>
            <select
              id="checkout-state-select"
              autoComplete="address-level1"
              value={formData.state}
              onChange={(e) => onInputChange("state", e.target.value)}
              onBlur={() => onBlur("state")}
              className={`w-full bg-white border ${
                touchedFields.state && fieldErrors.state
                  ? "border-rose-500 bg-rose-50/20"
                  : "border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              } rounded-xl px-3 py-3 text-neutral-950 focus:outline-none font-medium text-[16px] md:text-sm min-h-[48px] transition-all`}
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {touchedFields.state && fieldErrors.state && (
              <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.state}</span>
              </p>
            )}
          </div>
        </div>

        {/* Desktop prominent CTA */}
        <div className="hidden md:block pt-3">
          <button
            type="button"
            onClick={onContinueToPayment}
            id="continue-to-payment-desktop-btn"
            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.99]"
          >
            <span>CONTINUE TO PAYMENT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[11px] text-neutral-500 font-medium mt-2 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step 1 of 2: Your personal information is secure and private.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
