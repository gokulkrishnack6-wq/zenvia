import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, SavedAddress, CustomerOrder } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (googleData: { email: string; fullName: string; avatarUrl?: string; phone?: string }) => Promise<{ isNewUser: boolean }>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { fullName?: string; phone?: string; avatarUrl?: string }) => Promise<void>;
  addAddress: (address: Omit<SavedAddress, "id" | "createdAt">) => Promise<void>;
  updateAddress: (addressId: string, updates: Partial<SavedAddress>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  fetchMyOrders: () => Promise<CustomerOrder[]>;
  linkGuestOrder: (orderId: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "zenvia_auth_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current user details with token
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(currentToken);
        } else {
          // Invalid response
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      } else {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn("[Auth] Failed to refresh user profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on app mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Google Sign-In
  const loginWithGoogle = async (googleData: {
    email: string;
    fullName: string;
    avatarUrl?: string;
    phone?: string;
  }): Promise<{ isNewUser: boolean }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Google authentication failed");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { isNewUser: Boolean(data.isNewUser) };
    } finally {
      setIsLoading(false);
    }
  };

  // Email Login
  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  // Email Registration
  const registerWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (currentToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      } catch (err) {
        console.warn("[Auth] Logout notification error:", err);
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // Update Profile
  const updateProfile = async (updates: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<void> => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) throw new Error("Please sign in to update your profile.");

    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to update profile");
    }

    setUser(data.user);
  };

  // Add Address
  const addAddress = async (address: Omit<SavedAddress, "id" | "createdAt">): Promise<void> => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) throw new Error("Please sign in to save addresses.");

    const res = await fetch("/api/auth/addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(address),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to add address");
    }

    setUser(data.user);
  };

  // Update Address
  const updateAddress = async (
    addressId: string,
    updates: Partial<SavedAddress>
  ): Promise<void> => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) throw new Error("Please sign in to update addresses.");

    const res = await fetch(`/api/auth/addresses/${addressId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to update address");
    }

    setUser(data.user);
  };

  // Delete Address
  const deleteAddress = async (addressId: string): Promise<void> => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) throw new Error("Please sign in to delete address.");

    const res = await fetch(`/api/auth/addresses/${addressId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to delete address");
    }

    setUser(data.user);
  };

  // Set Default Address
  const setDefaultAddress = async (addressId: string): Promise<void> => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) throw new Error("Please sign in.");

    const res = await fetch(`/api/auth/addresses/${addressId}/default`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to set default address");
    }

    setUser(data.user);
  };

  // Fetch Authenticated User's Orders
  const fetchMyOrders = async (): Promise<CustomerOrder[]> => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) return [];

    const res = await fetch("/api/orders/my-orders", {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  };

  // Link Guest Order to Logged In Account
  const linkGuestOrder = async (orderId: string): Promise<boolean> => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    if (!currentToken) return false;

    try {
      const res = await fetch("/api/orders/link-guest-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        fetchMyOrders,
        linkGuestOrder,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
