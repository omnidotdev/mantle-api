import { sql } from "drizzle-orm";
import { EXPORTABLE } from "graphile-export";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

import { dbPool } from "lib/db/db";
import { documentNumberingConfigTable } from "lib/db/schema";

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
const generateRandomHex = (length: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .slice(0, length);
};

/**
 * Build the formatted document number from config parts.
 */
const assembleNumber = (
  prefix: string,
  separator: string,
  datePart: string,
  idPart: string,
): string => {
  const parts: string[] = [];
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
        (
          dbPool,
          documentNumberingConfigTable,
          sql,
          defaultPrefix,
          generateRandomHex,
          assembleNumber,
          buildDatePart,
        ) =>
          async (
            _parent: unknown,
            args: {
              input: { organizationId: string; documentType: string };
            },
          ) => {
            const { organizationId, documentType } = args.input;

            const documentNumber = await dbPool.transaction(async (tx) => {
              // Upsert default config if none exists
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
                .onConflictDoNothing({
                  target: [
                    documentNumberingConfigTable.organizationId,
                    documentNumberingConfigTable.documentType,
                  ],
                });

              // Lock and fetch config
              const result = await tx.execute(
                sql`SELECT * FROM document_numbering_config WHERE organization_id = ${organizationId} AND document_type = ${documentType} FOR UPDATE`,
              );
              const config = result.rows[0];

              const datePart = buildDatePart(
                config.date_format as string | null,
              );

              let idPart: string;

              if (config.id_strategy === "sequential") {
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
              } else {
                idPart = generateRandomHex(config.random_length as number);
              }

              return assembleNumber(
                config.prefix as string,
                config.separator as string,
                datePart,
                idPart,
              );
            });

            return { documentNumber };
          },
        [
          dbPool,
          documentNumberingConfigTable,
          sql,
          defaultPrefix,
          generateRandomHex,
          assembleNumber,
          buildDatePart,
        ],
      ),
    },
  },
});

export default GenerateDocumentNumberPlugin;
