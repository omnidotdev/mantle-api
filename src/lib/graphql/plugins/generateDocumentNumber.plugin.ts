import { EXPORTABLE } from "graphile-export";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

/**
 * Hand out the next document number for a workspace (see
 * lib/documents/documentNumber)
 */
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
        () =>
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
            const { withTransaction } = await import("lib/db/transaction");
            const { nextDocumentNumber } = await import(
              "lib/documents/documentNumber"
            );
            const { assertWorkspaceAccess } = await import(
              "lib/graphql/workspaceAccess"
            );

            // Advances the workspace's numbering sequence: members only
            assertWorkspaceAccess(context, args.input.organizationId);

            const documentNumber = await withTransaction((query) =>
              nextDocumentNumber(query, args.input),
            );

            return { documentNumber };
          },
        [],
      ),
    },
  },
});

export default GenerateDocumentNumberPlugin;
