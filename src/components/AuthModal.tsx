import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: "signin" | "signup";
  allowGuestContinue?: boolean;
  onGuestContinue?: () => void;
  titleOverride?: string;
  subtitleOverride?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = "signin",
  allowGuestContinue = false,
  onGuestContinue,
  titleOverride,
  subtitleOverride,
}) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      // In production/preview: If user has logged in before or enters email, we simulate or connect Google profile
      // If user has entered an email or name in form, use it, otherwise use polished Google customer profile
      const googleProfile = {
        email: email.trim().length > 0 ? email.trim() : "customer@gmail.com",
        fullName: fullName.trim().length > 0 ? fullName.trim() : "Valued Customer",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
      };

      const result = await loginWithGoogle(googleProfile);
      setSuccessMessage(result.isNewUser ? "Account created with Google!" : "Welcome back!");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "Google sign in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle({
        email: "alexander@zenvia.co.in",
        fullName: "Alexander von Bern",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
      });
      setSuccessMessage("Logged in as Alexander von Bern!");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load demo account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await loginWithEmail(email, password);
        setSuccessMessage("Signed in successfully!");
      } else {
        if (!fullName.trim()) {
          setErrorMessage("Please enter your full name.");
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(email, password, fullName, phone);
        setSuccessMessage("Account created successfully!");
      }

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
          id="zenvia-auth-modal"
        >
          {/* Header Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800/60 transition-colors"
            aria-label="Close auth dialog"
            id="btn-close-auth"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Modal Title & Brand */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif tracking-wide text-stone-100 font-medium">
                {titleOverride || (mode === "signin" ? "Sign in to Zenvia" : "Create your Account")}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xs mx-auto">
                {subtitleOverride ||
                  (mode === "signin"
                    ? "Access your saved addresses, live order tracking, and 1-click checkout."
                    : "Join Zenvia to track orders, save delivery details, and unlock concierge support.")}
              </p>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-red-300 text-xs sm:text-sm"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2.5 text-emerald-300 text-xs sm:text-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* 1. PRIMARY GOOGLE SIGN-IN BUTTON */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                id="btn-google-auth-continue"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-stone-100 active:scale-[0.99] text-stone-900 font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Quick Demo Customer Account */}
              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                disabled={isSubmitting}
                id="btn-demo-account-login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 text-amber-400 hover:text-amber-300 font-medium text-xs transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Demo Login (Alexander • 2 Orders)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-stone-800 w-full" />
              <span className="bg-stone-900 px-3 text-[11px] font-medium uppercase tracking-wider text-stone-500 absolute">
                Or with email
              </span>
            </div>

            {/* Tab Switcher: Sign In vs Sign Up */}
            <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800/80 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === "signin"
                    ? "bg-amber-500 text-stone-950 font-semibold shadow"
                    : "text-stone-400 hover:text-stone-200"
                }`}
                id="tab-auth-signin"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-amber-500 text-stone-950 font-semibold shadow"
                    : "text-stone-400 hover:text-stone-200"
                }`}
                id="tab-auth-signup"
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Full Name <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                        id="auth-input-fullname"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Mobile Number <span className="text-stone-500 text-[10px]">(for delivery updates)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                        id="auth-input-phone"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  Email Address <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                    id="auth-input-email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-300">
                    Password <span className="text-amber-500">*</span>
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => alert("To reset your password, please sign in with Google or use the quick demo account.")}
                      className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signin" ? "••••••••" : "At least 6 characters"}
                    required
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                    id="auth-input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-semibold text-sm transition-all shadow-md hover:shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                id="btn-auth-submit"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === "signin" ? "Sign In to Account" : "Create Free Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Optional Guest Continue (for checkout) */}
            {allowGuestContinue && onGuestContinue && (
              <div className="mt-5 pt-4 border-t border-stone-800/80 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGuestContinue();
                  }}
                  className="text-xs text-stone-400 hover:text-stone-200 transition-colors font-medium underline underline-offset-4"
                  id="btn-continue-as-guest"
                >
                  Continue as Guest without account →
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
