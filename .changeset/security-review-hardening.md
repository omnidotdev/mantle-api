---
"@omnidotdev/mantle-api": patch
---

Security: plan limits now hold when many contacts or invoices are created at once, including quote conversions racing with new invoices (parallel requests could previously all get through). A record's workspace can no longer be changed after it is created, and a record can only link to records in its own workspace; the invoice document and quote conversion only use the workspace's own company, contact and products. The credit ledger is append-only: credit is issued with `issueCredit` and applied with `applyInvoiceCredit`, and the generic create, update and delete operations for credit entries are removed. Access tokens can be pinned to this API with the new `AUTH_AUDIENCE` setting (and optionally `AUTH_ISSUER`), so a token issued for another product is refused.
