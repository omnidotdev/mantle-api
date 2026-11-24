/** Longest payment link accepted, generous for any payment provider's URL */
export const PAYMENT_LINK_MAX_LENGTH = 2048;

/**
 * Whether a value is a payment link safe to store and render: an absolute
 * https URL with a host, no embedded credentials, and within the length limit.
 * Anything else (http, javascript:, data:, relative paths) is never linked
 */
export const isSafePaymentLink = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > PAYMENT_LINK_MAX_LENGTH) return false;

  try {
    const url = new URL(trimmed);

    return (
      url.protocol === "https:" &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};

/**
 * Why a payment link is refused, or null when it is acceptable. No link (null,
 * or blank) is acceptable: the invoice simply has none
 */
export const paymentLinkError = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && !value.trim()) return null;
  if (
    typeof value === "string" &&
    value.trim().length > PAYMENT_LINK_MAX_LENGTH
  )
    return `Payment links can be at most ${PAYMENT_LINK_MAX_LENGTH} characters`;
  if (isSafePaymentLink(value)) return null;

  return "Enter a full payment link starting with https://";
};
