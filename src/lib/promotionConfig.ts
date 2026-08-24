import { useState, useEffect } from "react";

/**
 * CENTRAL PROMOTION CONFIGURATION
 * 
 * Edit `PROMOTION_CONFIG.endTime` to set the exact promotional deadline.
 * Timezone format: ISO 8601 with offset (e.g., "+05:30" for IST).
 */
export const PROMOTION_CONFIG = {
  // Master toggle to enable or disable the promotion timer
  enabled: true,

  // Campaign Title
  campaignName: "Special Limited-Time Launch Deal",

  // Authoritative Promotion End Timestamp (ISO 8601)
  // Example: 2026-08-25T23:59:59+05:30 (Ends at 11:59:59 PM IST on Aug 25, 2026)
  endTime: "2026-08-25T23:59:59+05:30",

  // Labels & messaging
  badgeText: "LIMITED-TIME DEAL",
  activeSubtext: "Order before the deal ends.",
  checkoutNotice: "Limited-time offer",
  expiredNotice: "This special deal has ended.",
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
  const endIso = customEndTime || PROMOTION_CONFIG.endTime;
  const targetTime = new Date(endIso).getTime();

  if (!PROMOTION_CONFIG.enabled || isNaN(targetTime)) {
    return {
      isActive: false,
      isExpired: true,
      hours: "00",
      minutes: "00",
      seconds: "00",
      formattedTimer: "00 : 00 : 00",
      remainingMs: 0,
      endTime: endIso,
    };
  }

  const offset = cachedServerOffsetMs ?? 0;
  const currentNow = Date.now() + offset;
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
      endTime: endIso,
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
    endTime: endIso,
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
