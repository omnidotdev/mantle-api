---
"@omnidotdev/mantle-api": patch
---

Security: the API no longer turns off TLS certificate verification for its outgoing requests. A local development stack with self-signed certificates can opt out with `NODE_TLS_REJECT_UNAUTHORIZED=0`, which production ignores.
