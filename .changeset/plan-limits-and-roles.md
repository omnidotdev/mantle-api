---
"@omnidotdev/mantle-api": minor
---

Plan limits are now enforced for every workspace from its Omni plan: up to the plan's number of contacts (internal team members count too) and invoices created per month (deleting an invoice does not free a slot). A billing outage never blocks reading or editing existing records: the workspace's last known plan applies, and with none known nothing is blocked. Self-hosted deployments without billing configured have no plan limits. A new `workspacePlan` query reports a workspace's plan, limits and usage.

Security: a signed-in user could read another workspace's record by its id; every lookup is now limited to the caller's workspaces. Workspace settings, document numbering and sales channel connections can only be changed by workspace owners and admins, and stored sales channel credentials are never returned.
