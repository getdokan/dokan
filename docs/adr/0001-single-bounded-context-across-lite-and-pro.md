# Single bounded context across dokan-lite and dokan-pro

dokan-lite and dokan-pro are two repositories but one bounded context: Pro extends
Lite's classes, hooks, and container rather than talking to it across a boundary, and
every shared term (Vendor, Commission, Withdraw) means the same thing on both sides.
We therefore keep one canonical glossary in `dokan-lite/CONTEXT.md`; dokan-pro's
`CONTEXT.md` only adds Pro-only terms and never redefines Lite's.

ADRs live in the repo whose code they govern, with independent numbering per repo.
Cross-cutting decisions that span both repos are recorded in dokan-lite, because Pro
depends on Lite and never the reverse.

## Considered Options

- Two self-contained glossaries (one per repo) — rejected: shared terms would be
  defined twice and drift.
- A context map with per-subdomain contexts (commission, withdraw, each Pro module) —
  rejected as premature: everything shares one database, one hook bus, and one
  language; no term means different things in different places.
