---
name: dokan-git
description: Guidelines for git and GitHub operations in the Dokan repository. Use when creating branches, commits, or pull requests.
---

# Dokan Git Guidelines

## Branch Strategy

- **Main development branch:** `develop`
- **Release branches:** `release/x.y.z`
- **Feature branches:** branch off `develop`

## Pull Requests

When creating PRs, follow the template at `.github/pull_request_template.md`.

### PR Checklist (from template)

- WordPress coding standards compliance
- PHPCS tests pass (`composer phpcs`)
- Inline documentation added
- Appropriate labels assigned
- Changelog entry with before/after description
- Screenshots for visual changes

### Review Criteria

PRs are reviewed for: **Correct**, **Secure**, **Readable**, **Elegant**.

## Pre-commit Checks

Before committing, run:

```bash
# PHP changes
composer phpcs

# JS/TS changes
npm run lint:js

# CSS changes
npm run lint:css
```

## CI Checks

PRs trigger:

1. **PHPCS** — Runs on changed files only (not entire codebase)
2. **PHPUnit** — Full test suite
3. **E2E tests** — Playwright (on applicable PRs)
