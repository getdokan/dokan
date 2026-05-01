# Email Verification — Test Cases & Edge Cases

Concise plan; expand later. Refer to `tests/pw/CONVENTIONS.md` for tagging,
modal handling, and REST auth rules.

## Active tests

- user can see registration notice (2-step auth) while registering as customer
- user can see registration notice (2-step auth) while loggingIn
- user registration process with field validation
- user login process with field validation

## Conventions applied

- Self-contained page object (modal helper inlined where used).
- `'networkidle'` replaced with `'load'` (ESLint `playwright/no-networkidle`).
- All tests tagged with at least one of `@lite` / `@pro` plus role tag.

## Suggested follow-ups

1. Expand to a full edge-case matrix matching the abuse-reports template.
2. Pull selectors into well-named helpers in the page object where missing.
3. Add REST coverage where applicable.
