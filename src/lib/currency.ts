export function formatRupee(amount: number): string {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString("en-IN")}`;
}

export function formatINR(amount: number): string {
  return formatRupee(amount);
}
