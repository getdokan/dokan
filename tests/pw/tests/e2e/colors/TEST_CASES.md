# Colors — Test Cases & Edge Cases

Concise plan; expand later. Refer to `tests/pw/CONVENTIONS.md` for tagging,
modal handling, and REST auth rules.

## Active tests

- admin can enable color scheme customizer module
- admin can switch predefined color palette
- (skipped) admin can add custom color palette
- (skipped) admin can update custom color palette
- admin can disable color scheme customizer module

## Conventions applied

- Self-contained page object (modal helper inlined where used).
- `'networkidle'` replaced with `'load'` (ESLint `playwright/no-networkidle`).
- All tests tagged with at least one of `@lite` / `@pro` plus role tag.

## Suggested follow-ups

1. Expand to a full edge-case matrix matching the abuse-reports template.
2. Pull selectors into well-named helpers in the page object where missing.
3. Add REST coverage where applicable.
