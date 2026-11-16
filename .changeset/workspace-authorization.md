---
"@omnidotdev/mantle-api": patch
---

Security: every create, update and delete now requires you to belong to the workspace that owns the record (and to any record it links to). Issuing or applying credit and generating document numbers require workspace membership, payments and credit history are visible only to their workspace, and signed-out requests can no longer read records by id.
