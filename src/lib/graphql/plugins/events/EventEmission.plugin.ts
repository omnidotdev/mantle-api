import { EXPORTABLE } from "graphile-export";
import { sideEffect } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Emit a domain event. Lazily loads the provider to avoid capturing
 * a class instance in EXPORTABLE closures.
 */
const emitEvent = EXPORTABLE(
	() =>
		(type: string, data: Record<string, unknown>, subject: string) => {
			// Lazy import avoids EXPORTABLE serialization of class instances
			import("lib/providers").then(({ events }) => {
				void events.emit({ type, data, subject });
			});
		},
	[],
);

/**
 * Emit a domain event after a mutation succeeds.
 */
const emitOnMutate = (
	entity: string,
	action: "created" | "updated" | "deleted",
): PlanWrapperFn =>
	EXPORTABLE(
		(sideEffect, emitEvent, entity, action): PlanWrapperFn =>
			(plan, $record) => {
				sideEffect([$record], ([record]) => {
					if (!record?.id) return;

					emitEvent(
						`mantle.${entity}.${action}`,
						{ id: record.id },
						record.id,
					);
				});

				return plan();
			},
		[sideEffect, emitEvent, entity, action],
	);

/**
 * Event emission plugin for Mantle mutations.
 *
 * Emits CloudEvents to Vortex for company, invoice, quote, product, and person lifecycle.
 */
const EventEmissionPlugin = wrapPlans({
	Mutation: {
		createCompany: emitOnMutate("company", "created"),
		updateCompany: emitOnMutate("company", "updated"),
		deleteCompany: emitOnMutate("company", "deleted"),
		createInvoice: emitOnMutate("invoice", "created"),
		updateInvoice: emitOnMutate("invoice", "updated"),
		deleteInvoice: emitOnMutate("invoice", "deleted"),
		createQuote: emitOnMutate("quote", "created"),
		updateQuote: emitOnMutate("quote", "updated"),
		deleteQuote: emitOnMutate("quote", "deleted"),
		createProduct: emitOnMutate("product", "created"),
		updateProduct: emitOnMutate("product", "updated"),
		deleteProduct: emitOnMutate("product", "deleted"),
		createPerson: emitOnMutate("person", "created"),
		updatePerson: emitOnMutate("person", "updated"),
		deletePerson: emitOnMutate("person", "deleted"),
		createDocumentNumberingConfig: emitOnMutate("documentNumberingConfig", "created"),
		updateDocumentNumberingConfig: emitOnMutate("documentNumberingConfig", "updated"),
		deleteDocumentNumberingConfig: emitOnMutate("documentNumberingConfig", "deleted"),
	},
});

export default EventEmissionPlugin;
