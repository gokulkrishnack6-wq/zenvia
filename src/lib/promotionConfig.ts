import { useState, useEffect } from "react";

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
  expiredNotice: "Special Limited-Time Offer (Ends Today)",
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

let cachedServerOffsetMs: number | null = null;
let serverOffsetPromise: Promise<number> | null = null;

/**
 * Synchronizes client time with server time to avoid device clock discrepancies.
 */
async function fetchServerOffset(): Promise<number> {
  if (cachedServerOffsetMs !== null) return cachedServerOffsetMs;
  if (serverOffsetPromise) return serverOffsetPromise;

  serverOffsetPromise = (async () => {
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
          return cachedServerOffsetMs;
        }
      }
    } catch {
      // Fallback: zero offset if offline or request fails
    }
    cachedServerOffsetMs = 0;
    return 0;
  })();

  return serverOffsetPromise;
}

/**
 * Calculates current remaining time based on synchronized server time.
 */
export function getPromotionTimeRemaining(customEndTime?: string): CountdownState {
  let targetTime: number;

  if (customEndTime) {
    targetTime = new Date(customEndTime).getTime();
  } else {
    // 22-hour persistent window based on initial user session or storage
    const STORAGE_KEY = "zenvia_sink_caddy_22h_timer_start";
    let startMs: number;
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        startMs = parseInt(stored, 10);
      } else {
        startMs = Date.now();
        localStorage.setItem(STORAGE_KEY, startMs.toString());
      }
    } else {
      startMs = Date.now();
    }
    const durationMs = PROMOTION_CONFIG.durationHours * 60 * 60 * 1000;
    targetTime = startMs + durationMs;
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
      endTime: new Date(targetTime).toISOString(),
    };
  }

  const offset = cachedServerOffsetMs ?? 0;
  const currentNow = Date.now() + offset;
  const diff = targetTime - currentNow;

  if (diff <= 0) {
    // Reset rolling window so active offer always stays present
    const durationMs = PROMOTION_CONFIG.durationHours * 60 * 60 * 1000;
    const refreshedTarget = currentNow + durationMs;
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("zenvia_sink_caddy_22h_timer_start", currentNow.toString());
    }
    return {
      isActive: true,
      isExpired: false,
      hours: "22",
      minutes: "00",
      seconds: "00",
      formattedTimer: "22 : 00 : 00",
      remainingMs: durationMs,
      endTime: new Date(refreshedTarget).toISOString(),
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
 * Automatically updates every 1,000ms and remains synchronized across page reloads.
 */
export function usePromotionCountdown(customEndTime?: string): CountdownState {
  const [state, setState] = useState<CountdownState>(() =>
    getPromotionTimeRemaining(customEndTime)
  );

  useEffect(() => {
    // 1. Initial server synchronization
    fetchServerOffset().then(() => {
      setState(getPromotionTimeRemaining(customEndTime));
    });

    // 2. 1-second interval ticking
    const interval = setInterval(() => {
      const current = getPromotionTimeRemaining(customEndTime);
      setState(current);
      if (current.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [customEndTime]);

  return state;
}
