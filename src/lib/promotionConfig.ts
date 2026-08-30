import { useState, useEffect, useCallback } from "react";

/**
 * CENTRAL PROMOTION CONFIGURATION
 * 
 * Configures the live 22-Hour Limited-Time Offer promotional deadline.
 */
export const PROMOTION_CONFIG = {
  // Master toggle to enable or disable the promotion timer
  enabled: true,

  // Campaign Title
  campaignName: "22-Hour Limited-Time Offer",

  // Authoritative Promotion Duration (22 Hours)
  durationHours: 22,

  // Labels & messaging
  badgeText: "22-HOUR LIMITED OFFER",
  activeSubtext: "Upgrade your sink before the offer ends.",
  checkoutNotice: "22-Hour Limited-Time Offer",
  expiredNotice: "OFFER ENDED",
};

export interface CountdownState {
  isActive: boolean;
  isExpired: boolean;
  hours: string;
  minutes: string;
  seconds: string;
  formattedTimer: string;
  remainingMs: number;
  endTime: string;
}

const STORAGE_CAMPAIGN_END_KEY = "zenvia_active_campaign_end_time";
const DEFAULT_CAMPAIGN_DURATION_MS = 22 * 60 * 60 * 1000; // 22 Hours

let cachedServerOffsetMs: number = 0;
let cachedAuthoritativeEndTime: number | null = null;
let serverSyncPromise: Promise<{ offset: number; endTime: number | null }> | null = null;

/**
 * Synchronizes client time and campaign end time with the server.
 */
async function syncWithServer(): Promise<{ offset: number; endTime: number | null }> {
  if (serverSyncPromise) return serverSyncPromise;

  serverSyncPromise = (async () => {
    try {
      const clientReqTime = Date.now();
      const res = await fetch("/api/time", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const clientRespTime = Date.now();
        const roundTrip = (clientRespTime - clientReqTime) / 2;
        const serverTime = Number(data.serverTime);
        if (!isNaN(serverTime)) {
          cachedServerOffsetMs = serverTime - (clientRespTime - roundTrip);
        }
        if (typeof data.campaignEndTime === "number" && !isNaN(data.campaignEndTime)) {
          cachedAuthoritativeEndTime = data.campaignEndTime;
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem(STORAGE_CAMPAIGN_END_KEY, data.campaignEndTime.toString());
          }
        }
        return { offset: cachedServerOffsetMs, endTime: cachedAuthoritativeEndTime };
      }
    } catch {
      // Fallback: use client clock and local storage if offline or request fails
    }
    return { offset: cachedServerOffsetMs, endTime: cachedAuthoritativeEndTime };
  })();

  return serverSyncPromise;
}

/**
 * Gets or initializes the campaign end timestamp.
 */
export function getStoredCampaignEndTime(): number {
  if (cachedAuthoritativeEndTime !== null) {
    return cachedAuthoritativeEndTime;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    const stored = localStorage.getItem(STORAGE_CAMPAIGN_END_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) {
        cachedAuthoritativeEndTime = parsed;
        return parsed;
      }
    }

    // Initialize initial 22-hour deadline if none exists
    const initialEndTime = Date.now() + DEFAULT_CAMPAIGN_DURATION_MS;
    try {
      localStorage.setItem(STORAGE_CAMPAIGN_END_KEY, initialEndTime.toString());
    } catch {
      // Storage access error handling
    }
    cachedAuthoritativeEndTime = initialEndTime;
    return initialEndTime;
  }

  return Date.now() + DEFAULT_CAMPAIGN_DURATION_MS;
}

/**
 * Calculates current remaining time based on absolute timestamp.
 */
export function getPromotionTimeRemaining(customEndTime?: string | number): CountdownState {
  let targetTime: number;

  if (customEndTime) {
    targetTime = typeof customEndTime === "number" ? customEndTime : new Date(customEndTime).getTime();
  } else {
    targetTime = getStoredCampaignEndTime();
  }

  if (!PROMOTION_CONFIG.enabled || isNaN(targetTime)) {
    return {
      isActive: false,
      isExpired: false,
      hours: "22",
      minutes: "00",
      seconds: "00",
      formattedTimer: "22 : 00 : 00",
      remainingMs: 0,
      endTime: new Date(targetTime || Date.now()).toISOString(),
    };
  }

  const currentNow = Date.now() + cachedServerOffsetMs;
  const diff = targetTime - currentNow;

  if (diff <= 0) {
    return {
      isActive: false,
      isExpired: true,
      hours: "00",
      minutes: "00",
      seconds: "00",
      formattedTimer: "00 : 00 : 00",
      remainingMs: 0,
      endTime: new Date(targetTime).toISOString(),
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const totalHours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  const hoursStr = pad(totalHours);
  const minutesStr = pad(minutes);
  const secondsStr = pad(seconds);

  return {
    isActive: true,
    isExpired: false,
    hours: hoursStr,
    minutes: minutesStr,
    seconds: secondsStr,
    formattedTimer: `${hoursStr} : ${minutesStr} : ${secondsStr}`,
    remainingMs: diff,
    endTime: new Date(targetTime).toISOString(),
  };
}

/**
 * React Hook for Real-time Promotion Countdown
 * Automatically updates every second and accurately calculates from absolute timestamp.
 */
export function usePromotionCountdown(customEndTime?: string | number): CountdownState {
  const calculateRemaining = useCallback(() => {
    return getPromotionTimeRemaining(customEndTime);
  }, [customEndTime]);

  const [state, setState] = useState<CountdownState>(() => calculateRemaining());

  useEffect(() => {
    // 1. Initial server synchronization
    syncWithServer().then(() => {
      setState(calculateRemaining());
    });

    // 2. 1-second interval ticking
    const intervalId = window.setInterval(() => {
      const current = calculateRemaining();
      setState(current);
      if (current.isExpired) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    // 3. Immediately re-calculate when tab becomes visible or focused (prevents background throttle drift)
    const handleVisibilityOrFocus = () => {
      setState(calculateRemaining());
    };

    // 4. Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_CAMPAIGN_END_KEY && e.newValue) {
        const parsed = parseInt(e.newValue, 10);
        if (!isNaN(parsed)) {
          cachedAuthoritativeEndTime = parsed;
          setState(calculateRemaining());
        }
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleVisibilityOrFocus);
      window.addEventListener("storage", handleStorageChange);
    }

    return () => {
      window.clearInterval(intervalId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleVisibilityOrFocus);
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, [calculateRemaining]);

  return state;
}

