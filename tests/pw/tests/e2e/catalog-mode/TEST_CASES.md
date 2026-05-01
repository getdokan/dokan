# Catalog Mode — Test Cases & Edge Cases

Concise plan; expand later. Refer to `tests/pw/CONVENTIONS.md` for tagging,
modal handling, and REST auth rules.

## Active tests

- (skipped) admin can set catalog mode
- admin can disable hide product price in catalog mode
- vendor can set catalog mode (storewide)
- (skipped) vendor can set catalog mode (single product)
- vendor can disable hide product price in catalog mode
- (skipped) vendor can enable RFQ in catalog mode
- (skipped) customer can view product in catalog mode

## Conventions applied

- Self-contained page object (modal helper inlined where used).
- `'networkidle'` replaced with `'load'` (ESLint `playwright/no-networkidle`).
- All tests tagged with at least one of `@lite` / `@pro` plus role tag.

## Suggested follow-ups

1. Expand to a full edge-case matrix matching the abuse-reports template.
2. Pull selectors into well-named helpers in the page object where missing.
3. Add REST coverage where applicable.
