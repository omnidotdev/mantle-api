-- Normalize phone numbers to canonical E.164 (e.g. +14155552671) on every write.
-- PostGraphile/Grafast issues its own SQL against the pg pool and bypasses
-- Drizzle, and rows also arrive via CSV/JSON import and raw API calls, so a
-- DB-level trigger is the only place that covers every write path. The app
-- (libphonenumber-js) is the high-quality source of truth and already sends
-- E.164; this trigger is the guarantee/safety net for any other path. It is
-- deliberately conservative: it never mangles a value it cannot confidently
-- normalize (extensions, notes, unusual lengths pass through untouched).

-- Calling code for a region, defaulting to the North American Numbering Plan.
CREATE OR REPLACE FUNCTION mantle_calling_code(region text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE upper(coalesce(region, ''))
    WHEN 'US' THEN '1'
    WHEN 'CA' THEN '1'
    WHEN 'GB' THEN '44'
    WHEN 'AU' THEN '61'
    WHEN 'NZ' THEN '64'
    WHEN 'IE' THEN '353'
    WHEN 'DE' THEN '49'
    WHEN 'FR' THEN '33'
    WHEN 'ES' THEN '34'
    WHEN 'IT' THEN '39'
    WHEN 'MX' THEN '52'
    WHEN 'IN' THEN '91'
    WHEN 'JP' THEN '81'
    ELSE '1'
  END;
$$;

-- Best-effort map of a free-text country value (ISO code or name) to a region.
CREATE OR REPLACE FUNCTION mantle_region_from_country(country text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(btrim(coalesce(country, '')))
    WHEN 'us' THEN 'US'
    WHEN 'usa' THEN 'US'
    WHEN 'united states' THEN 'US'
    WHEN 'united states of america' THEN 'US'
    WHEN 'america' THEN 'US'
    WHEN 'uk' THEN 'GB'
    WHEN 'gb' THEN 'GB'
    WHEN 'united kingdom' THEN 'GB'
    WHEN 'great britain' THEN 'GB'
    WHEN 'england' THEN 'GB'
    WHEN 'canada' THEN 'CA'
    WHEN 'ca' THEN 'CA'
    WHEN 'australia' THEN 'AU'
    WHEN 'au' THEN 'AU'
    WHEN 'new zealand' THEN 'NZ'
    WHEN 'ireland' THEN 'IE'
    WHEN 'germany' THEN 'DE'
    WHEN 'france' THEN 'FR'
    WHEN 'spain' THEN 'ES'
    WHEN 'italy' THEN 'IT'
    WHEN 'mexico' THEN 'MX'
    WHEN 'india' THEN 'IN'
    WHEN 'japan' THEN 'JP'
    ELSE 'US'
  END;
$$;

-- Normalize a raw phone value to E.164, or leave it untouched when unsure.
CREATE OR REPLACE FUNCTION mantle_normalize_phone(raw text, default_region text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  trimmed text;
  digits text;
  cc text;
BEGIN
  IF raw IS NULL THEN
    RETURN NULL;
  END IF;

  trimmed := btrim(raw);
  IF trimmed = '' THEN
    RETURN NULL;
  END IF;

  digits := regexp_replace(trimmed, '\D', '', 'g');

  -- No digits at all: a note or extension, leave it alone.
  IF digits = '' THEN
    RETURN trimmed;
  END IF;

  -- Already international.
  IF left(trimmed, 1) = '+' THEN
    RETURN '+' || digits;
  END IF;

  -- ITU '00' international call prefix.
  IF left(trimmed, 2) = '00' THEN
    RETURN '+' || substr(digits, 3);
  END IF;

  cc := mantle_calling_code(default_region);

  -- North American Numbering Plan: only the two unambiguous shapes.
  IF cc = '1' THEN
    IF length(digits) = 10 THEN
      RETURN '+1' || digits;
    END IF;
    IF length(digits) = 11 AND left(digits, 1) = '1' THEN
      RETURN '+' || digits;
    END IF;
    RETURN trimmed;
  END IF;

  -- Other regions: drop a single national trunk 0, then prepend the code.
  IF left(digits, 1) = '0' THEN
    digits := substr(digits, 2);
  END IF;
  IF left(digits, length(cc)) = cc THEN
    RETURN '+' || digits;
  END IF;
  RETURN '+' || cc || digits;
END;
$$;

-- Per-table trigger functions (each knows its column and region source).
CREATE OR REPLACE FUNCTION mantle_normalize_person_phone()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.phone := mantle_normalize_phone(NEW.phone, 'US');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION mantle_normalize_company_phone()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.phone := mantle_normalize_phone(
    NEW.phone,
    mantle_region_from_country(NEW.country)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION mantle_normalize_supplier_phone()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.contact_phone := mantle_normalize_phone(NEW.contact_phone, 'US');
  RETURN NEW;
END;
$$;

-- Attach the triggers (idempotent: drop-if-exists then create).
DROP TRIGGER IF EXISTS normalize_phone ON person;
CREATE TRIGGER normalize_phone
  BEFORE INSERT OR UPDATE ON person
  FOR EACH ROW EXECUTE FUNCTION mantle_normalize_person_phone();

DROP TRIGGER IF EXISTS normalize_phone ON company;
CREATE TRIGGER normalize_phone
  BEFORE INSERT OR UPDATE ON company
  FOR EACH ROW EXECUTE FUNCTION mantle_normalize_company_phone();

DROP TRIGGER IF EXISTS normalize_phone ON supplier;
CREATE TRIGGER normalize_phone
  BEFORE INSERT OR UPDATE ON supplier
  FOR EACH ROW EXECUTE FUNCTION mantle_normalize_supplier_phone();
