import type { Query } from "lib/db/transaction";

/** Default prefix per document type */
const defaultPrefix = (docType: string): string => {
  switch (docType) {
    case "quote":
      return "QT";
    case "invoice":
      return "INV";
    default:
      return docType.slice(0, 3).toUpperCase();
  }
};

/** Generate an uppercase hex string of the given length */
const generateRandomHex = (length: number): string => {
  const bytes = globalThis.crypto.getRandomValues(
    new Uint8Array(Math.ceil(length / 2)),
  );
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .slice(0, length);
};

/** Build the formatted document number from config parts */
const assembleNumber = (
  globalPrefix: string,
  prefix: string,
  separator: string,
  datePart: string,
  idPart: string,
): string => {
  const parts: string[] = [];
  if (globalPrefix) parts.push(globalPrefix);
  if (prefix) parts.push(prefix);
  if (datePart) parts.push(datePart);
  parts.push(idPart);
  return parts.join(separator);
};

/** Build the date segment from a format string */
const buildDatePart = (dateFormat: string | null): string => {
  if (!dateFormat) return "";
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  switch (dateFormat) {
    case "YYYY":
      return yyyy;
    case "YYMM":
      return `${yyyy.slice(2)}${mm}`;
    case "YYYYMM":
      return `${yyyy}${mm}`;
    default:
      return "";
  }
};

interface NumberingConfig {
  id: string;
  global_prefix: string | null;
  prefix: string;
  separator: string;
  date_format: string | null;
  id_strategy: string;
  sequential_padding: number;
  random_length: number;
  next_sequential_number: number;
}

export interface NextDocumentNumberInput {
  organizationId: string;
  documentType: string;
  companyId?: string | null;
  idStrategy?: string | null;
}

/**
 * Advance a workspace's numbering sequence and return the next document
 * number. Must run inside a transaction: the config row is locked (`FOR
 * UPDATE`) so concurrent callers never receive the same sequential number.
 * A per-client override applies when one exists for `companyId`, otherwise
 * the workspace default (created on first use)
 */
export const nextDocumentNumber = async (
  query: Query,
  {
    organizationId,
    documentType,
    companyId,
    idStrategy,
  }: NextDocumentNumberInput,
): Promise<string> => {
  let config: NumberingConfig | undefined;

  if (companyId) {
    [config] = await query<NumberingConfig>(
      `SELECT * FROM document_numbering_config
        WHERE organization_id = $1 AND document_type = $2 AND company_id = $3::uuid
          FOR UPDATE`,
      [organizationId, documentType, companyId],
    );
  }

  if (!config) {
    // Ensure the workspace default exists, then lock it
    await query(
      `INSERT INTO document_numbering_config
         (organization_id, document_type, prefix, separator, id_strategy,
          sequential_padding, random_length, next_sequential_number)
       VALUES ($1, $2, $3, '-', 'sequential', 4, 8, 1)
       ON CONFLICT DO NOTHING`,
      [organizationId, documentType, defaultPrefix(documentType)],
    );

    [config] = await query<NumberingConfig>(
      `SELECT * FROM document_numbering_config
        WHERE organization_id = $1 AND document_type = $2 AND company_id IS NULL
          FOR UPDATE`,
      [organizationId, documentType],
    );
  }

  if (!config) {
    throw new Error("Failed to resolve document numbering config");
  }

  const datePart = buildDatePart(config.date_format);

  // A per-call override wins over the workspace config
  const strategy = idStrategy ?? config.id_strategy;

  let idPart: string;

  if (strategy === "sequential") {
    await query(
      `UPDATE document_numbering_config
          SET next_sequential_number = next_sequential_number + 1,
              updated_at = now()
        WHERE id = $1`,
      [config.id],
    );

    idPart = String(config.next_sequential_number).padStart(
      config.sequential_padding,
      "0",
    );
  } else if (strategy === "timestamp") {
    // e.g. 20260203-115447, joined with the configured separator
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    const day = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    idPart = `${day}${config.separator}${time}`;
  } else {
    idPart = generateRandomHex(config.random_length);
  }

  return assembleNumber(
    config.global_prefix ?? "",
    config.prefix,
    config.separator,
    datePart,
    idPart,
  );
};
