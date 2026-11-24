---
"@omnidotdev/mantle-api": minor
---

Self-hosted instances can sign in through any OpenID Connect provider. With `PERSONAL_WORKSPACE_FALLBACK=true`, a caller whose token carries no workspace claims gets a personal workspace derived from their subject, so subjects that are not UUIDs (emails, `provider|id` pairs) work. Workspace ids now reach the database scope check as a properly quoted list, so an id containing a comma or brace can never grant access to another workspace.
