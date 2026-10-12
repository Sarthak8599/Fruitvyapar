export function cleanIndianMobile(raw: string): string {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  // If pasted with country code 91 e.g. 919822011223
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  }
  // Remove leading 0
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }
  return digits.slice(0, 10);
}

export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(cleanIndianMobile(phone));
}
