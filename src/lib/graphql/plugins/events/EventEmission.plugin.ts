import { EXPORTABLE } from "graphile-export";
import { events } from "lib/providers";
import { sideEffect } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Emit a domain event after a mutation succeeds.
 */
const emitOnMutate = (
	entity: string,
	action: "created" | "updated" | "deleted",
): PlanWrapperFn =>
	EXPORTABLE(
		(sideEffect, events, entity, action): PlanWrapperFn =>
			(plan, $record) => {
				sideEffect([$record], ([record]) => {
					if (!record?.id) return;

					void events.emit({
						type: `mantle.${entity}.${action}`,
						data: { id: record.id },
						subject: record.id,
					});
				});

				return plan();
			},
		[sideEffect, events, entity, action],
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
	},
});

export default EventEmissionPlugin;
