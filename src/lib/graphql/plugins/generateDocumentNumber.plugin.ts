import { EXPORTABLE } from "graphile-export";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

/**
 * Default prefix per document type.
 */
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

/**
 * Generate uppercase hex string of given length.
 */
const generateRandomHex = EXPORTABLE(
  () =>
    (length: number): string => {
      const bytes = globalThis.crypto.getRandomValues(
        new Uint8Array(Math.ceil(length / 2)),
      );
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
        .slice(0, length);
    },
  [],
);

/**
 * Build the formatted document number from config parts.
 */
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

/**
 * Build the date segment from a format string.
 */
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

const GenerateDocumentNumberPlugin = makeExtendSchemaPlugin({
  typeDefs: gql`
		input GenerateDocumentNumberInput {
			organizationId: String!
			documentType: String!
			companyId: UUID
			idStrategy: String
		}

		type GenerateDocumentNumberPayload {
			documentNumber: String!
		}

		extend type Mutation {
			generateDocumentNumber(
				input: GenerateDocumentNumberInput!
			): GenerateDocumentNumberPayload
		}
	`,
  resolvers: {
    Mutation: {
      generateDocumentNumber: EXPORTABLE(
        (defaultPrefix, generateRandomHex, assembleNumber, buildDatePart) =>
          async (
            _parent: unknown,
            args: {
              input: {
                organizationId: string;
                documentType: string;
                companyId?: string;
                idStrategy?: string;
              };
            },
            context: { observer?: unknown; organizationIds?: string[] },
          ) => {
            // Lazy imports to avoid capturing class instances in EXPORTABLE
            const { sql } = await import("drizzle-orm");
            const { dbPool } = await import("lib/db/db");
            const { documentNumberingConfigTable } = await import(
              "lib/db/schema"
            );

            const { organizationId, documentType, companyId, idStrategy } =
              args.input;

            const { assertWorkspaceAccess } = await import(
              "lib/graphql/workspaceAccess"
            );
            // Advances the workspace's numbering sequence: members only
            assertWorkspaceAccess(context, args.input.organizationId);

            const documentNumber = await dbPool.transaction(async (tx) => {
              // Resolve the config to use: a per-client override when one exists
              // for this company, otherwise the workspace-wide default
              let config: Record<string, unknown> | undefined;

              if (companyId) {
                const clientResult = await tx.execute(
                  sql`SELECT * FROM document_numbering_config WHERE organization_id = ${organizationId} AND document_type = ${documentType} AND company_id = ${companyId}::uuid FOR UPDATE`,
                );
                config = clientResult.rows[0];
              }

              if (!config) {
                // Ensure the workspace default exists, then lock it
                await tx
                  .insert(documentNumberingConfigTable)
                  .values({
                    organizationId,
                    documentType,
                    prefix: defaultPrefix(documentType),
                    separator: "-",
                    idStrategy: "sequential",
                    sequentialPadding: 4,
                    randomLength: 8,
                    nextSequentialNumber: 1,
                  })
                  .onConflictDoNothing();

                const defaultResult = await tx.execute(
                  sql`SELECT * FROM document_numbering_config WHERE organization_id = ${organizationId} AND document_type = ${documentType} AND company_id IS NULL FOR UPDATE`,
                );
                config = defaultResult.rows[0];
              }

              if (!config) {
                throw new Error("Failed to resolve document numbering config");
              }

              const datePart = buildDatePart(
                config.date_format as string | null,
              );

              let idPart: string;

              // Use per-call override if provided, otherwise fall back to org config
              const strategy = idStrategy ?? config.id_strategy;

              if (strategy === "sequential") {
                const seqNum = config.next_sequential_number as number;

                // Increment counter
                await tx
                  .update(documentNumberingConfigTable)
                  .set({
                    nextSequentialNumber: sql`${documentNumberingConfigTable.nextSequentialNumber} + 1`,
                    updatedAt: sql`NOW()`,
                  })
                  .where(sql`id = ${config.id}`);

                idPart = String(seqNum).padStart(
                  config.sequential_padding as number,
                  "0",
                );
              } else if (strategy === "timestamp") {
                // e.g. 20260203-115447, joined with the configured separator
                const now = new Date();
                const pad = (value: number) => String(value).padStart(2, "0");
                const day = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
                const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
                idPart = `${day}${config.separator as string}${time}`;
              } else {
                idPart = generateRandomHex(config.random_length as number);
              }

              return assembleNumber(
                (config.global_prefix as string) ?? "",
                config.prefix as string,
                config.separator as string,
                datePart,
                idPart,
              );
            });

            return { documentNumber };
          },
        [defaultPrefix, generateRandomHex, assembleNumber, buildDatePart],
      ),
    },
  },
});

export default GenerateDocumentNumberPlugin;
