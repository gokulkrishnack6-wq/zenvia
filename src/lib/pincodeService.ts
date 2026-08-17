/**
 * Zenvia Express Shipping & Indian Postal PIN Code Serviceability Engine
 * Validates genuine Indian Postal Index Numbers (PIN codes) and real delivery serviceability
 */

export interface PincodeValidationResult {
  serviceable: boolean;
  status: "available" | "unavailable" | "invalid_format";
  title: string;
  message: string;
  location?: string;
  district?: string;
  state?: string;
  deliveryDate?: string;
  codAvailable?: boolean;
  courier?: string;
}

// Known dummy / repetitive non-serviceable patterns
const DUMMY_OR_INVALID_PINS = new Set([
  "000000",
  "111111",
  "222222",
  "333333",
  "444444",
  "555555",
  "666666",
  "777777",
  "888888",
  "999999",
  "123456",
  "654321",
  "123123",
  "987654",
  "100000",
  "200000",
  "300000",
  "400000",
  "500000",
  "600000",
  "700000",
  "800000",
  "900000",
]);

// Valid 2-digit Indian Postal Circle Prefixes
const VALID_POSTAL_PREFIXES = new Set([
  // Delhi
  "11",
  // Haryana
  "12", "13",
  // Punjab & Chandigarh
  "14", "15", "16",
  // Himachal Pradesh
  "17",
  // Jammu & Kashmir, Ladakh
  "18", "19",
  // Uttar Pradesh & Uttarakhand
  "20", "21", "22", "23", "24", "25", "26", "27", "28",
  // Rajasthan
  "30", "31", "32", "33", "34",
  // Gujarat, DNH, Daman & Diu
  "36", "37", "38", "39",
  // Maharashtra & Goa
  "40", "41", "42", "43", "44",
  // Madhya Pradesh
  "45", "46", "47", "48",
  // Chhattisgarh
  "49",
  // Telangana
  "50",
  // Andhra Pradesh
  "51", "52", "53",
  // Karnataka
  "56", "57", "58", "59",
  // Tamil Nadu & Puducherry
  "60", "61", "62", "63", "64",
  // Kerala & Lakshadweep
  "67", "68", "69",
  // West Bengal, Sikkim, Andaman & Nicobar
  "70", "71", "72", "73", "74",
  // Odisha
  "75", "76", "77",
  // Assam
  "78",
  // North Eastern States (Arunachal, Manipur, Meghalaya, Mizoram, Nagaland, Tripura)
  "79",
  // Bihar & Jharkhand
  "80", "81", "82", "83", "84", "85",
]);

// Client-side cache for rapid lookup
const pincodeCache = new Map<string, PincodeValidationResult>();

/**
 * Validates PIN code format strictly
 */
export function validatePincodeFormat(pincode: string): { isValid: boolean; reason?: string } {
  const clean = (pincode || "").trim();

  if (!clean) {
    return { isValid: false, reason: "PIN code cannot be empty." };
  }

  // Must be strictly 6 digits with no letters or special characters
  if (!/^\d+$/.test(clean)) {
    return { isValid: false, reason: "PIN code must contain only numbers." };
  }

  if (clean.length !== 6) {
    return { isValid: false, reason: "Please enter a valid 6-digit Indian PIN code." };
  }

  // Indian PIN codes cannot start with 0
  if (clean.startsWith("0")) {
    return { isValid: false, reason: "Invalid PIN code. Indian PIN codes cannot start with 0." };
  }

  return { isValid: true };
}

/**
 * Checks whether an Indian PIN code is valid and serviceable
 */
export async function checkPincodeServiceability(pincodeInput: string): Promise<PincodeValidationResult> {
  const clean = (pincodeInput || "").trim();

  // 1. Validate format
  const formatCheck = validatePincodeFormat(clean);
  if (!formatCheck.isValid) {
    return {
      serviceable: false,
      status: "invalid_format",
      title: "Invalid PIN Code",
      message: formatCheck.reason || "Please enter a valid 6-digit Indian PIN code.",
    };
  }

  // 2. Reject obvious fake / dummy patterns
  if (DUMMY_OR_INVALID_PINS.has(clean)) {
    return {
      serviceable: false,
      status: "unavailable",
      title: "Delivery Not Available",
      message: "Sorry, delivery is currently unavailable for this PIN code.",
    };
  }

  // 3. Reject invalid postal circle prefixes
  const prefix = clean.substring(0, 2);
  if (!VALID_POSTAL_PREFIXES.has(prefix)) {
    return {
      serviceable: false,
      status: "unavailable",
      title: "Delivery Not Available",
      message: "Sorry, delivery is currently unavailable for this PIN code.",
    };
  }

  // 4. Check in-memory cache
  if (pincodeCache.has(clean)) {
    return pincodeCache.get(clean)!;
  }

  // 5. Query server validation endpoint or Postal API
  try {
    const res = await fetch(`/api/pincode/check?pincode=${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data: PincodeValidationResult = await res.json();
      pincodeCache.set(clean, data);
      return data;
    }
  } catch (err) {
    console.warn("Backend pincode check endpoint error, trying direct postal lookup:", err);
  }

  // 6. Direct fallback lookup to Indian Postal API if backend route had transient issue
  try {
    const directRes = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
    if (directRes.ok) {
      const data = await directRes.json();
      if (Array.isArray(data) && data.length > 0 && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
        const primaryPO = data[0].PostOffice[0];
        const locationName = primaryPO.District
          ? `${primaryPO.District}, ${primaryPO.State}`
          : primaryPO.Name
          ? `${primaryPO.Name}, ${primaryPO.State}`
          : primaryPO.State;

        const result: PincodeValidationResult = {
          serviceable: true,
          status: "available",
          title: "Delivery Available",
          message: "We deliver to this PIN code.",
          location: locationName,
          district: primaryPO.District,
          state: primaryPO.State,
          codAvailable: true,
          courier: "Fast & Reliable Delivery Across India",
        };
        pincodeCache.set(clean, result);
        return result;
      }
    }
  } catch (directErr) {
    console.warn("Direct postal lookup error:", directErr);
  }

  // 7. If not found in postal records or error returned
  const notFoundResult: PincodeValidationResult = {
    serviceable: false,
    status: "unavailable",
    title: "Delivery Not Available",
    message: "Sorry, delivery is currently unavailable for this PIN code.",
  };
  pincodeCache.set(clean, notFoundResult);
  return notFoundResult;
}
