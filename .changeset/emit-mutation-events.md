---
"@omnidotdev/mantle-api": patch
---

Fix invoice, payment, quote, product, company, person, and document numbering changes never publishing their events, so invoices and payments now reach your books in MyFi and products reach Halo's catalog. Invoice events carry the total after recomputation
