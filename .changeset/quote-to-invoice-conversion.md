---
"@omnidotdev/mantle-api": minor
---

Turning a quote into an invoice is now a single `convertQuoteToInvoice` mutation: the invoice, its line items and the quote's converted status are saved together or not at all, a quote can only be invoiced once even from two tabs at the same time, and the conversion counts toward the plan's monthly invoice limit. Deleting an invoice made from a quote no longer fails; the quote goes back to accepted, ready to invoice again.
