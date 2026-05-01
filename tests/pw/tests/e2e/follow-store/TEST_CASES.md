# Follow Store — Test Cases & Edge Cases

Concise plan; expand later. Refer to `tests/pw/CONVENTIONS.md` for tagging,
modal handling, and REST auth rules.

## Active tests

- admin can enable follow store module
- customer can view followed vendors via menu page
- customer can view followed vendors
- customer can follow store on store list page
- customer can follow store on single store
- customer can unfollow store on store list page
- customer can unfollow store on single store
- vendor can view followers menu page
- vendor can view followers
- admin can disable follow store module

## Conventions applied

- Self-contained page object (modal helper inlined where used).
- `'networkidle'` replaced with `'load'` (ESLint `playwright/no-networkidle`).
- All tests tagged with at least one of `@lite` / `@pro` plus role tag.

## Suggested follow-ups

1. Expand to a full edge-case matrix matching the abuse-reports template.
2. Pull selectors into well-named helpers in the page object where missing.
3. Add REST coverage where applicable.
