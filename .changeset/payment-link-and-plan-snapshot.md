---
"@omnidotdev/mantle-api": patch
---

Invoice payment links must be a full https link (up to 2048 characters, without a username or password in it); anything else is refused when the invoice is saved, and the printable invoice only ever links to an https address. A workspace's plan is now remembered across restarts, so a restart during a billing outage keeps the workspace on its last known plan instead of lifting its limits.
