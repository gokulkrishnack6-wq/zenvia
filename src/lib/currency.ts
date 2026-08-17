export function formatRupee(amount: number): string {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString("en-IN")}`;
}

export function formatRupeeExact(amount: number): string {
  if (Number.isInteger(amount)) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatINR(amount: number): string {
  return formatRupee(amount);
}
