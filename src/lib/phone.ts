import { getCountries, parsePhoneNumberFromString } from "libphonenumber-js";

import type { CountryCode } from "libphonenumber-js";

/**
 * Region assumed when a phone number has no international country code and no
 * better hint (e.g. a company's own country) is available.
 */
const DEFAULT_REGION: CountryCode = "US";

const SUPPORTED_REGIONS = new Set<string>(getCountries());

/**
 * Best-effort map of common free-text country values to an ISO 3166-1 alpha-2
 * region. Mirrors mantle_region_from_country in the DB trigger migration and
 * resolveRegion in mantle-app.
 */
const COUNTRY_ALIASES: Record<string, CountryCode> = {
  usa: "US",
  us: "US",
  "united states": "US",
  "united states of america": "US",
  america: "US",
  uk: "GB",
  gb: "GB",
  "united kingdom": "GB",
  "great britain": "GB",
  england: "GB",
  canada: "CA",
  ca: "CA",
  australia: "AU",
  au: "AU",
  "new zealand": "NZ",
  ireland: "IE",
  germany: "DE",
  france: "FR",
  spain: "ES",
  italy: "IT",
  mexico: "MX",
  india: "IN",
  japan: "JP",
};

/**
 * Resolve a free-text country value (ISO code or country name) to a region.
 * Falls back to {@link DEFAULT_REGION}.
 */
export const resolveRegion = (country?: string | null): CountryCode => {
  if (!country) return DEFAULT_REGION;

  const trimmed = country.trim();
  const upper = trimmed.toUpperCase();
  if (upper.length === 2 && SUPPORTED_REGIONS.has(upper))
    return upper as CountryCode;

  return COUNTRY_ALIASES[trimmed.toLowerCase()] ?? DEFAULT_REGION;
};

/**
 * Normalize a phone number to canonical E.164 form (e.g. `+14155552671`).
 * Returns `null` for empty input and leaves unparseable values (extensions,
 * notes) trimmed but otherwise untouched so no data is destroyed.
 */
export const toE164 = (
  input?: string | null,
  region: CountryCode = DEFAULT_REGION,
): string | null => {
  if (input == null) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  const normalized = /^00\d/.test(trimmed) ? `+${trimmed.slice(2)}` : trimmed;
  const parsed = parsePhoneNumberFromString(normalized, region);

  return parsed?.isValid() ? parsed.number : trimmed;
};
